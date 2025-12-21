-- Add tenantId column to User table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'User' 
        AND column_name = 'tenantId'
    ) THEN
        ALTER TABLE "User" ADD COLUMN "tenantId" TEXT;
        
        -- Add foreign key constraint if Tenant table exists
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Tenant') THEN
            ALTER TABLE "User" 
            ADD CONSTRAINT "User_tenantId_fkey" 
            FOREIGN KEY ("tenantId") 
            REFERENCES "Tenant"("id") 
            ON DELETE SET NULL 
            ON UPDATE CASCADE;
        END IF;
        
        -- Create index for better query performance
        CREATE INDEX IF NOT EXISTS "User_tenantId_idx" ON "User"("tenantId");
    END IF;
END $$;
