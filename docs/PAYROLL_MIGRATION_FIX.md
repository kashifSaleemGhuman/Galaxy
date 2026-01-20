# Payroll System Migration Fix Guide

## Issue

When running `npx prisma migrate reset`, the migration `20250103000000_add_employee_user_relationship` fails with:
```
ERROR: relation "Employee" does not exist
```

## Root Cause

1. The migration `20250103000000_add_employee_user_relationship` tries to add a `userId` column to the `Employee` table and create a foreign key to the `User` table.
2. The `User` table doesn't exist yet because:
   - Migration `20250103000000` runs on Jan 3
   - Migration `20251019095757_inventory_added` (which creates `users` lowercase) runs on Oct 19
   - The Prisma schema expects `User` (PascalCase), not `users` (lowercase)
3. The foreign key constraint fails because the `User` table doesn't exist.

## Solution

The migration has been updated to:
1. Create the `Employee` table if it doesn't exist
2. Add the `userId` column if it doesn't exist
3. Create indexes and constraints safely

## Fix Steps

### Option 1: Run Fix Script (Recommended)

```bash
# Step 1: Create User table if it doesn't exist
node scripts/create-user-table-if-missing.js

# Step 2: Run the fix script (creates Employee table and adds userId column)
node scripts/fix-employee-table-migration.js

# Step 3: Mark the migration as applied
npx prisma migrate resolve --applied 20250103000000_add_employee_user_relationship

# Step 4: Continue with other migrations
npx prisma migrate deploy
```

**Note:** The fix script now requires the User table to exist. If the User table doesn't exist, run `scripts/create-user-table-if-missing.js` first.

### Option 2: Manual SQL Fix

If the script doesn't work, run this SQL directly:

```sql
-- Create Employee table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'Employee') THEN
        CREATE TABLE "Employee" (
            "id" TEXT NOT NULL,
            "employeeId" TEXT NOT NULL,
            "idCardNumber" TEXT,
            "name" TEXT NOT NULL,
            "photo" TEXT,
            "parentName" TEXT,
            "dob" TIMESTAMP(3),
            "address" TEXT,
            "gender" TEXT,
            "contactNumber" TEXT,
            "emergencyContact" TEXT,
            "dateOfJoining" TIMESTAMP(3),
            "department" TEXT,
            "lastEmployment" TEXT,
            "process" TEXT,
            "designation" TEXT,
            "salary" DECIMAL(10,2),
            "dateOfLeaving" TIMESTAMP(3),
            "shift" TEXT,
            "secondaryJob" TEXT,
            "tenantId" TEXT,
            "userId" TEXT,
            "isFirstAider" BOOLEAN NOT NULL DEFAULT false,
            "isEmergencyResponder" BOOLEAN NOT NULL DEFAULT false,
            "isFirefighter" BOOLEAN NOT NULL DEFAULT false,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
            CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
        );
        
        CREATE UNIQUE INDEX IF NOT EXISTS "Employee_employeeId_key" ON "Employee"("employeeId");
    END IF;
END $$;

-- Add userId column if it doesn't exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'Employee') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'Employee' AND column_name = 'userId'
        ) THEN
            ALTER TABLE "Employee" ADD COLUMN "userId" TEXT;
        END IF;
    END IF;
END $$;

-- Create unique index
CREATE UNIQUE INDEX IF NOT EXISTS "Employee_userId_key" ON "Employee"("userId") WHERE "userId" IS NOT NULL;

-- Add foreign key
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'Employee_userId_fkey'
    ) THEN
        ALTER TABLE "Employee" 
        ADD CONSTRAINT "Employee_userId_fkey" 
        FOREIGN KEY ("userId") 
        REFERENCES "User"("id") 
        ON DELETE SET NULL;
    END IF;
END $$;
```

### Option 3: Reset and Reapply (If Database is Empty)

If you can reset the database:

```bash
# Reset database (WARNING: This deletes all data)
npx prisma migrate reset

# If it still fails, mark the problematic migration as applied
npx prisma migrate resolve --applied 20250103000000_add_employee_user_relationship

# Continue with remaining migrations
npx prisma migrate deploy
```

## Verification

After applying the fix, verify:

```bash
# Generate Prisma client
npx prisma generate

# Check migration status
npx prisma migrate status

# Test the connection
node -e "const { PrismaClient } = require('@prisma/client'); const p = new PrismaClient(); p.employee.findMany().then(() => console.log('✅ Employee table accessible')).catch(e => console.error('❌', e))"
```

## Testing Payroll System

After fixing migrations:

1. **Test Employee Access:**
   ```bash
   # Login as employee
   # Navigate to: /dashboard/hrm/my-payroll
   # Should see own payroll records
   ```

2. **Test HR Access:**
   ```bash
   # Login as HR Manager
   # Navigate to: /dashboard/hrm/payroll
   # Should see all payroll periods
   ```

3. **Test API Endpoints:**
   ```bash
   # Test employee payroll API
   curl http://localhost:3000/api/hrm/payroll/records
   
   # Test HR payroll API
   curl http://localhost:3000/api/hrm/payroll/periods
   ```

## Common Issues

### Issue: "Column userId does not exist"
**Solution:** Run the fix script or manual SQL above

### Issue: "Foreign key constraint fails"
**Solution:** Ensure User table exists first

### Issue: "Migration already applied"
**Solution:** 
```bash
npx prisma migrate resolve --rolled-back 20250103000000_add_employee_user_relationship
npx prisma migrate deploy
```

## Next Steps

After fixing:
1. ✅ Run all migrations
2. ✅ Generate Prisma client
3. ✅ Test employee access
4. ✅ Test HR access
5. ✅ Test payroll generation
6. ✅ Test payslip download

---

**Last Updated:** January 2025

