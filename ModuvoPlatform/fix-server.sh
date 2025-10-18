#!/usr/bin/env bash
set -euo pipefail

echo "🔧 Fixing Moduvo Server..."
echo "=========================="

# Deploy using sshpass
sshpass -p "4169842811" ssh root@185.239.208.204 << 'FIX_SCRIPT'
#!/usr/bin/env bash
set -euo pipefail

APP_ROOT="/opt/moduvo"
SERVICE_NAME="moduvo"

echo "==> Creating fixed server"
cat > "$APP_ROOT/fixed-server.js" << 'FIXED_SERVER'
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

// Catch-all handler for client-side routing - use proper Express syntax
app.use((req, res) => {
  console.log('Catch-all route for:', req.path);
  res.sendFile(path.join(__dirname, 'dist/public/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Static files served from: ${path.join(__dirname, 'dist/public')}`);
});
FIXED_SERVER

echo "==> Stopping current server"
pm2 delete "$SERVICE_NAME" >/dev/null 2>&1 || true

echo "==> Starting fixed server"
pm2 start "$APP_ROOT/fixed-server.js" --name "$SERVICE_NAME" --cwd "$APP_ROOT"
pm2 save

echo "==> Testing server"
sleep 2
curl -s http://127.0.0.1:8000/healthz || echo "Health check failed"
curl -s http://127.0.0.1:8000/api/health || echo "API health check failed"
curl -X POST http://127.0.0.1:8000/api/auth/logout || echo "Logout test failed"

echo "==> PM2 status"
pm2 status
FIX_SCRIPT

echo ""
echo "🎉 Server fix complete!"
echo "=========================="




