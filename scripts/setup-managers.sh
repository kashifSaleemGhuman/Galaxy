#!/bin/bash

# Galaxy ERP Manager Setup Script
# This script creates all manager users with proper roles and permissions

echo "🚀 Galaxy ERP Manager Setup"
echo "=========================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the Galaxy ERP root directory"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install --legacy-peer-deps
fi

# Check if database is running
echo "🔍 Checking database connection..."
if ! npm run postgres:cli -- -c "SELECT 1;" > /dev/null 2>&1; then
    echo "❌ Database not accessible. Please start the database first:"
    echo "   docker-compose up -d postgres"
    echo "   npm run db:push"
    exit 1
fi

echo "✅ Database connection successful"
echo ""

# Run the manager creation script
echo "👥 Creating managers..."
node scripts/create-managers.js

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Start the development server: npm run dev"
echo "2. Open http://localhost:3000"
echo "3. Login with any of the created manager accounts"
echo ""
echo "Manager accounts created:"
echo "- inventory.manager@galaxy.com (password: manager123)"
echo "- purchase.manager@galaxy.com (password: manager123)"
echo "- crm.manager@galaxy.com (password: manager123)"
echo "- hr.manager@galaxy.com (password: manager123)"
echo "- accountant@galaxy.com (password: manager123)"
echo "- sales.manager@galaxy.com (password: manager123)"
echo "- admin@galaxy.com (password: admin123)"






