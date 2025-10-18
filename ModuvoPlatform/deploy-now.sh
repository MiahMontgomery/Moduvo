#!/usr/bin/env bash
set -euo pipefail

echo "🚀 Deploying Moduvo Platform to VPS..."
echo "========================================"

# Check if release archive exists
RELEASE_FILE="moduvo-contabo-export.tar.gz"
if [ ! -f "$RELEASE_FILE" ]; then
    echo "❌ Release file $RELEASE_FILE not found!"
    echo "Please ensure the release archive is in the current directory."
    exit 1
fi

echo "✅ Found release file: $RELEASE_FILE"
echo "📤 Uploading to VPS..."

# Upload the release archive
echo "Please enter your VPS root password when prompted:"
scp "$RELEASE_FILE" root@185.239.208.204:/opt/

echo "✅ Upload complete!"
echo "🔐 Connecting to VPS..."

# Create the deployment script on the VPS
ssh root@185.239.208.204 << 'DEPLOY_SCRIPT'
#!/usr/bin/env bash
set -euo pipefail

DOMAIN="moduvo.to"
APP_ROOT="/opt/moduvo"
ARCHIVE_TAR="/opt/moduvo-contabo-export.tar.gz"
ARCHIVE_ZIP="/opt/moduvo-contabo-export.zip"
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
if [ -f "$ARCHIVE_TAR" ]; then
  tar -xzf "$ARCHIVE_TAR" -C "$APP_ROOT"
elif [ -f "$ARCHIVE_ZIP" ]; then
  unzip -q "$ARCHIVE_ZIP" -d "$APP_ROOT"
else
  echo "Release archive not found at $ARCHIVE_TAR or $ARCHIVE_ZIP"; exit 1
fi

echo "==> Installing server dependencies"
pushd "$APP_ROOT/server" >/dev/null
npm ci --omit=dev
[ -f dist/index.js ] || (npm run build || npx tsc)
[ -f .env ] || cp -n .env.production.example .env || true
grep -q '^PORT=' .env || echo "PORT=$NODE_PORT" >> .env
popd >/dev/null

echo "==> Starting API with PM2 on :$NODE_PORT"
pm2 delete "$SERVICE_NAME" >/dev/null 2>&1 || true
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
echo "🎉 Deployment complete!"
echo "========================================"
echo "Your website should now be live at:"
echo "  🌐 http://moduvo.to"
echo "  🔒 https://moduvo.to"
echo ""
echo "To verify the deployment:"
echo "  ssh root@185.239.208.204"
echo "  pm2 status"
echo "  curl -I http://moduvo.to"

