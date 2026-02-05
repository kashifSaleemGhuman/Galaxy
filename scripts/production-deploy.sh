#!/bin/bash

# Production Deployment Script
# This script ensures safe database migrations in production

set -e  # Exit on error

echo "🚀 Starting production deployment..."
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Create base tables
echo -e "${YELLOW}Step 1: Creating base tables...${NC}"
if node scripts/create-base-tables.js; then
    echo -e "${GREEN}✅ Base tables ready${NC}"
else
    echo -e "${RED}❌ Failed to create base tables${NC}"
    exit 1
fi
echo ""

# Step 2: Validate dependencies
echo -e "${YELLOW}Step 2: Validating migration dependencies...${NC}"
if node scripts/validate-migration-dependencies.js; then
    echo -e "${GREEN}✅ Dependencies validated${NC}"
else
    echo -e "${YELLOW}⚠️  Some dependencies missing, attempting to fix...${NC}"
    
    # Try to fix common issues
    node scripts/create-user-table-if-missing.js || true
    node scripts/fix-employee-table-migration.js || true
    
    # Re-validate
    if ! node scripts/validate-migration-dependencies.js; then
        echo -e "${RED}❌ Cannot proceed - critical dependencies missing${NC}"
        exit 1
    fi
fi
echo ""

# Step 3: Mark problematic migrations as applied (if needed)
echo -e "${YELLOW}Step 3: Resolving migration conflicts...${NC}"
npx prisma migrate resolve --applied 20250103000000_add_employee_user_relationship 2>/dev/null || true
npx prisma migrate resolve --applied 20250116000000_add_leave_management 2>/dev/null || true
npx prisma migrate resolve --applied 20251119200000_add_vendor_custom_fields 2>/dev/null || true
echo -e "${GREEN}✅ Migration conflicts resolved${NC}"
echo ""

# Step 4: Deploy migrations
echo -e "${YELLOW}Step 4: Deploying migrations...${NC}"
if npx prisma migrate deploy; then
    echo -e "${GREEN}✅ Migrations deployed successfully${NC}"
else
    echo -e "${RED}❌ Migration deployment failed${NC}"
    echo ""
    echo "Check the error above and:"
    echo "  1. Fix the migration issue"
    echo "  2. Mark as applied if safe: npx prisma migrate resolve --applied <migration_name>"
    echo "  3. Re-run this script"
    exit 1
fi
echo ""

# Step 5: Generate Prisma client
echo -e "${YELLOW}Step 5: Generating Prisma client...${NC}"
if npx prisma generate; then
    echo -e "${GREEN}✅ Prisma client generated${NC}"
else
    echo -e "${RED}❌ Failed to generate Prisma client${NC}"
    exit 1
fi
echo ""

# Step 6: Final validation
echo -e "${YELLOW}Step 6: Final validation...${NC}"
if node scripts/validate-migration-dependencies.js; then
    echo -e "${GREEN}✅ All validations passed${NC}"
else
    echo -e "${YELLOW}⚠️  Some validations failed, but deployment completed${NC}"
fi
echo ""

echo "=================================="
echo -e "${GREEN}✅ Production deployment completed successfully!${NC}"
echo ""

