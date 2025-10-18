#!/usr/bin/env bash
set -euo pipefail

echo "🚀 Deploying Simple Moduvo Server..."
echo "===================================="

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

echo "==> Creating simple server"
cat > "$APP_ROOT/simple-server.js" << 'SIMPLE_SERVER'
const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 8000;

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
  res.status(200).send('ok');
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Simple logout endpoint
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('auth_token');
  res.json({ success: true });
});

// Catch-all handler for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/public/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
SIMPLE_SERVER

echo "==> Installing minimal dependencies"
pushd "$APP_ROOT" >/dev/null
npm init -y
npm install express cors cookie-parser
popd >/dev/null

echo "==> Starting simple server with PM2 on :$NODE_PORT"
pm2 delete "$SERVICE_NAME" >/dev/null 2>&1 || true
pm2 start "$APP_ROOT/simple-server.js" --name "$SERVICE_NAME" --cwd "$APP_ROOT"
pm2 save

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

echo "==> Attempting HTTPS with certbot (will skip on failure)"
if ! command -v certbot >/dev/null 2>&1; then
  DEBIAN_FRONTEND=noninteractive apt-get install -y certbot python3-certbot-nginx || true
fi
certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --redirect -m admin@"$DOMAIN" --agree-tos -n || true

echo "==> Smoke tests"
echo "Local API health:"
curl -sS http://127.0.0.1:$NODE_PORT/api/health || true
echo
echo "HTTP response:"
curl -I "http://$DOMAIN" || true
echo "HTTPS response:"
curl -I "https://$DOMAIN" || true

echo "==> Final verification"
pm2 status
echo "DONE - moduvo.to should now be live!"
DEPLOY_SCRIPT

echo ""
echo "🎉 Simple deployment complete!"
echo "===================================="
echo "Your website should now be live at:"
echo "  🌐 http://moduvo.to"
echo "  🔒 https://moduvo.to"
echo ""
echo "To verify the deployment:"
echo "  ssh root@185.239.208.204"
echo "  pm2 status"
echo "  curl -I http://moduvo.to"




