#!/bin/bash
set -euo pipefail

# Production Deployment Script for Moduvo Platform
# This script deploys to a Contabo VPS server

SERVER_IP="${SERVER_IP:-}"
SERVER_USER="${SERVER_USER:-moduvo}"
APP_DIR="/opt/moduvo"
BACKUP_DIR="/opt/moduvo/backups"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if [ -z "$SERVER_IP" ]; then
        print_error "SERVER_IP environment variable not set"
        echo "Please set SERVER_IP before running this script:"
        echo "export SERVER_IP=your_server_ip_here"
        exit 1
    fi
    
    if ! command -v ssh &> /dev/null; then
        print_error "SSH client not found. Please install OpenSSH client."
        exit 1
    fi
    
    if ! command -v rsync &> /dev/null; then
        print_error "rsync not found. Please install rsync."
        exit 1
    fi
    
    print_success "Prerequisites check passed"
}

# Build the application
build_application() {
    print_status "Building application..."
    
    if ! npm run build; then
        print_error "Build failed"
        exit 1
    fi
    
    print_success "Application built successfully"
}

# Create deployment package
create_deployment_package() {
    print_status "Creating deployment package..."
    
    # Create a temporary deployment directory
    DEPLOY_DIR="deploy-temp"
    rm -rf "$DEPLOY_DIR"
    mkdir -p "$DEPLOY_DIR"
    
    # Copy necessary files
    cp -r dist/ "$DEPLOY_DIR/"
    cp -r nginx/ "$DEPLOY_DIR/"
    cp -r systemd/ "$DEPLOY_DIR/"
    cp -r logrotate/ "$DEPLOY_DIR/"
    cp -r scripts/ "$DEPLOY_DIR/"
    cp package-production.json "$DEPLOY_DIR/package.json"
    cp drizzle.config.ts "$DEPLOY_DIR/"
    cp -r shared/ "$DEPLOY_DIR/"
    
    # Create production environment file if it doesn't exist
    if [ ! -f ".env.production" ]; then
        print_warning ".env.production not found. Creating from template..."
        cp .env.production.example "$DEPLOY_DIR/.env.production"
        print_warning "Please edit .env.production on the server with your actual values"
    else
        cp .env.production "$DEPLOY_DIR/"
    fi
    
    print_success "Deployment package created"
}

# Deploy to server
deploy_to_server() {
    print_status "Deploying to server $SERVER_IP..."
    
    # Test SSH connection
    if ! ssh -o ConnectTimeout=10 -o BatchMode=yes "$SERVER_USER@$SERVER_IP" "echo 'SSH connection successful'" 2>/dev/null; then
        print_error "Cannot connect to server. Please check:"
        echo "  - Server IP: $SERVER_IP"
        echo "  - SSH key authentication"
        echo "  - Server accessibility"
        exit 1
    fi
    
    # Create backup on server
    print_status "Creating backup on server..."
    ssh "$SERVER_USER@$SERVER_IP" "mkdir -p $BACKUP_DIR && if [ -d $APP_DIR ]; then tar -czf $BACKUP_DIR/moduvo-backup-\$(date +%Y%m%d-%H%M%S).tar.gz -C $APP_DIR .; fi"
    
    # Stop the service if it's running
    print_status "Stopping moduvo service..."
    ssh "$SERVER_USER@$SERVER_IP" "sudo systemctl stop moduvo.service || true"
    
    # Sync files to server
    print_status "Syncing files to server..."
    rsync -avz --delete "$DEPLOY_DIR/" "$SERVER_USER@$SERVER_IP:$APP_DIR/"
    
    # Set correct permissions
    print_status "Setting file permissions..."
    ssh "$SERVER_USER@$SERVER_IP" "sudo chown -R $SERVER_USER:$SERVER_USER $APP_DIR"
    ssh "$SERVER_USER@$SERVER_IP" "chmod +x $APP_DIR/scripts/*.sh"
    
    # Install production dependencies
    print_status "Installing production dependencies..."
    ssh "$SERVER_USER@$SERVER_IP" "cd $APP_DIR && npm ci --production"
    
    # Run database migrations
    print_status "Running database migrations..."
    ssh "$SERVER_USER@$SERVER_IP" "cd $APP_DIR && npm run db:push"
    
    # Install systemd service
    print_status "Installing systemd service..."
    ssh "$SERVER_USER@$SERVER_IP" "sudo cp $APP_DIR/systemd/moduvo.service /etc/systemd/system/ && sudo systemctl daemon-reload"
    
    # Install nginx configuration
    print_status "Installing nginx configuration..."
    ssh "$SERVER_USER@$SERVER_IP" "sudo cp $APP_DIR/nginx/moduvo.conf /etc/nginx/sites-available/moduvo && sudo ln -sf /etc/nginx/sites-available/moduvo /etc/nginx/sites-enabled/ && sudo rm -f /etc/nginx/sites-enabled/default"
    
    # Install log rotation
    print_status "Installing log rotation..."
    ssh "$SERVER_USER@$SERVER_IP" "sudo cp $APP_DIR/logrotate/moduvo /etc/logrotate.d/"
    
    # Test nginx configuration
    print_status "Testing nginx configuration..."
    if ! ssh "$SERVER_USER@$SERVER_IP" "sudo nginx -t"; then
        print_error "Nginx configuration test failed"
        exit 1
    fi
    
    # Start services
    print_status "Starting services..."
    ssh "$SERVER_USER@$SERVER_IP" "sudo systemctl enable moduvo.service && sudo systemctl start moduvo.service && sudo systemctl reload nginx"
    
    # Wait for service to start
    print_status "Waiting for service to start..."
    sleep 5
    
    # Test the deployment
    print_status "Testing deployment..."
    if ssh "$SERVER_USER@$SERVER_IP" "curl -f http://localhost:8000/healthz" 2>/dev/null; then
        print_success "Health check passed"
    else
        print_warning "Health check failed - service may still be starting"
    fi
    
    print_success "Deployment completed successfully!"
}

# Cleanup
cleanup() {
    print_status "Cleaning up..."
    rm -rf "deploy-temp"
    print_success "Cleanup completed"
}

# Main deployment flow
main() {
    echo "🚀 Moduvo Platform Production Deployment"
    echo "========================================"
    echo "Server: $SERVER_IP"
    echo "User: $SERVER_USER"
    echo "App Directory: $APP_DIR"
    echo ""
    
    check_prerequisites
    build_application
    create_deployment_package
    deploy_to_server
    cleanup
    
    echo ""
    print_success "🎉 Deployment completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Verify the application is running: ssh $SERVER_USER@$SERVER_IP 'sudo systemctl status moduvo.service'"
    echo "2. Check nginx status: ssh $SERVER_USER@$SERVER_IP 'sudo systemctl status nginx'"
    echo "3. Test the application: curl http://$SERVER_IP/healthz"
    echo "4. Configure SSL certificates: ssh $SERVER_USER@$SERVER_IP 'sudo certbot --nginx -d moduvo.to -d www.moduvo.to'"
    echo "5. Set up monitoring and backups"
}

# Run main function
main "$@"

