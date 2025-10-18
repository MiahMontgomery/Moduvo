#!/usr/bin/env bash
set -euo pipefail

echo "== Grep =="
grep -RIn "outDir: \"dist\"" client/vite.config.ts || true
grep -RIn "express.static(clientDir)" server/index.ts || true
grep -RIn "/healthz" server/index.ts || true
grep -RIn "app.get(\"\\*\"" server/index.ts || true
grep -RIn "requireAdmin" server || true
grep -RIn "/api/admin" server/routes.* || true
grep -RIn "calculateQuote" server/routes.* server/pricing.* || true

echo "== Build =="
npm run build

echo "== Smoke (node, prod mode) =="
PORT=8080 NODE_ENV=production \
JWT_SECRET=devSESSIONJWTSECRETSESSIONJWTSECRETSESSIONJWTSECRET \
SESSION_SECRET=devSESSIONSECRETSESSIONSECRETSESSIONSECRET \
CORS_ORIGIN=https://moduvo.to,https://www.moduvo.to \
DATABASE_URL=${DATABASE_URL:-postgresql://moduvo:password@127.0.0.1:5432/moduvo} \
SMTP_HOST=smtp.migadu.com SMTP_PORT=587 SMTP_USER=quotes@moduvo.to SMTP_PASS=xxx \
FROM_EMAIL="Moduvo Quotes <quotes@moduvo.to>" \
node server/dist/index.js > /tmp/moduvo.out 2>&1 &

APP_PID=$!

for i in {1..25}; do curl -sf http://127.0.0.1:8080/healthz && break || sleep 1; done
curl -sI http://127.0.0.1:8080/healthz | sed -n '1,30p'
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:8080/api/admin/quotes
kill $APP_PID || true; wait $APP_PID 2>/dev/null || true
echo OK