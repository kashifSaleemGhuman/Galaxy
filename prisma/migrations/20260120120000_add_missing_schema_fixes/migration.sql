-- Add tenantId to User table (if table exists and column doesn't)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'User') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'User' AND column_name = 'tenantId'
        ) THEN
            ALTER TABLE "User" ADD COLUMN "tenantId" TEXT;
            CREATE INDEX IF NOT EXISTS "User_tenantId_idx" ON "User"("tenantId");
        END IF;
    END IF;
END $$;

-- Create Location table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'Location') THEN
        CREATE TABLE "Location" (
            "id" TEXT NOT NULL,
            "warehouseId" TEXT NOT NULL,
            "code" TEXT NOT NULL,
            "name" TEXT,
            "description" TEXT,
            "isActive" BOOLEAN NOT NULL DEFAULT true,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,

            CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
        );

        CREATE UNIQUE INDEX "Location_warehouseId_code_key" ON "Location"("warehouseId", "code");
        
        -- Add foreign key constraint
        ALTER TABLE "Location" ADD CONSTRAINT "Location_warehouseId_fkey" 
            FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") 
            ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- Add foreign key constraints to inventory_items if they don't exist
DO $$ 
BEGIN
    -- Foreign key to Product
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'inventory_items') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'inventory_items_product_id_fkey'
        ) THEN
            ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_product_id_fkey" 
                FOREIGN KEY ("product_id") REFERENCES "Product"("id") 
                ON DELETE RESTRICT ON UPDATE CASCADE;
        END IF;
        
        -- Foreign key to warehouses
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'inventory_items_warehouse_id_fkey'
        ) THEN
            ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_warehouse_id_fkey" 
                FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") 
                ON DELETE RESTRICT ON UPDATE CASCADE;
        END IF;
        
        -- Foreign key to Location
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'inventory_items_location_id_fkey'
        ) THEN
            ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_location_id_fkey" 
                FOREIGN KEY ("location_id") REFERENCES "Location"("id") 
                ON DELETE SET NULL ON UPDATE CASCADE;
        END IF;
    END IF;
END $$;

-- Add foreign key constraint to warehouses.managerId if it doesn't exist
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'warehouses') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'warehouses_managerId_fkey'
        ) THEN
            ALTER TABLE "warehouses" ADD CONSTRAINT "warehouses_managerId_fkey" 
                FOREIGN KEY ("managerId") REFERENCES "User"("id") 
                ON DELETE SET NULL ON UPDATE CASCADE;
        END IF;
    END IF;
END $$;

-- Add bankName, bankAccountNumber, and attributes columns to Vendor table if they don't exist
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'Vendor') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'Vendor' AND column_name = 'bankName'
        ) THEN
            ALTER TABLE "Vendor" ADD COLUMN "bankName" TEXT;
        END IF;
        
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'Vendor' AND column_name = 'bankAccountNumber'
        ) THEN
            ALTER TABLE "Vendor" ADD COLUMN "bankAccountNumber" TEXT;
        END IF;
        
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'Vendor' AND column_name = 'attributes'
        ) THEN
            ALTER TABLE "Vendor" ADD COLUMN "attributes" JSONB DEFAULT '{}';
        END IF;
        
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'Vendor' AND column_name = 'tenantId'
        ) THEN
            ALTER TABLE "Vendor" ADD COLUMN "tenantId" TEXT;
            CREATE INDEX IF NOT EXISTS "Vendor_tenantId_idx" ON "Vendor"("tenantId");
        END IF;
    END IF;
END $$;
