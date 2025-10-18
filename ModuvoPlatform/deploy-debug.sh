#!/usr/bin/env bash
set -euo pipefail

echo "🚀 Deploying Debug Moduvo Server..."
echo "==================================="

# Check if release archive exists
RELEASE_FILE="moduvo-contabo-export-20250907-135929.tar.gz"
if [ ! -f "$RELEASE_FILE" ]; then
    echo "❌ Release file $RELEASE_FILE not found!"
    exit 1
fi

echo "✅ Found release file: $RELEASE_FILE"
echo "📤 Uploading to VPS..."

# Upload using sshpass
sshpass -p "4169842811" scp "$RELEASE_FILE" root@185.239.208.204:/opt/

echo "✅ Upload complete!"
echo "🔐 Connecting to VPS and deploying..."

# Deploy using sshpass
sshpass -p "4169842811" ssh root@185.239.208.204 << 'DEPLOY_SCRIPT'
#!/usr/bin/env bash
set -euo pipefail

DOMAIN="moduvo.to"
APP_ROOT="/opt/moduvo"
ARCHIVE_TAR="/opt/moduvo-contabo-export-20250907-135929.tar.gz"
SERVICE_NAME="moduvo"
NODE_PORT="8000"

[ "$(id -u)" -eq 0 ] || { echo "Run as root"; exit 1; }

echo "==> Installing prerequisites"
apt-get update -y
DEBIAN_FRONTEND=noninteractive apt-get install -y nginx curl unzip tar ca-certificates
if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  DEBIAN_FRONTEND=noninteractive apt-get install -y nodejs
fi
npm i -g pm2 >/dev/null 2>&1 || npm i -g pm2
ufw allow 80 || true; ufw allow 443 || true

echo "==> Unpacking release to $APP_ROOT"
rm -rf "$APP_ROOT"
mkdir -p "$APP_ROOT"
tar -xzf "$ARCHIVE_TAR" -C "$APP_ROOT"

echo "==> Creating debug server"
cat > "$APP_ROOT/debug-server.js" << 'DEBUG_SERVER'
const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 8000;

console.log('Starting server on port:', PORT);
console.log('CORS origin:', process.env.CORS_ORIGIN);

// Middleware
app.use(cors({ 
  origin: process.env.CORS_ORIGIN?.split(',') || ['https://moduvo.to', 'https://www.moduvo.to'], 
  credentials: true 
}));
app.use(express.json());
app.use(cookieParser());

// Serve static files
app.use(express.static(path.join(__dirname, 'dist/public')));

// Health check
app.get('/healthz', (req, res) => {
  console.log('Health check requested');
  res.status(200).send('ok');
});

app.get('/api/health', (req, res) => {
  console.log('API health check requested');
  res.status(200).json({ status: 'ok' });
});

// Simple logout endpoint
app.post('/api/auth/logout', (req, res) => {
  console.log('Logout requested');
  res.clearCookie('auth_token');
  res.json({ success: true });
});

// Catch-all handler for client-side routing
app.get('*', (req, res) => {
  console.log('Catch-all route for:', req.path);
  res.sendFile(path.join(__dirname, 'dist/public/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Static files served from: ${path.join(__dirname, 'dist/public')}`);
});
DEBUG_SERVER

echo "==> Installing minimal dependencies"
pushd "$APP_ROOT" >/dev/null
npm init -y
npm install express cors cookie-parser
popd >/dev/null

echo "==> Testing server manually first"
cd "$APP_ROOT"
timeout 5s node debug-server.js || echo "Server test completed"

echo "==> Starting debug server with PM2 on :$NODE_PORT"
pm2 delete "$SERVICE_NAME" >/dev/null 2>&1 || true
pm2 start "$APP_ROOT/debug-server.js" --name "$SERVICE_NAME" --cwd "$APP_ROOT"
pm2 save

echo "==> Checking PM2 status"
pm2 status

echo "==> Testing server locally"
sleep 2
curl -s http://127.0.0.1:$NODE_PORT/healthz || echo "Local health check failed"
curl -s http://127.0.0.1:$NODE_PORT/api/health || echo "Local API health check failed"

echo "==> Configuring Nginx vhost for $DOMAIN"
cat >/etc/nginx/sites-available/$DOMAIN.conf <<NGX
server {
  listen 80;
  server_name $DOMAIN www.$DOMAIN;

  root $APP_ROOT/dist/public;
  index index.html;

  location /api/ {
    proxy_pass http://127.0.0.1:$NODE_PORT;
    proxy_http_version 1.1;
    proxy_set_header Host \$host;
    proxy_set_header X-Forwarded-Proto \$scheme;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
  }

  location / {
    try_files \$uri /index.html;
  }
}
NGX
ln -sf /etc/nginx/sites-available/$DOMAIN.conf /etc/nginx/sites-enabled/$DOMAIN.conf
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

echo "==> Final tests"
echo "PM2 status:"
pm2 status
echo "Local server test:"
curl -s http://127.0.0.1:$NODE_PORT/healthz || echo "Failed"
echo "External test:"
curl -I "http://$DOMAIN" || echo "Failed"
DEPLOY_SCRIPT

echo ""
echo "🎉 Debug deployment complete!"
echo "==================================="




