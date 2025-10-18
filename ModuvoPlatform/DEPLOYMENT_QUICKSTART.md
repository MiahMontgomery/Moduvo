# Moduvo Platform - Quick Deployment Guide

## 🚀 Deployment Options

You have several options for deploying your Moduvo Platform:

### 1. Local Development Server
For development and testing:
```bash
npm run dev
```

### 2. Local Production Testing
Test the production build locally:
```bash
./deploy-local.sh
```
**Note:** Requires a PostgreSQL database and proper `.env.production` configuration.

### 3. Production Deployment (Contabo VPS)
Deploy to your production server:
```bash
export SERVER_IP=your_server_ip_here
./deploy-production.sh
```

## 📋 Prerequisites

### For Local Production Testing:
- PostgreSQL database running
- Node.js 20+
- Proper `.env.production` configuration

### For Production Deployment:
- Contabo VPS with Ubuntu 22.04 LTS
- SSH key-based authentication configured
- PostgreSQL database on the server
- Domain `moduvo.to` configured with DNS records

## 🔧 Environment Configuration

### 1. Create Production Environment File
```bash
cp .env.production.example .env.production
```

### 2. Edit `.env.production` with your values:
```bash
NODE_ENV=production
PORT=8000
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
CORS_ORIGIN=https://moduvo.to,https://www.moduvo.to
JWT_SECRET=your-64-character-random-string-here
SESSION_SECRET=your-64-character-random-string-here
SMTP_HOST=smtp.migadu.com
SMTP_PORT=587
SMTP_USER=quotes@moduvo.to
SMTP_PASS=your_migadu_password
FROM_EMAIL="Moduvo Quotes <quotes@moduvo.to>"
GCS_BUCKET=moduvo-prod-assets
GOOGLE_APPLICATION_CREDENTIALS=/etc/moduvo/gcp-service-account.json
LOG_LEVEL=info
```

## 🗄️ Database Setup

### Local PostgreSQL:
```bash
# Install PostgreSQL (macOS)
brew install postgresql
brew services start postgresql

# Create database
createdb moduvo
```

### Production Database:
Follow the detailed guide in `production-deployment.md`

## 🚀 Quick Start Commands

### Build the application:
```bash
npm run build
```

### Test production build locally:
```bash
./deploy-local.sh
```

### Deploy to production:
```bash
export SERVER_IP=your_server_ip
./deploy-production.sh
```

### Validate deployment:
```bash
./scripts/validate.sh
```

## 📁 Project Structure

```
ModuvoPlatform/
├── client/                 # React frontend
├── server/                 # Express backend
├── shared/                 # Shared database schema
├── dist/                   # Built application
├── nginx/                  # Nginx configuration
├── systemd/                # Systemd service files
├── scripts/                # Utility scripts
├── deploy-local.sh         # Local deployment script
├── deploy-production.sh    # Production deployment script
└── production-deployment.md # Detailed production guide
```

## 🔍 Health Checks

- **Application Health:** `http://localhost:8000/healthz`
- **API Health:** `http://localhost:8000/api/health`
- **Frontend:** `http://localhost:8000/`

## 🆘 Troubleshooting

### Build Issues:
```bash
npm install
npm run build
```

### Database Connection:
- Check PostgreSQL is running
- Verify DATABASE_URL in `.env.production`
- Test connection: `psql $DATABASE_URL -c "SELECT 1;"`

### Service Issues:
```bash
# Check service status
sudo systemctl status moduvo.service

# View logs
sudo journalctl -u moduvo.service -f

# Check nginx
sudo nginx -t
sudo systemctl status nginx
```

## 📚 Additional Resources

- **Production Deployment:** See `production-deployment.md`
- **Deployment Checklist:** See `DEPLOYMENT_CHECKLIST.md`
- **Server Configuration:** See `nginx/` and `systemd/` directories

## 🎯 Next Steps

1. **Choose your deployment target** (local testing vs production)
2. **Configure environment variables** in `.env.production`
3. **Set up database** (local or production)
4. **Run deployment script** (`./deploy-local.sh` or `./deploy-production.sh`)
5. **Verify deployment** with health checks
6. **Configure SSL certificates** for production
7. **Set up monitoring and backups**

---

**Need help?** Check the detailed guides or run the validation script: `./scripts/validate.sh`

