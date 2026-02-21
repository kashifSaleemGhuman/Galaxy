-- Create ProductCategory table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'product_categories') THEN
        CREATE TABLE "product_categories" (
            "id" TEXT NOT NULL,
            "name" TEXT NOT NULL,
            "description" TEXT,
            "parentId" TEXT,
            "tenantId" TEXT,
            "isActive" BOOLEAN NOT NULL DEFAULT true,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,

            CONSTRAINT "product_categories_pkey" PRIMARY KEY ("id")
        );

        CREATE INDEX IF NOT EXISTS "product_categories_parentId_idx" ON "product_categories"("parentId");
        CREATE INDEX IF NOT EXISTS "product_categories_tenantId_idx" ON "product_categories"("tenantId");
        
        -- Add foreign key constraints
        ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_parentId_fkey" 
            FOREIGN KEY ("parentId") REFERENCES "product_categories"("id") 
            ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- Add missing columns to Product table if they don't exist
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'Product') THEN
        -- Add sku column
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'Product' AND column_name = 'sku'
        ) THEN
            ALTER TABLE "Product" ADD COLUMN "sku" TEXT;
            CREATE UNIQUE INDEX IF NOT EXISTS "Product_sku_key" ON "Product"("sku") WHERE "sku" IS NOT NULL;
        END IF;
        
        -- Add barcode column
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'Product' AND column_name = 'barcode'
        ) THEN
            ALTER TABLE "Product" ADD COLUMN "barcode" TEXT;
            CREATE UNIQUE INDEX IF NOT EXISTS "Product_barcode_key" ON "Product"("barcode") WHERE "barcode" IS NOT NULL;
        END IF;
        
        -- Add categoryId column
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'Product' AND column_name = 'categoryId'
        ) THEN
            ALTER TABLE "Product" ADD COLUMN "categoryId" TEXT;
            CREATE INDEX IF NOT EXISTS "Product_categoryId_idx" ON "Product"("categoryId");
        END IF;
        
        -- Add unitOfMeasure column
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'Product' AND column_name = 'unitOfMeasure'
        ) THEN
            ALTER TABLE "Product" ADD COLUMN "unitOfMeasure" TEXT;
        END IF;
        
        -- Add price column
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'Product' AND column_name = 'price'
        ) THEN
            ALTER TABLE "Product" ADD COLUMN "price" DECIMAL(15,2);
        END IF;
        
        -- Add cost column
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'Product' AND column_name = 'cost'
        ) THEN
            ALTER TABLE "Product" ADD COLUMN "cost" DECIMAL(15,2);
        END IF;
        
        -- Add weight column
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'Product' AND column_name = 'weight'
        ) THEN
            ALTER TABLE "Product" ADD COLUMN "weight" DECIMAL(10,3);
        END IF;
        
        -- Add trackQuantity column
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'Product' AND column_name = 'trackQuantity'
        ) THEN
            ALTER TABLE "Product" ADD COLUMN "trackQuantity" BOOLEAN NOT NULL DEFAULT true;
        END IF;
        
        -- Add allowNegativeStock column
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'Product' AND column_name = 'allowNegativeStock'
        ) THEN
            ALTER TABLE "Product" ADD COLUMN "allowNegativeStock" BOOLEAN NOT NULL DEFAULT false;
        END IF;
        
        -- Add reorderPoint column
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'Product' AND column_name = 'reorderPoint'
        ) THEN
            ALTER TABLE "Product" ADD COLUMN "reorderPoint" INTEGER NOT NULL DEFAULT 0;
        END IF;
        
        -- Add maxStock column
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'Product' AND column_name = 'maxStock'
        ) THEN
            ALTER TABLE "Product" ADD COLUMN "maxStock" INTEGER;
        END IF;
        
        -- Add minStock column
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'Product' AND column_name = 'minStock'
        ) THEN
            ALTER TABLE "Product" ADD COLUMN "minStock" INTEGER;
        END IF;
        
        -- Add foreign key constraint for categoryId
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'Product_categoryId_fkey'
        ) THEN
            ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" 
                FOREIGN KEY ("categoryId") REFERENCES "product_categories"("id") 
                ON DELETE SET NULL ON UPDATE CASCADE;
        END IF;
    END IF;
END $$;



