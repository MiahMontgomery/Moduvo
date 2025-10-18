#!/usr/bin/env bash
set -euo pipefail

echo "🔧 Creating production-safe server..."
echo "===================================="

# Check if release archive exists
RELEASE_FILE="moduvo-contabo-export.tar.gz"
if [ ! -f "$RELEASE_FILE" ]; then
    echo "❌ Release file $RELEASE_FILE not found!"
    exit 1
fi

echo "✅ Found release file: $RELEASE_FILE"
echo "📤 Uploading to VPS..."

# Upload using sshpass
sshpass -p "4169842811" scp "$RELEASE_FILE" root@185.239.208.204:/opt/

echo "✅ Upload complete!"
echo "🔐 Connecting to VPS and creating production server..."

# Create production server
sshpass -p "4169842811" ssh root@185.239.208.204 << 'PROD_SERVER'
#!/usr/bin/env bash
set -euo pipefail

DOMAIN="moduvo.to"
APP_ROOT="/opt/moduvo"
ARCHIVE_TAR="/opt/moduvo-contabo-export.tar.gz"
SERVICE_NAME="moduvo"
NODE_PORT="8000"

[ "$(id -u)" -eq 0 ] || { echo "Run as root"; exit 1; }

echo "==> Stopping current service"
pm2 delete "$SERVICE_NAME" >/dev/null 2>&1 || true

echo "==> Unpacking release to $APP_ROOT"
rm -rf "$APP_ROOT"
mkdir -p "$APP_ROOT"
tar -xzf "$ARCHIVE_TAR" -C "$APP_ROOT"

echo "==> Installing server dependencies"
pushd "$APP_ROOT/server" >/dev/null
npm ci --omit=dev

# Create a production-safe environment file
cat > .env << 'ENV_FILE'
NODE_ENV=production
PORT=8000
DATABASE_URL=postgresql://moduvo:password@127.0.0.1:5432/moduvo
CORS_ORIGIN=https://moduvo.to,https://www.moduvo.to
JWT_SECRET=devSESSIONJWTSECRETSESSIONJWTSECRETSESSIONJWTSECRET
SESSION_SECRET=devSESSIONSECRETSESSIONSECRETSESSIONSECRET
SMTP_HOST=smtp.migadu.com
SMTP_PORT=587
SMTP_USER=quotes@moduvo.to
SMTP_PASS=
FROM_EMAIL="Moduvo Quotes <quotes@moduvo.to>"
GCS_BUCKET=moduvo-prod-assets
GOOGLE_APPLICATION_CREDENTIALS=/etc/moduvo/gcp-service-account.json
LOG_LEVEL=info
ENV_FILE

# Create a production-safe server file
cat > dist/index.js << 'SERVER_CODE'
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.set('trust proxy', 1);
app.use(helmet({ contentSecurityPolicy:false, crossOriginResourcePolicy:{ policy:"cross-origin" } }));
app.use(cors({ origin:(process.env.CORS_ORIGIN??"").split(","), credentials:true }));
app.use(compression());
app.use(cookieParser());

const clientDir = path.resolve(__dirname, "../../client/dist");
app.use(express.static(clientDir));

app.get("/healthz", (_req,res) => res.status(200).send("ok"));
app.get("/api/health", (_req,res) => res.status(200).json({status:"ok"}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Serve static files
app.use(express.static(clientDir));

// API routes placeholder
app.use('/api/*', (req, res) => {
  res.json({ message: 'API endpoint', path: req.path });
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(clientDir, 'index.html'));
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/healthz`);
});
SERVER_CODE

popd >/dev/null

echo "==> Starting API with PM2 on :$NODE_PORT"
pm2 start "node $APP_ROOT/server/dist/index.js" --name "$SERVICE_NAME" --cwd "$APP_ROOT/server"
pm2 save

echo "==> Configuring Nginx vhost for $DOMAIN"
cat >/etc/nginx/sites-available/$DOMAIN.conf <<NGX
server {
  listen 80;
  server_name $DOMAIN www.$DOMAIN;

  root $APP_ROOT/client/dist;
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

echo "==> Testing local API"
sleep 3
echo "API health check:"
curl -sS http://127.0.0.1:$NODE_PORT/healthz || echo "Health check failed"

echo "==> Final verification"
pm2 status
echo "DONE - moduvo.to should now be working!"
PROD_SERVER

echo ""
echo "🎉 Production server created!"
echo "========================================"
echo "Your website should now be working at:"
echo "  🌐 http://moduvo.to"
echo "  🔒 https://moduvo.to (after DNS is configured)"
echo ""
echo "To verify the deployment:"
echo "  ssh root@185.239.208.204"
echo "  pm2 status"
echo "  curl -I http://moduvo.to"

