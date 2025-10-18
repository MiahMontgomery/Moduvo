# Moduvo Platform - Deployment Checklist

## Pre-Deployment Verification

### Code Quality
- [ ] All tests passing
- [ ] No TypeScript compilation errors
- [ ] Production build completes successfully
- [ ] Environment variables documented and validated
- [ ] Security vulnerabilities addressed (npm audit)

### Database
- [ ] Database schema migrations tested
- [ ] Backup and restore procedures tested
- [ ] Connection pooling configured
- [ ] Performance indexes created
- [ ] Data seeding scripts ready

### Authentication System
- [ ] JWT token generation and validation working
- [ ] Password hashing implemented correctly
- [ ] Session management configured
- [ ] Admin user creation process tested
- [ ] Role-based access control verified

## Infrastructure Setup

### Server Configuration
- [ ] Contabo VPS provisioned and accessible
- [ ] Ubuntu 22.04 LTS installed and updated
- [ ] Firewall configured (UFW enabled)
- [ ] SSH key-based authentication configured
- [ ] Required software installed (Node.js 20, nginx, PostgreSQL)
- [ ] Application user created (moduvo)
- [ ] Directory structure created (/opt/moduvo)

### Domain and DNS
- [ ] Domain moduvo.to ownership verified
- [ ] A records configured (@ and www)
- [ ] AAAA records configured if IPv6 available
- [ ] DNS propagation verified (dig commands)
- [ ] TTL values set appropriately

### SSL Certificates
- [ ] Let's Encrypt certificates obtained
- [ ] Certificate auto-renewal configured
- [ ] Nginx SSL configuration tested
- [ ] HTTPS redirect working
- [ ] SSL Labs rating A or higher

### Email Service (Migadu)
- [ ] Domain added to Migadu dashboard
- [ ] MX records configured
- [ ] SPF record configured (include:spf.migadu.com)
- [ ] DKIM keys configured
- [ ] DMARC policy configured
- [ ] Email addresses created (quotes@, admin@, support@)
- [ ] SMTP credentials tested

## Application Deployment

### Code Deployment
- [ ] Repository cloned to /opt/moduvo
- [ ] Production dependencies installed (npm ci --production)
- [ ] Application built successfully (npm run build)
- [ ] File permissions set correctly
- [ ] Environment configuration file created

### Environment Configuration
- [ ] Production environment file (/etc/moduvo/env) created
- [ ] Database connection string configured
- [ ] JWT and session secrets generated
- [ ] SMTP credentials configured
- [ ] CORS origins restricted to production domains
- [ ] File permissions restricted (640)

### Database Setup
- [ ] PostgreSQL database created (moduvo_prod)
- [ ] Database user created with appropriate privileges
- [ ] Database migrations executed (npm run db:push)
- [ ] Initial data seeded if required
- [ ] Connection tested from application

### Object Storage
- [ ] Google Cloud Storage bucket created (moduvo-prod-assets)
- [ ] Service account created and configured
- [ ] Bucket permissions configured correctly
- [ ] Test file upload and retrieval working
- [ ] CDN configuration if applicable

## Service Configuration

### Systemd Service
- [ ] Service file installed (/etc/systemd/system/moduvo.service)
- [ ] Service enabled for auto-start
- [ ] Service starts successfully
- [ ] Application health check responding
- [ ] Resource limits configured appropriately

### Nginx Configuration
- [ ] Nginx configuration file installed
- [ ] Configuration syntax validated (nginx -t)
- [ ] Rate limiting configured
- [ ] Security headers configured
- [ ] Gzip compression enabled
- [ ] Static file caching configured
- [ ] Reverse proxy to application working

### Log Management
- [ ] Application logs directory created
- [ ] Log rotation configured (logrotate)
- [ ] Systemd journal configuration verified
- [ ] Application log level set appropriately
- [ ] Error monitoring configured

## Security Verification

### Network Security
- [ ] Firewall rules tested and minimal
- [ ] Only required ports open (22, 80, 443)
- [ ] SSH configuration hardened
- [ ] Fail2ban configured for brute force protection
- [ ] Network monitoring configured

### Application Security
- [ ] Authentication middleware working
- [ ] Authorization checks verified
- [ ] Input validation implemented
- [ ] SQL injection protection verified
- [ ] XSS protection enabled
- [ ] CSRF protection implemented
- [ ] Security headers verified

### Data Protection
- [ ] Database access restricted
- [ ] Environment variables protected
- [ ] File system permissions minimal
- [ ] Backup encryption configured
- [ ] Secret management verified

## Performance and Monitoring

### Performance Testing
- [ ] Load testing completed
- [ ] Database query performance verified
- [ ] Static asset loading optimized
- [ ] CDN configuration tested
- [ ] Caching strategies implemented

### Monitoring Setup
- [ ] Application health endpoint working (/healthz)
- [ ] Server resource monitoring configured
- [ ] Application error tracking setup
- [ ] Database performance monitoring
- [ ] Uptime monitoring configured

### Backup and Recovery
- [ ] Database backup script created and tested
- [ ] Backup storage configured
- [ ] Restore procedure documented and tested
- [ ] Backup retention policy implemented
- [ ] Disaster recovery plan documented

## Post-Deployment Verification

### Functional Testing
- [ ] Application loads correctly
- [ ] User registration working
- [ ] User login working
- [ ] Product catalog accessible
- [ ] Quote generation working
- [ ] Email delivery working
- [ ] File upload working
- [ ] Admin functionality accessible

### Integration Testing
- [ ] Payment processing (if implemented)
- [ ] Third-party APIs working
- [ ] Email templates rendering correctly
- [ ] Mobile responsiveness verified
- [ ] Cross-browser compatibility tested

### User Acceptance
- [ ] Admin user created and tested
- [ ] Sample customer journey completed
- [ ] Performance meets requirements
- [ ] UI/UX functioning as expected
- [ ] Content and branding correct

## Go-Live Checklist

### Final Preparations
- [ ] All deployment checklist items completed
- [ ] Rollback plan prepared and tested
- [ ] Support team notified
- [ ] Documentation updated
- [ ] Monitoring alerts configured

### Launch Day
- [ ] DNS cutover completed
- [ ] Application responding correctly
- [ ] Certificate warnings resolved
- [ ] Analytics tracking verified
- [ ] Search engine configurations updated

### Post-Launch
- [ ] Performance monitoring active
- [ ] Error rates within acceptable limits
- [ ] User feedback collection enabled
- [ ] Support processes activated
- [ ] First 24-hour review scheduled

## Maintenance and Support

### Regular Tasks
- [ ] Security updates scheduled
- [ ] Backup verification automated
- [ ] Log monitoring configured
- [ ] Performance review scheduled
- [ ] Capacity planning documented

### Emergency Procedures
- [ ] Incident response plan documented
- [ ] Emergency contacts defined
- [ ] Rollback procedures tested
- [ ] Communication plan prepared
- [ ] Escalation paths defined

---

**Deployment Sign-off:**
- [ ] Technical Lead: _________________ Date: _________
- [ ] DevOps Engineer: ______________ Date: _________
- [ ] Security Officer: _____________ Date: _________
- [ ] Project Manager: ______________ Date: _________

**Notes:**
_Use this section to document any deviations from the standard process or additional considerations specific to this deployment._