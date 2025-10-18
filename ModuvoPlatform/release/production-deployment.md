# Moduvo Platform - Production Deployment Guide

This guide covers the complete deployment of the Moduvo platform to a Contabo VPS with the moduvo.to domain and Migadu email service.

## Prerequisites

- Contabo VPS with Ubuntu 22.04 LTS
- Domain: moduvo.to (A/AAAA records pointing to server IP)
- Migadu email service configured
- PostgreSQL database (local or external)
- Google Cloud Storage bucket for assets

## Server Preparation

### 1. Initial Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y curl wget git nginx postgresql postgresql-contrib certbot python3-certbot-nginx ufw

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Configure firewall
sudo ufw allow OpenSSH
sudo ufw allow "Nginx Full"
sudo ufw enable

# Create application user
sudo useradd -m -s /bin/bash moduvo
sudo usermod -aG sudo moduvo
```

### 2. Database Setup

```bash
# Create database and user
sudo -u postgres psql << EOF
CREATE DATABASE moduvo_prod;
CREATE USER moduvo_user WITH ENCRYPTED PASSWORD 'secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE moduvo_prod TO moduvo_user;
ALTER DATABASE moduvo_prod OWNER TO moduvo_user;
\q
EOF
```

### 3. Application Deployment

```bash
# Create application directory
sudo mkdir -p /opt/moduvo
sudo chown moduvo:moduvo /opt/moduvo

# Clone repository (or deploy via CI/CD)
sudo -u moduvo git clone https://github.com/your-org/moduvo-platform.git /opt/moduvo

# Switch to application directory
cd /opt/moduvo

# Install dependencies
sudo -u moduvo npm ci --production

# Build application
sudo -u moduvo npm run build

# Create logs directory
sudo -u moduvo mkdir -p logs
```

### 4. Environment Configuration

```bash
# Create environment directory
sudo mkdir -p /etc/moduvo

# Copy environment file
sudo cp .env.production.example /etc/moduvo/env
sudo chown root:moduvo /etc/moduvo/env
sudo chmod 640 /etc/moduvo/env

# Edit environment file with production values
sudo nano /etc/moduvo/env
```

**Required environment variables:**

```bash
NODE_ENV=production
PORT=8080

# Database
DATABASE_URL=postgresql://moduvo_user:secure_password_here@localhost:5432/moduvo_prod

# Authentication
JWT_SECRET=your-super-secure-jwt-secret-here
SESSION_SECRET=your-super-secure-session-secret-here

# CORS (Production domains only)
CORS_ORIGIN=https://moduvo.to,https://www.moduvo.to

# Email (Migadu)
SMTP_HOST=smtp.migadu.com
SMTP_PORT=587
SMTP_USER=quotes@moduvo.to
SMTP_PASS=your-migadu-password
FROM_EMAIL=Moduvo Quotes <quotes@moduvo.to>

# Object Storage
GCS_BUCKET=moduvo-prod-assets
GOOGLE_APPLICATION_CREDENTIALS=/etc/moduvo/gcs-service-account.json

# Admin User
ADMIN_EMAIL=admin@moduvo.to
ADMIN_PASSWORD=secure-admin-password

# Application Settings
LOG_LEVEL=info
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=600
```

### 5. Service Configuration

```bash
# Install systemd service
sudo cp systemd/moduvo.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable moduvo.service

# Install nginx configuration
sudo cp nginx/moduvo.conf /etc/nginx/sites-available/moduvo
sudo ln -s /etc/nginx/sites-available/moduvo /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
sudo nginx -t

# Install log rotation
sudo cp logrotate/moduvo /etc/logrotate.d/
```

### 6. SSL Certificate

```bash
# Obtain SSL certificate
sudo certbot --nginx -d moduvo.to -d www.moduvo.to

# Verify auto-renewal
sudo systemctl status certbot.timer
```

### 7. Database Migration

```bash
# Run database migrations
sudo -u moduvo npm run db:push

# Create admin user
sudo -u moduvo node scripts/create-admin.js admin@moduvo.to secure-admin-password
```

### 8. Start Services

```bash
# Start and enable services
sudo systemctl start moduvo.service
sudo systemctl reload nginx

# Check service status
sudo systemctl status moduvo.service
sudo systemctl status nginx
```

## Domain and Email Configuration

### DNS Records (Configure at your domain registrar)

```
# A Records
moduvo.to.        3600    IN  A       YOUR_SERVER_IP
www.moduvo.to.    3600    IN  A       YOUR_SERVER_IP

# AAAA Records (if IPv6 available)
moduvo.to.        3600    IN  AAAA    YOUR_SERVER_IPV6
www.moduvo.to.    3600    IN  AAAA    YOUR_SERVER_IPV6

# MX Records (for Migadu)
moduvo.to.        3600    IN  MX  10  aspmx1.migadu.com.
moduvo.to.        3600    IN  MX  20  aspmx2.migadu.com.

# TXT Records (for Migadu)
moduvo.to.        3600    IN  TXT     "v=spf1 include:spf.migadu.com ~all"
moduvo.to.        3600    IN  TXT     "v=DMARC1; p=quarantine;"

# DKIM (get from Migadu dashboard)
key1._domainkey.moduvo.to. 3600 IN TXT "v=DKIM1; k=rsa; p=YOUR_DKIM_PUBLIC_KEY"
```

### Migadu Configuration

1. Add domain to Migadu dashboard
2. Create email addresses:
   - `quotes@moduvo.to` (for quote emails)
   - `admin@moduvo.to` (for admin notifications)
   - `support@moduvo.to` (for customer support)
3. Configure SMTP credentials in environment file

## Google Cloud Storage Setup

### 1. Create Service Account

```bash
# In Google Cloud Console:
# 1. Create a new service account
# 2. Download the JSON key file
# 3. Copy to server

sudo cp service-account-key.json /etc/moduvo/gcs-service-account.json
sudo chown moduvo:moduvo /etc/moduvo/gcs-service-account.json
sudo chmod 600 /etc/moduvo/gcs-service-account.json
```

### 2. Create Storage Bucket

```bash
# Create bucket for production assets
gsutil mb gs://moduvo-prod-assets

# Set public access for public objects
gsutil iam ch allUsers:objectViewer gs://moduvo-prod-assets/public

# Set lifecycle rules for cost optimization
gsutil lifecycle set bucket-lifecycle.json gs://moduvo-prod-assets
```

## Monitoring and Maintenance

### Log Monitoring

```bash
# View application logs
sudo journalctl -u moduvo.service -f

# View nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# View application-specific logs
sudo tail -f /opt/moduvo/logs/application.log
```

### Health Checks

```bash
# Application health
curl https://moduvo.to/healthz

# Database connection test
sudo -u moduvo psql $DATABASE_URL -c "SELECT 1;"

# Email test (from application)
curl -X POST https://moduvo.to/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"to": "test@example.com"}'
```

### Backup Strategy

```bash
# Database backup (daily cron job)
#!/bin/bash
BACKUP_DIR="/opt/moduvo/backups"
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL -Fc > $BACKUP_DIR/moduvo_$DATE.dump

# Clean old backups (keep 30 days)
find $BACKUP_DIR -name "moduvo_*.dump" -mtime +30 -delete

# Add to crontab
# 0 2 * * * /opt/moduvo/scripts/backup.sh
```

### Updates and Deployment

```bash
# Zero-downtime deployment script
#!/bin/bash
cd /opt/moduvo

# Pull latest changes
sudo -u moduvo git pull origin main

# Install dependencies
sudo -u moduvo npm ci --production

# Build application
sudo -u moduvo npm run build

# Run migrations
sudo -u moduvo npm run db:push

# Restart service
sudo systemctl restart moduvo.service

# Verify deployment
sleep 5
curl -f https://moduvo.to/healthz || echo "Health check failed"
```

## Security Checklist

- [ ] Firewall configured (UFW enabled)
- [ ] SSH key-based authentication only
- [ ] SSL certificates installed and auto-renewing
- [ ] Database user has minimal privileges
- [ ] Application runs as non-root user
- [ ] Environment files have restricted permissions
- [ ] Security headers configured in Nginx
- [ ] Rate limiting enabled
- [ ] Regular security updates scheduled

## Performance Optimization

### 1. Nginx Caching

```nginx
# Add to nginx config for static assets
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    gzip_static on;
}
```

### 2. Database Optimization

```sql
-- Create indexes for common queries
CREATE INDEX idx_quotes_user_id ON quotes(user_id);
CREATE INDEX idx_designs_user_id ON designs(user_id);
CREATE INDEX idx_quotes_status ON quotes(status);
CREATE INDEX idx_products_category ON products(category);
```

### 3. Application Monitoring

Install monitoring tools like:
- Prometheus + Grafana for metrics
- Sentry for error tracking
- Uptime monitoring service

## Troubleshooting

### Common Issues

1. **Service won't start**
   ```bash
   sudo journalctl -u moduvo.service --no-pager
   ```

2. **Database connection issues**
   ```bash
   sudo -u postgres psql -c "\l"
   sudo systemctl status postgresql
   ```

3. **SSL certificate issues**
   ```bash
   sudo certbot certificates
   sudo nginx -t
   ```

4. **Email delivery issues**
   ```bash
   # Check SMTP configuration
   telnet smtp.migadu.com 587
   ```

## Support and Documentation

- Application logs: `/opt/moduvo/logs/`
- Configuration: `/etc/moduvo/`
- Service status: `sudo systemctl status moduvo.service`
- Health endpoint: `https://moduvo.to/healthz`

For additional support, contact the development team or refer to the application documentation in the repository.