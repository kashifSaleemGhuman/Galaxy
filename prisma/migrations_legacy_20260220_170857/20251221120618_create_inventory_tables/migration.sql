-- Create warehouses table if it doesn't exist (with proper column names)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'warehouses') THEN
        CREATE TABLE "warehouses" (
            "id" TEXT NOT NULL,
            "name" TEXT NOT NULL,
            "code" TEXT NOT NULL,
            "address" TEXT,
            "tenantId" TEXT,
            "managerId" TEXT,
            "isActive" BOOLEAN NOT NULL DEFAULT true,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,

            CONSTRAINT "warehouses_pkey" PRIMARY KEY ("id")
        );

        CREATE UNIQUE INDEX "warehouses_code_key" ON "warehouses"("code");
    END IF;
END $$;

-- Create inventory_items table if it doesn't exist (with proper column names)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'inventory_items') THEN
        CREATE TABLE "inventory_items" (
            "id" TEXT NOT NULL,
            "product_id" TEXT NOT NULL,
            "warehouse_id" TEXT NOT NULL,
            "location_id" TEXT,
            "quantity" INTEGER NOT NULL DEFAULT 0,
            "reserved" INTEGER NOT NULL DEFAULT 0,
            "available" INTEGER NOT NULL DEFAULT 0,
            "minLevel" INTEGER NOT NULL DEFAULT 0,
            "maxLevel" INTEGER NOT NULL DEFAULT 0,
            "location" TEXT,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,

            CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("id")
        );

        CREATE UNIQUE INDEX "inventory_items_product_id_warehouse_id_key" ON "inventory_items"("product_id", "warehouse_id");
    END IF;
END $$;

-- Create stock_movements table if it doesn't exist (with proper column names)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'stock_movements') THEN
        CREATE TABLE "stock_movements" (
            "id" TEXT NOT NULL,
            "product_id" TEXT NOT NULL,
            "warehouse_id" TEXT NOT NULL,
            "shipment_id" TEXT,
            "location_id" TEXT,
            "type" TEXT NOT NULL,
            "quantity" INTEGER NOT NULL,
            "reason" TEXT,
            "reference" TEXT,
            "createdBy" TEXT,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "request_id" TEXT,

            CONSTRAINT "stock_movements_pkey" PRIMARY KEY ("id")
        );
    END IF;
END $$;
