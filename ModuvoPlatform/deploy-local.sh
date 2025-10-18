#!/bin/bash
set -euo pipefail

echo "🚀 Deploying Moduvo Platform Locally..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Build the application
echo "📦 Building application..."
npm run build

# Check if build was successful
if [ ! -f "dist/index.js" ]; then
    echo "❌ Build failed - dist/index.js not found"
    exit 1
fi

echo "✅ Build successful!"

# Check if we have a .env.production file
if [ ! -f ".env.production" ]; then
    echo "⚠️  Warning: .env.production not found. Creating from template..."
    cp .env.production.example .env.production
    echo "📝 Please edit .env.production with your actual values before running"
    echo "   Key values to set:"
    echo "   - DATABASE_URL (PostgreSQL connection string)"
    echo "   - JWT_SECRET (64 character random string)"
    echo "   - SESSION_SECRET (64 character random string)"
    echo "   - SMTP credentials for email functionality"
    exit 1
fi

# Load environment variables
echo "🔧 Loading environment variables..."
export $(cat .env.production | grep -v '^#' | xargs)

# Check if database is accessible
echo "🗄️  Testing database connection..."
if ! node -e "
import('pg').then(async ({ Client }) => {
  try {
    const client = new Client(process.env.DATABASE_URL);
    await client.connect();
    await client.query('SELECT 1');
    await client.end();
    console.log('✅ Database connection successful');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
});
" 2>/dev/null; then
    echo "❌ Database connection failed. Please check your DATABASE_URL in .env.production"
    echo "   Example: postgresql://username:password@localhost:5432/database_name"
    exit 1
fi

# Run database migrations
echo "🔄 Running database migrations..."
npm run db:push

# Start the production server
echo "🚀 Starting production server..."
echo "   Server will be available at: http://localhost:${PORT:-8000}"
echo "   Health check: http://localhost:${PORT:-8000}/healthz"
echo "   Press Ctrl+C to stop the server"
echo ""

NODE_ENV=production node dist/index.js

