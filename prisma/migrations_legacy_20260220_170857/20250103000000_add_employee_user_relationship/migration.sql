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
        CREATE INDEX IF NOT EXISTS "Employee_tenantId_idx" ON "Employee"("tenantId");
    END IF;
END $$;

-- Add userId column to Employee table if it doesn't exist
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

-- Create unique constraint on userId
CREATE UNIQUE INDEX IF NOT EXISTS "Employee_userId_key" ON "Employee"("userId") WHERE "userId" IS NOT NULL;

-- Add foreign key constraint (only if User table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'Employee') THEN
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'User') THEN
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
        END IF;
    END IF;
END $$;

