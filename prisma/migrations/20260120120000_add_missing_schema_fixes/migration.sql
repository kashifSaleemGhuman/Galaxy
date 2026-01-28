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

-- Add attributes, traceabilityQuestions, and tenantId columns to Product table if they don't exist
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'Product') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'Product' AND column_name = 'attributes'
        ) THEN
            ALTER TABLE "Product" ADD COLUMN "attributes" JSONB DEFAULT '{}';
        END IF;
        
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'Product' AND column_name = 'traceabilityQuestions'
        ) THEN
            ALTER TABLE "Product" ADD COLUMN "traceabilityQuestions" JSONB DEFAULT '[]';
        END IF;
        
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'Product' AND column_name = 'tenantId'
        ) THEN
            ALTER TABLE "Product" ADD COLUMN "tenantId" TEXT;
            CREATE INDEX IF NOT EXISTS "Product_tenantId_idx" ON "Product"("tenantId");
        END IF;
    END IF;
END $$;

-- Add missing columns to RFQItem table if they don't exist
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'RFQItem') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'RFQItem' AND column_name = 'unitPrice'
        ) THEN
            ALTER TABLE "RFQItem" ADD COLUMN "unitPrice" DECIMAL(65,30);
        END IF;
        
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'RFQItem' AND column_name = 'expectedDeliveryDate'
        ) THEN
            ALTER TABLE "RFQItem" ADD COLUMN "expectedDeliveryDate" TIMESTAMP(3);
        END IF;
        
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'RFQItem' AND column_name = 'traceabilityAnswers'
        ) THEN
            ALTER TABLE "RFQItem" ADD COLUMN "traceabilityAnswers" JSONB DEFAULT '[]';
        END IF;
        
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'RFQItem' AND column_name = 'customFieldAnswers'
        ) THEN
            ALTER TABLE "RFQItem" ADD COLUMN "customFieldAnswers" JSONB DEFAULT '{}';
        END IF;
    END IF;
END $$;

-- Create Supplier table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'Supplier') THEN
        CREATE TABLE "Supplier" (
            "supplier_id" TEXT NOT NULL,
            "name" TEXT NOT NULL,
            "contact_info" TEXT,
            "email" TEXT NOT NULL,
            "phone" TEXT,

            CONSTRAINT "Supplier_pkey" PRIMARY KEY ("supplier_id")
        );
    END IF;
END $$;

-- Create PurchaseOrder table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'PurchaseOrder') THEN
        CREATE TABLE "PurchaseOrder" (
            "po_id" TEXT NOT NULL,
            "rfq_id" TEXT,
            "supplier_id" TEXT NOT NULL,
            "date_created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "status" TEXT NOT NULL DEFAULT 'draft',
            "approvedAt" TIMESTAMP(3),
            "approvedBy" TEXT,

            CONSTRAINT "PurchaseOrder_pkey" PRIMARY KEY ("po_id")
        );
        
        -- Add foreign key to Supplier
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'Supplier') THEN
            ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_supplier_id_fkey" 
                FOREIGN KEY ("supplier_id") REFERENCES "Supplier"("supplier_id") 
                ON DELETE RESTRICT ON UPDATE CASCADE;
        END IF;
        
        -- Add foreign key to RFQ (optional)
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'RFQ') THEN
            ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_rfq_id_fkey" 
                FOREIGN KEY ("rfq_id") REFERENCES "RFQ"("id") 
                ON DELETE SET NULL ON UPDATE CASCADE;
        END IF;
    END IF;
END $$;

-- Create POLine table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'POLine') THEN
        CREATE TABLE "POLine" (
            "po_line_id" TEXT NOT NULL,
            "po_id" TEXT NOT NULL,
            "product_id" TEXT NOT NULL,
            "quantity_ordered" INTEGER NOT NULL,
            "quantity_received" INTEGER NOT NULL DEFAULT 0,
            "price" DECIMAL(65,30) NOT NULL,

            CONSTRAINT "POLine_pkey" PRIMARY KEY ("po_line_id")
        );
        
        -- Add foreign keys
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'PurchaseOrder') THEN
            ALTER TABLE "POLine" ADD CONSTRAINT "POLine_po_id_fkey" 
                FOREIGN KEY ("po_id") REFERENCES "PurchaseOrder"("po_id") 
                ON DELETE RESTRICT ON UPDATE CASCADE;
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'Product') THEN
            ALTER TABLE "POLine" ADD CONSTRAINT "POLine_product_id_fkey" 
                FOREIGN KEY ("product_id") REFERENCES "Product"("id") 
                ON DELETE RESTRICT ON UPDATE CASCADE;
        END IF;
    END IF;
END $$;

-- Create GoodsReceipt table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'GoodsReceipt') THEN
        CREATE TABLE "GoodsReceipt" (
            "receipt_id" TEXT NOT NULL,
            "po_id" TEXT NOT NULL,
            "date_received" TIMESTAMP(3) NOT NULL,
            "status" TEXT NOT NULL,

            CONSTRAINT "GoodsReceipt_pkey" PRIMARY KEY ("receipt_id")
        );
        
        -- Add foreign key to PurchaseOrder
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'PurchaseOrder') THEN
            ALTER TABLE "GoodsReceipt" ADD CONSTRAINT "GoodsReceipt_po_id_fkey" 
                FOREIGN KEY ("po_id") REFERENCES "PurchaseOrder"("po_id") 
                ON DELETE RESTRICT ON UPDATE CASCADE;
        END IF;
    END IF;
END $$;

-- Create VendorBill table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'VendorBill') THEN
        CREATE TABLE "VendorBill" (
            "bill_id" TEXT NOT NULL,
            "po_id" TEXT NOT NULL,
            "date_billed" TIMESTAMP(3) NOT NULL,
            "amount" DECIMAL(65,30) NOT NULL,
            "status" TEXT NOT NULL,

            CONSTRAINT "VendorBill_pkey" PRIMARY KEY ("bill_id")
        );
        
        -- Add foreign key to PurchaseOrder
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'PurchaseOrder') THEN
            ALTER TABLE "VendorBill" ADD CONSTRAINT "VendorBill_po_id_fkey" 
                FOREIGN KEY ("po_id") REFERENCES "PurchaseOrder"("po_id") 
                ON DELETE RESTRICT ON UPDATE CASCADE;
        END IF;
    END IF;
END $$;

-- Create IncomingShipment table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'IncomingShipment') THEN
        CREATE TABLE "IncomingShipment" (
            "id" TEXT NOT NULL,
            "shipmentNumber" TEXT NOT NULL,
            "po_id" TEXT NOT NULL,
            "warehouse_id" TEXT,
            "status" TEXT NOT NULL DEFAULT 'pending',
            "assignedAt" TIMESTAMP(3),
            "assignedBy" TEXT,
            "receivedAt" TIMESTAMP(3),
            "processedAt" TIMESTAMP(3),
            "notes" TEXT,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,

            CONSTRAINT "IncomingShipment_pkey" PRIMARY KEY ("id")
        );
        
        CREATE UNIQUE INDEX IF NOT EXISTS "IncomingShipment_shipmentNumber_key" ON "IncomingShipment"("shipmentNumber");
        
        -- Add foreign keys
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'PurchaseOrder') THEN
            ALTER TABLE "IncomingShipment" ADD CONSTRAINT "IncomingShipment_po_id_fkey" 
                FOREIGN KEY ("po_id") REFERENCES "PurchaseOrder"("po_id") 
                ON DELETE RESTRICT ON UPDATE CASCADE;
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'warehouses') THEN
            ALTER TABLE "IncomingShipment" ADD CONSTRAINT "IncomingShipment_warehouse_id_fkey" 
                FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") 
                ON DELETE SET NULL ON UPDATE CASCADE;
        END IF;
    END IF;
END $$;
