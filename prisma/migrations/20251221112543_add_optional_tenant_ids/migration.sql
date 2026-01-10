-- Add tenantId columns to all models (only if table and column don't exist)
-- This migration is safe to run multiple times

-- Vendor table
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'Vendor') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'Vendor' AND column_name = 'tenantId'
        ) THEN
            ALTER TABLE "Vendor" ADD COLUMN "tenantId" TEXT;
            CREATE INDEX IF NOT EXISTS "Vendor_tenantId_idx" ON "Vendor"("tenantId");
        END IF;
    END IF;
END $$;

-- Product table
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'Product') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'Product' AND column_name = 'tenantId'
        ) THEN
            ALTER TABLE "Product" ADD COLUMN "tenantId" TEXT;
            CREATE INDEX IF NOT EXISTS "Product_tenantId_idx" ON "Product"("tenantId");
        END IF;
    END IF;
END $$;

-- Warehouse table (check if it exists first)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'Warehouse') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'Warehouse' AND column_name = 'tenantId'
        ) THEN
            ALTER TABLE "Warehouse" ADD COLUMN "tenantId" TEXT;
            CREATE INDEX IF NOT EXISTS "Warehouse_tenantId_idx" ON "Warehouse"("tenantId");
        END IF;
    END IF;
END $$;

-- Organization table
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'Organization') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'Organization' AND column_name = 'tenantId'
        ) THEN
            ALTER TABLE "Organization" ADD COLUMN "tenantId" TEXT;
            CREATE INDEX IF NOT EXISTS "Organization_tenantId_idx" ON "Organization"("tenantId");
        END IF;
    END IF;
END $$;

-- Document table
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'Document') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'Document' AND column_name = 'tenantId'
        ) THEN
            ALTER TABLE "Document" ADD COLUMN "tenantId" TEXT;
            CREATE INDEX IF NOT EXISTS "Document_tenantId_idx" ON "Document"("tenantId");
        END IF;
    END IF;
END $$;

-- Employee table
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'Employee') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'Employee' AND column_name = 'tenantId'
        ) THEN
            ALTER TABLE "Employee" ADD COLUMN "tenantId" TEXT;
            CREATE INDEX IF NOT EXISTS "Employee_tenantId_idx" ON "Employee"("tenantId");
        END IF;
    END IF;
END $$;

-- Machine table
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'Machine') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'Machine' AND column_name = 'tenantId'
        ) THEN
            ALTER TABLE "Machine" ADD COLUMN "tenantId" TEXT;
            CREATE INDEX IF NOT EXISTS "Machine_tenantId_idx" ON "Machine"("tenantId");
        END IF;
    END IF;
END $$;

-- Permit table
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'Permit') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'Permit' AND column_name = 'tenantId'
        ) THEN
            ALTER TABLE "Permit" ADD COLUMN "tenantId" TEXT;
            CREATE INDEX IF NOT EXISTS "Permit_tenantId_idx" ON "Permit"("tenantId");
        END IF;
    END IF;
END $$;
