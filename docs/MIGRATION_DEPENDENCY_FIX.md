# Migration Dependency Fix Guide

## Problem

Migrations are failing because they reference tables that don't exist yet. This happens because:

1. **Migration Order Issue**: Migrations are applied in chronological order, but some migrations (like `20250116000000_add_leave_management`) reference tables (like `Tenant`) that are created in later migrations (like `20251019095757_inventory_added`).

2. **Table Name Mismatch**: Some migrations create tables with lowercase names (`tenants`, `users`) while the Prisma schema expects PascalCase (`Tenant`, `User`).

3. **Foreign Key Dependencies**: Foreign key constraints fail when the referenced table doesn't exist.

## Solution

### Step 1: Create Base Tables First

Run this script **BEFORE** running any migrations:

```bash
node scripts/create-base-tables.js
```

This script creates:
- `Tenant` table (PascalCase, as per Prisma schema)
- `User` table (PascalCase, as per Prisma schema)

### Step 2: Fix Employee Table

```bash
# Create User table if missing
node scripts/create-user-table-if-missing.js

# Fix Employee table
node scripts/fix-employee-table-migration.js
```

### Step 3: Mark Failed Migrations as Applied

If migrations fail, mark them as applied (they'll be fixed by the scripts):

```bash
# Mark Employee migration as applied
npx prisma migrate resolve --applied 20250103000000_add_employee_user_relationship

# Mark Leave management migration as applied (if it fails)
npx prisma migrate resolve --applied 20250116000000_add_leave_management
```

### Step 4: Continue with Migrations

```bash
npx prisma migrate deploy
```

### Step 5: Generate Prisma Client

```bash
npx prisma generate
```

## Complete Fix Script (Recommended)

For a complete automated fix, run:

```bash
# Run the master fix script (handles everything)
node scripts/fix-all-migrations.js

# Then mark failed migrations as applied (if needed)
npx prisma migrate resolve --applied 20250103000000_add_employee_user_relationship || true
npx prisma migrate resolve --applied 20250116000000_add_leave_management || true

# Deploy remaining migrations
npx prisma migrate deploy

# Generate client
npx prisma generate
```

### Manual Steps (Alternative)

If you prefer manual control:

```bash
# 1. Create all base tables
node scripts/create-base-tables.js

# 2. Fix Employee table
node scripts/create-user-table-if-missing.js
node scripts/fix-employee-table-migration.js

# 3. Mark problematic migrations as applied
npx prisma migrate resolve --applied 20250103000000_add_employee_user_relationship || true
npx prisma migrate resolve --applied 20250116000000_add_leave_management || true

# 4. Deploy remaining migrations
npx prisma migrate deploy

# 5. Generate client
npx prisma generate
```

## Migration Fixes Applied

### 1. Employee User Relationship Migration
- ✅ Now creates `Employee` table if it doesn't exist
- ✅ Checks for `User` table before adding foreign key
- ✅ Safely adds `userId` column

### 2. Leave Management Migration
- ✅ Checks for `Tenant` table before adding foreign keys
- ✅ Safely adds foreign key constraints

## For Production Deployment

### Option 1: Pre-deployment Script

Create a pre-deployment script that runs before migrations:

```bash
#!/bin/bash
# pre-deploy.sh

echo "Creating base tables..."
node scripts/create-base-tables.js

echo "Fixing Employee table..."
node scripts/create-user-table-if-missing.js
node scripts/fix-employee-table-migration.js

echo "Deploying migrations..."
npx prisma migrate deploy

echo "Generating Prisma client..."
npx prisma generate
```

### Option 2: Database Initialization

If starting fresh, initialize the database with base tables first:

```sql
-- Run this SQL first to create base tables
-- Then run migrations
```

### Option 3: Migration Order Fix (Future)

Consider renaming migrations to ensure correct order:
- Base tables should be created first
- Dependent migrations should run after

## Verification

After fixing, verify:

```bash
# Check migration status
npx prisma migrate status

# Test database connection
node -e "const { PrismaClient } = require('@prisma/client'); const p = new PrismaClient(); p.\$connect().then(() => console.log('✅ Connected')).catch(e => console.error('❌', e))"

# Check tables exist
node -e "const { PrismaClient } = require('@prisma/client'); const p = new PrismaClient(); p.\$queryRaw\`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('Tenant', 'User', 'Employee')\`\`.then(r => console.log('Tables:', r)).catch(e => console.error('❌', e))"
```

## Common Issues

### Issue: "relation Tenant does not exist"
**Solution:** Run `node scripts/create-base-tables.js` first

### Issue: "relation User does not exist"
**Solution:** Run `node scripts/create-user-table-if-missing.js` first

### Issue: "relation Employee does not exist"
**Solution:** Run `node scripts/fix-employee-table-migration.js`

### Issue: "Foreign key constraint fails"
**Solution:** The migrations now check for table existence before adding foreign keys. If it still fails, ensure base tables exist.

## Prevention

To prevent these issues in the future:

1. **Always check for table existence** before adding foreign keys
2. **Use conditional foreign keys** in migrations:
   ```sql
   DO $$
   BEGIN
       IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ReferencedTable') THEN
           -- Add foreign key
       END IF;
   END $$;
   ```
3. **Create base tables first** in a separate migration
4. **Test migrations** in a clean database before deploying

---

**Last Updated:** January 2025

