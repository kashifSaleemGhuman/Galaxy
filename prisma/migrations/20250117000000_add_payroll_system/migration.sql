-- CreateTable
CREATE TABLE IF NOT EXISTS "SalaryStructure" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "effectiveFrom" DATE NOT NULL,
    "effectiveTo" DATE,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "SalaryStructure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "SalaryComponent" (
    "id" TEXT NOT NULL,
    "salaryStructureId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "calculationType" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "baseComponentId" TEXT,
    "isTaxable" BOOLEAN NOT NULL DEFAULT false,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalaryComponent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "PayrollPeriod" (
    "id" TEXT NOT NULL,
    "periodName" TEXT NOT NULL,
    "periodStart" DATE NOT NULL,
    "periodEnd" DATE NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "finalizedAt" TIMESTAMP(3),
    "finalizedBy" TEXT,
    "paidAt" TIMESTAMP(3),
    "paidBy" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "PayrollPeriod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "PayrollRecord" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "payrollPeriodId" TEXT NOT NULL,
    "salaryStructureId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'GENERATED',
    "calculationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "calculatedBy" TEXT NOT NULL,
    "finalizedAt" TIMESTAMP(3),
    "finalizedBy" TEXT,
    "paidAt" TIMESTAMP(3),
    "paidBy" TEXT,
    "grossSalary" DECIMAL(10,2) NOT NULL,
    "totalAllowances" DECIMAL(10,2) NOT NULL,
    "totalDeductions" DECIMAL(10,2) NOT NULL,
    "netSalary" DECIMAL(10,2) NOT NULL,
    "calculationBreakdown" JSONB NOT NULL,
    "attendanceSummary" JSONB NOT NULL,
    "leaveSummary" JSONB NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PayrollRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "PayrollComponent" (
    "id" TEXT NOT NULL,
    "payrollRecordId" TEXT NOT NULL,
    "componentName" TEXT NOT NULL,
    "componentType" TEXT NOT NULL,
    "calculationType" TEXT NOT NULL,
    "baseAmount" DECIMAL(10,2),
    "amount" DECIMAL(10,2) NOT NULL,
    "isTaxable" BOOLEAN NOT NULL DEFAULT false,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PayrollComponent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Bonus" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "payrollPeriodId" TEXT,
    "name" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'ONE_TIME',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "Bonus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Loan" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "loanNumber" TEXT NOT NULL,
    "principalAmount" DECIMAL(10,2) NOT NULL,
    "interestRate" DECIMAL(5,2),
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "installmentAmount" DECIMAL(10,2) NOT NULL,
    "totalInstallments" INTEGER NOT NULL,
    "remainingInstallments" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "startDate" DATE NOT NULL,
    "endDate" DATE,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "Loan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "LoanInstallment" (
    "id" TEXT NOT NULL,
    "loanId" TEXT NOT NULL,
    "payrollRecordId" TEXT,
    "installmentNumber" INTEGER NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "dueDate" DATE NOT NULL,
    "deductedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LoanInstallment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "PayrollAuditLog" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "payrollRecordId" TEXT,
    "payrollPeriodId" TEXT,
    "employeeId" TEXT,
    "userId" TEXT NOT NULL,
    "details" JSONB NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PayrollAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "SalaryStructure_employeeId_idx" ON "SalaryStructure"("employeeId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "SalaryStructure_isActive_idx" ON "SalaryStructure"("isActive");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "SalaryStructure_effectiveFrom_effectiveTo_idx" ON "SalaryStructure"("effectiveFrom", "effectiveTo");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "SalaryComponent_salaryStructureId_idx" ON "SalaryComponent"("salaryStructureId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "SalaryComponent_type_idx" ON "SalaryComponent"("type");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "SalaryComponent_isActive_idx" ON "SalaryComponent"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "PayrollPeriod_periodStart_periodEnd_key" ON "PayrollPeriod"("periodStart", "periodEnd");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "PayrollPeriod_status_idx" ON "PayrollPeriod"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "PayrollPeriod_periodStart_periodEnd_idx" ON "PayrollPeriod"("periodStart", "periodEnd");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "PayrollRecord_employeeId_payrollPeriodId_key" ON "PayrollRecord"("employeeId", "payrollPeriodId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "PayrollRecord_employeeId_idx" ON "PayrollRecord"("employeeId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "PayrollRecord_payrollPeriodId_idx" ON "PayrollRecord"("payrollPeriodId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "PayrollRecord_status_idx" ON "PayrollRecord"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "PayrollRecord_calculationDate_idx" ON "PayrollRecord"("calculationDate");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "PayrollComponent_payrollRecordId_idx" ON "PayrollComponent"("payrollRecordId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "PayrollComponent_componentType_idx" ON "PayrollComponent"("componentType");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Bonus_employeeId_idx" ON "Bonus"("employeeId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Bonus_payrollPeriodId_idx" ON "Bonus"("payrollPeriodId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Bonus_status_idx" ON "Bonus"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Bonus_type_idx" ON "Bonus"("type");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Loan_loanNumber_key" ON "Loan"("loanNumber");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Loan_employeeId_idx" ON "Loan"("employeeId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Loan_status_idx" ON "Loan"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "LoanInstallment_loanId_idx" ON "LoanInstallment"("loanId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "LoanInstallment_payrollRecordId_idx" ON "LoanInstallment"("payrollRecordId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "LoanInstallment_status_idx" ON "LoanInstallment"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "LoanInstallment_dueDate_idx" ON "LoanInstallment"("dueDate");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "PayrollAuditLog_action_idx" ON "PayrollAuditLog"("action");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "PayrollAuditLog_userId_idx" ON "PayrollAuditLog"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "PayrollAuditLog_payrollRecordId_idx" ON "PayrollAuditLog"("payrollRecordId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "PayrollAuditLog_payrollPeriodId_idx" ON "PayrollAuditLog"("payrollPeriodId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "PayrollAuditLog_employeeId_idx" ON "PayrollAuditLog"("employeeId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "PayrollAuditLog_createdAt_idx" ON "PayrollAuditLog"("createdAt");

-- AddForeignKey
ALTER TABLE "SalaryStructure" ADD CONSTRAINT "SalaryStructure_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryComponent" ADD CONSTRAINT "SalaryComponent_salaryStructureId_fkey" FOREIGN KEY ("salaryStructureId") REFERENCES "SalaryStructure"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollRecord" ADD CONSTRAINT "PayrollRecord_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollRecord" ADD CONSTRAINT "PayrollRecord_payrollPeriodId_fkey" FOREIGN KEY ("payrollPeriodId") REFERENCES "PayrollPeriod"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollRecord" ADD CONSTRAINT "PayrollRecord_salaryStructureId_fkey" FOREIGN KEY ("salaryStructureId") REFERENCES "SalaryStructure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollComponent" ADD CONSTRAINT "PayrollComponent_payrollRecordId_fkey" FOREIGN KEY ("payrollRecordId") REFERENCES "PayrollRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bonus" ADD CONSTRAINT "Bonus_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bonus" ADD CONSTRAINT "Bonus_payrollPeriodId_fkey" FOREIGN KEY ("payrollPeriodId") REFERENCES "PayrollPeriod"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Loan" ADD CONSTRAINT "Loan_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoanInstallment" ADD CONSTRAINT "LoanInstallment_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "Loan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoanInstallment" ADD CONSTRAINT "LoanInstallment_payrollRecordId_fkey" FOREIGN KEY ("payrollRecordId") REFERENCES "PayrollRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollAuditLog" ADD CONSTRAINT "PayrollAuditLog_payrollRecordId_fkey" FOREIGN KEY ("payrollRecordId") REFERENCES "PayrollRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;

