-- CreateTable (only if Tenant table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'Tenant') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'LeaveType') THEN
            CREATE TABLE "LeaveType" (
                "id" TEXT NOT NULL,
                "tenantId" TEXT NOT NULL,
                "name" TEXT NOT NULL,
                "code" TEXT NOT NULL,
                "description" TEXT,
                "isPaid" BOOLEAN NOT NULL DEFAULT true,
                "isActive" BOOLEAN NOT NULL DEFAULT true,
                "requiresApproval" BOOLEAN NOT NULL DEFAULT true,
                "maxConsecutiveDays" INTEGER,
                "requiresMedicalCertificate" BOOLEAN NOT NULL DEFAULT false,
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL,

                CONSTRAINT "LeaveType_pkey" PRIMARY KEY ("id")
            );
        END IF;
    END IF;
END $$;

-- CreateTable (only if Tenant and LeaveType tables exist)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'Tenant') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'LeavePolicy') THEN
            CREATE TABLE "LeavePolicy" (
                "id" TEXT NOT NULL,
                "tenantId" TEXT NOT NULL,
                "leaveTypeId" TEXT NOT NULL,
                "name" TEXT NOT NULL,
                "accrualType" TEXT NOT NULL,
                "accrualAmount" DECIMAL(10,2) NOT NULL,
                "accrualFrequency" INTEGER,
                "maxBalance" DECIMAL(10,2),
                "allowNegativeBalance" BOOLEAN NOT NULL DEFAULT false,
                "carryForwardEnabled" BOOLEAN NOT NULL DEFAULT false,
                "carryForwardLimit" DECIMAL(10,2),
                "carryForwardExpiryMonths" INTEGER,
                "encashmentEnabled" BOOLEAN NOT NULL DEFAULT false,
                "encashmentLimit" DECIMAL(10,2),
                "effectiveFrom" DATE NOT NULL,
                "effectiveTo" DATE,
                "isActive" BOOLEAN NOT NULL DEFAULT true,
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL,
                "createdBy" TEXT NOT NULL,

                CONSTRAINT "LeavePolicy_pkey" PRIMARY KEY ("id")
            );
        END IF;
    END IF;
END $$;

-- CreateTable (only if Employee table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'Employee') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'LeavePolicyAssignment') THEN
            CREATE TABLE "LeavePolicyAssignment" (
                "id" TEXT NOT NULL,
                "policyId" TEXT NOT NULL,
                "employeeId" TEXT,
                "departmentId" TEXT,
                "effectiveFrom" DATE NOT NULL,
                "effectiveTo" DATE,
                "isActive" BOOLEAN NOT NULL DEFAULT true,
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL,

                CONSTRAINT "LeavePolicyAssignment_pkey" PRIMARY KEY ("id")
            );
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'LeaveRequest') THEN
            CREATE TABLE "LeaveRequest" (
                "id" TEXT NOT NULL,
                "employeeId" TEXT NOT NULL,
                "leaveTypeId" TEXT NOT NULL,
                "startDate" DATE NOT NULL,
                "endDate" DATE NOT NULL,
                "days" DECIMAL(10,2) NOT NULL,
                "reason" TEXT NOT NULL,
                "status" TEXT NOT NULL,
                "requestedBy" TEXT NOT NULL,
                "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "approvedBy" TEXT,
                "approvedAt" TIMESTAMP(3),
                "rejectedBy" TEXT,
                "rejectedAt" TIMESTAMP(3),
                "rejectionReason" TEXT,
                "cancelledBy" TEXT,
                "cancelledAt" TIMESTAMP(3),
                "cancellationReason" TEXT,
                "isBackdated" BOOLEAN NOT NULL DEFAULT false,
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL,

                CONSTRAINT "LeaveRequest_pkey" PRIMARY KEY ("id")
            );
        END IF;
    END IF;
END $$;

-- CreateTable
CREATE TABLE "LeaveApproval" (
    "id" TEXT NOT NULL,
    "leaveRequestId" TEXT NOT NULL,
    "approverId" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "remarks" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeaveApproval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeaveBalance" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "leaveTypeId" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "periodStart" DATE NOT NULL,
    "periodEnd" DATE NOT NULL,
    "openingBalance" DECIMAL(10,2) NOT NULL,
    "accrued" DECIMAL(10,2) NOT NULL,
    "used" DECIMAL(10,2) NOT NULL,
    "encashed" DECIMAL(10,2) NOT NULL,
    "carriedForward" DECIMAL(10,2) NOT NULL,
    "closingBalance" DECIMAL(10,2) NOT NULL,
    "lastCalculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeaveBalance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeaveAccrual" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "leaveTypeId" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "accrualDate" DATE NOT NULL,
    "accrualAmount" DECIMAL(10,2) NOT NULL,
    "periodStart" DATE NOT NULL,
    "periodEnd" DATE NOT NULL,
    "balanceBefore" DECIMAL(10,2) NOT NULL,
    "balanceAfter" DECIMAL(10,2) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "LeaveAccrual_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeaveEncashment" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "leaveTypeId" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "encashmentDate" DATE NOT NULL,
    "daysEncashed" DECIMAL(10,2) NOT NULL,
    "encashmentRate" DECIMAL(10,2) NOT NULL,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "periodStart" DATE NOT NULL,
    "periodEnd" DATE NOT NULL,
    "balanceBefore" DECIMAL(10,2) NOT NULL,
    "balanceAfter" DECIMAL(10,2) NOT NULL,
    "status" TEXT NOT NULL,
    "processedAt" TIMESTAMP(3),
    "payrollEntryId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "approvedBy" TEXT,

    CONSTRAINT "LeaveEncashment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyPolicy" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "publishedAt" TIMESTAMP(3),
    "publishedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "CompanyPolicy_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey (only if Tenant table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'Tenant') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'LeaveType_tenantId_fkey') THEN
            ALTER TABLE "LeaveType" ADD CONSTRAINT "LeaveType_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'LeavePolicy_tenantId_fkey') THEN
            ALTER TABLE "LeavePolicy" ADD CONSTRAINT "LeavePolicy_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
    END IF;
END $$;

-- AddForeignKey
ALTER TABLE "LeavePolicy" ADD CONSTRAINT "LeavePolicy_leaveTypeId_fkey" FOREIGN KEY ("leaveTypeId") REFERENCES "LeaveType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeavePolicyAssignment" ADD CONSTRAINT "LeavePolicyAssignment_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "LeavePolicy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeavePolicyAssignment" ADD CONSTRAINT "LeavePolicyAssignment_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveRequest" ADD CONSTRAINT "LeaveRequest_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveRequest" ADD CONSTRAINT "LeaveRequest_leaveTypeId_fkey" FOREIGN KEY ("leaveTypeId") REFERENCES "LeaveType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveApproval" ADD CONSTRAINT "LeaveApproval_leaveRequestId_fkey" FOREIGN KEY ("leaveRequestId") REFERENCES "LeaveRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveBalance" ADD CONSTRAINT "LeaveBalance_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveBalance" ADD CONSTRAINT "LeaveBalance_leaveTypeId_fkey" FOREIGN KEY ("leaveTypeId") REFERENCES "LeaveType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveBalance" ADD CONSTRAINT "LeaveBalance_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "LeavePolicy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveAccrual" ADD CONSTRAINT "LeaveAccrual_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveAccrual" ADD CONSTRAINT "LeaveAccrual_leaveTypeId_fkey" FOREIGN KEY ("leaveTypeId") REFERENCES "LeaveType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveAccrual" ADD CONSTRAINT "LeaveAccrual_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "LeavePolicy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveEncashment" ADD CONSTRAINT "LeaveEncashment_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveEncashment" ADD CONSTRAINT "LeaveEncashment_leaveTypeId_fkey" FOREIGN KEY ("leaveTypeId") REFERENCES "LeaveType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveEncashment" ADD CONSTRAINT "LeaveEncashment_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "LeavePolicy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey (only if Tenant table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'Tenant') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CompanyPolicy_tenantId_fkey') THEN
            ALTER TABLE "CompanyPolicy" ADD CONSTRAINT "CompanyPolicy_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
    END IF;
END $$;

-- CreateIndex
CREATE UNIQUE INDEX "LeaveType_tenantId_code_key" ON "LeaveType"("tenantId", "code");

-- CreateIndex
CREATE INDEX "LeaveType_tenantId_idx" ON "LeaveType"("tenantId");

-- CreateIndex
CREATE INDEX "LeaveType_isActive_idx" ON "LeaveType"("isActive");

-- CreateIndex
CREATE INDEX "LeavePolicy_tenantId_idx" ON "LeavePolicy"("tenantId");

-- CreateIndex
CREATE INDEX "LeavePolicy_leaveTypeId_idx" ON "LeavePolicy"("leaveTypeId");

-- CreateIndex
CREATE INDEX "LeavePolicy_isActive_idx" ON "LeavePolicy"("isActive");

-- CreateIndex
CREATE INDEX "LeavePolicy_effectiveFrom_effectiveTo_idx" ON "LeavePolicy"("effectiveFrom", "effectiveTo");

-- CreateIndex
CREATE INDEX "LeavePolicyAssignment_policyId_idx" ON "LeavePolicyAssignment"("policyId");

-- CreateIndex
CREATE INDEX "LeavePolicyAssignment_employeeId_idx" ON "LeavePolicyAssignment"("employeeId");

-- CreateIndex
CREATE INDEX "LeavePolicyAssignment_departmentId_idx" ON "LeavePolicyAssignment"("departmentId");

-- CreateIndex
CREATE INDEX "LeavePolicyAssignment_isActive_idx" ON "LeavePolicyAssignment"("isActive");

-- CreateIndex
CREATE INDEX "LeaveRequest_employeeId_idx" ON "LeaveRequest"("employeeId");

-- CreateIndex
CREATE INDEX "LeaveRequest_leaveTypeId_idx" ON "LeaveRequest"("leaveTypeId");

-- CreateIndex
CREATE INDEX "LeaveRequest_status_idx" ON "LeaveRequest"("status");

-- CreateIndex
CREATE INDEX "LeaveRequest_startDate_endDate_idx" ON "LeaveRequest"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "LeaveRequest_requestedBy_idx" ON "LeaveRequest"("requestedBy");

-- CreateIndex
CREATE INDEX "LeaveRequest_status_startDate_endDate_idx" ON "LeaveRequest"("status", "startDate", "endDate");

-- CreateIndex
CREATE INDEX "LeaveApproval_leaveRequestId_idx" ON "LeaveApproval"("leaveRequestId");

-- CreateIndex
CREATE INDEX "LeaveApproval_approverId_idx" ON "LeaveApproval"("approverId");

-- CreateIndex
CREATE INDEX "LeaveApproval_status_idx" ON "LeaveApproval"("status");

-- CreateIndex
CREATE UNIQUE INDEX "LeaveBalance_employeeId_leaveTypeId_periodStart_key" ON "LeaveBalance"("employeeId", "leaveTypeId", "periodStart");

-- CreateIndex
CREATE INDEX "LeaveBalance_employeeId_idx" ON "LeaveBalance"("employeeId");

-- CreateIndex
CREATE INDEX "LeaveBalance_leaveTypeId_idx" ON "LeaveBalance"("leaveTypeId");

-- CreateIndex
CREATE INDEX "LeaveBalance_periodStart_periodEnd_idx" ON "LeaveBalance"("periodStart", "periodEnd");

-- CreateIndex
CREATE INDEX "LeaveAccrual_employeeId_idx" ON "LeaveAccrual"("accrualDate");

-- CreateIndex
CREATE INDEX "LeaveAccrual_leaveTypeId_idx" ON "LeaveAccrual"("leaveTypeId");

-- CreateIndex
CREATE INDEX "LeaveAccrual_accrualDate_idx" ON "LeaveAccrual"("accrualDate");

-- CreateIndex
CREATE INDEX "LeaveAccrual_periodStart_periodEnd_idx" ON "LeaveAccrual"("periodStart", "periodEnd");

-- CreateIndex
CREATE INDEX "LeaveEncashment_employeeId_idx" ON "LeaveEncashment"("employeeId");

-- CreateIndex
CREATE INDEX "LeaveEncashment_leaveTypeId_idx" ON "LeaveEncashment"("leaveTypeId");

-- CreateIndex
CREATE INDEX "LeaveEncashment_encashmentDate_idx" ON "LeaveEncashment"("encashmentDate");

-- CreateIndex
CREATE INDEX "LeaveEncashment_status_idx" ON "LeaveEncashment"("status");

-- CreateIndex
CREATE INDEX "CompanyPolicy_tenantId_idx" ON "CompanyPolicy"("tenantId");

-- CreateIndex
CREATE INDEX "CompanyPolicy_category_idx" ON "CompanyPolicy"("category");

-- CreateIndex
CREATE INDEX "CompanyPolicy_isActive_idx" ON "CompanyPolicy"("isActive");

-- Add leaveRequestId column to DailyAttendance if it doesn't exist
DO $$ 
BEGIN
    -- Check if DailyAttendance table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'DailyAttendance') THEN
        -- Check if column doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'DailyAttendance' 
            AND column_name = 'leaveRequestId'
        ) THEN
            -- Add the column
            ALTER TABLE "DailyAttendance" ADD COLUMN "leaveRequestId" TEXT;
            
            -- Add foreign key only if LeaveRequest table exists
            IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'LeaveRequest') THEN
                -- Check if constraint doesn't exist
                IF NOT EXISTS (
                    SELECT 1 FROM pg_constraint 
                    WHERE conname = 'DailyAttendance_leaveRequestId_fkey'
                ) THEN
                    ALTER TABLE "DailyAttendance" 
                    ADD CONSTRAINT "DailyAttendance_leaveRequestId_fkey" 
                    FOREIGN KEY ("leaveRequestId") 
                    REFERENCES "LeaveRequest"("id") 
                    ON DELETE SET NULL 
                    ON UPDATE CASCADE;
                END IF;
            END IF;
            
            -- Create index if it doesn't exist
            IF NOT EXISTS (
                SELECT 1 FROM pg_indexes 
                WHERE indexname = 'DailyAttendance_leaveRequestId_idx'
            ) THEN
                CREATE INDEX "DailyAttendance_leaveRequestId_idx" ON "DailyAttendance"("leaveRequestId");
            END IF;
        END IF;
    END IF;
END $$;

