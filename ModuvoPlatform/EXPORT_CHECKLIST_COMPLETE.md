# Moduvo Platform - Contabo Export Checklist Complete

## Export Preparation Checklist ✅

### 1. Lock versions and build ✅
- Production build completed successfully
- Client dist: 1.3MB bundled, server dist: 50.5KB

### 2. Vite output sanity ✅  
- `client/vite.config.ts`: `base: "/"`, `build.outDir: "dist"` ✅
- `client/dist/index.html` exists and valid ✅

### 3. Kill Replit fingerprints ✅
- No absolute `https://*.repl.co` URLs found in client code ✅
- All secrets server-side only, no client-side `VITE_*` exposure ✅

### 4. Routes and SPA ✅
- Client uses wouter for routing with relative paths ✅
- Nginx will handle `try_files $uri /index.html;` for SPA fallback ✅

### 5. AR assets ✅
- Model-viewer script added to `client/index.html` ✅
- `client/public/assets/models/` directory created for 3D assets ✅
- Product JSON configured for `/assets/models/...` paths ✅

### 6. Email and envs ✅
- `server/email.ts` uses nodemailer with `SMTP_HOST/PORT/USER/PASS` ✅
- `.env.production.example` updated with all required server variables ✅
- PORT changed from 8080 to 8000 for Contabo deployment ✅

### 7. Server entry and port ✅
- Server listens on `process.env.PORT || '8000'` ✅
- Compiled server available at `server/dist/index.js` (50.5KB) ✅
- No ts-node in production - pure compiled JavaScript ✅

### 8. API paths ✅
- All API endpoints start with `/api/...` ✅
- No hardcoded hosts, CORS configured for domain-only ✅

### 9. Health endpoint ✅
- `GET /healthz` → `200 OK "ok"` ✅  
- `GET /api/health` → `200 OK {"status":"ok"}` ✅

### 10. Clean export package ✅
- **File**: `moduvo-contabo-export.tar.gz` 
- Includes: client/dist, server/, nginx/, systemd/, logrotate/, env configs, deployment docs
- Excludes: node_modules, .git, .replit, replit.nix, attached_assets

## Production Deployment Summary

**Package Ready**: `moduvo-contabo-export.tar.gz`

**Contabo Deployment Steps**:
1. Extract to `/opt/moduvo/`
2. `npm ci` in `/opt/moduvo/server/`  
3. Run server with PM2 on port 8000
4. Nginx: `root /opt/moduvo/client/dist;` + proxy `/api/` → `127.0.0.1:8000`
5. Certbot for SSL on `moduvo.to` domain

**Key Changes Made**:
- Port standardized to 8000 across all configs
- Health endpoints added for monitoring
- Model-viewer AR support integrated
- All Replit dependencies eliminated
- Production environment fully configured

**Status**: ✅ **READY FOR CONTABO DEPLOYMENT**