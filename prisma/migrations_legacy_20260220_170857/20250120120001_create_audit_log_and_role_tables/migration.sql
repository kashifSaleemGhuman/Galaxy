-- Create Role table if it doesn't exist (PascalCase as per Prisma schema)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'Role') THEN
        CREATE TABLE "Role" (
            "id" TEXT NOT NULL,
            "name" TEXT NOT NULL,
            "description" TEXT,
            "permissions" JSONB NOT NULL DEFAULT '{}',
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
            CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
        );
        
        CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");
    END IF;
END $$;

-- Create AuditLog table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'AuditLog') THEN
        CREATE TABLE "AuditLog" (
            "id" TEXT NOT NULL,
            "userId" TEXT NOT NULL,
            "action" TEXT NOT NULL,
            "details" TEXT,
            "ipAddress" TEXT,
            "userAgent" TEXT,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
        );
        
        -- Add foreign key if User table exists
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'User') THEN
            IF NOT EXISTS (
                SELECT 1 FROM pg_constraint 
                WHERE conname = 'AuditLog_userId_fkey'
            ) THEN
                ALTER TABLE "AuditLog" 
                ADD CONSTRAINT "AuditLog_userId_fkey" 
                FOREIGN KEY ("userId") 
                REFERENCES "User"("id") 
                ON DELETE CASCADE;
            END IF;
        END IF;
        
        CREATE INDEX IF NOT EXISTS "AuditLog_userId_idx" ON "AuditLog"("userId");
        CREATE INDEX IF NOT EXISTS "AuditLog_action_idx" ON "AuditLog"("action");
        CREATE INDEX IF NOT EXISTS "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");
    END IF;
END $$;

-- Create PasswordHistory table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'PasswordHistory') THEN
        CREATE TABLE "PasswordHistory" (
            "id" TEXT NOT NULL,
            "userId" TEXT NOT NULL,
            "password" TEXT NOT NULL,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "PasswordHistory_pkey" PRIMARY KEY ("id")
        );
        
        -- Add foreign key if User table exists
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'User') THEN
            IF NOT EXISTS (
                SELECT 1 FROM pg_constraint 
                WHERE conname = 'PasswordHistory_userId_fkey'
            ) THEN
                ALTER TABLE "PasswordHistory" 
                ADD CONSTRAINT "PasswordHistory_userId_fkey" 
                FOREIGN KEY ("userId") 
                REFERENCES "User"("id") 
                ON DELETE CASCADE;
            END IF;
        END IF;
        
        CREATE INDEX IF NOT EXISTS "PasswordHistory_userId_idx" ON "PasswordHistory"("userId");
    END IF;
END $$;

