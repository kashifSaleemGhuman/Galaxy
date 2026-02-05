-- CreateTable
CREATE TABLE IF NOT EXISTS "Shift" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "gracePeriodMinutes" INTEGER NOT NULL DEFAULT 15,
    "breakDurationMinutes" INTEGER NOT NULL DEFAULT 60,
    "halfDayThresholdHours" DOUBLE PRECISION NOT NULL DEFAULT 4.0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Shift_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "EmployeeShift" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "shiftId" TEXT NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effectiveTo" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeShift_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "AttendanceEvent" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'AUTOMATIC',
    "location" TEXT,
    "deviceId" TEXT,
    "ipAddress" TEXT,
    "notes" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AttendanceEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "DailyAttendance" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "shiftId" TEXT,
    "checkInTime" TIMESTAMP(3),
    "checkOutTime" TIMESTAMP(3),
    "workedMinutes" INTEGER NOT NULL DEFAULT 0,
    "lateMinutes" INTEGER NOT NULL DEFAULT 0,
    "earlyDepartureMinutes" INTEGER NOT NULL DEFAULT 0,
    "overtimeMinutes" INTEGER NOT NULL DEFAULT 0,
    "breakMinutes" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "lockedAt" TIMESTAMP(3),
    "lockedBy" TEXT,
    "lastCalculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyAttendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "AttendanceCorrection" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "requestedCheckInTime" TIMESTAMP(3),
    "requestedCheckOutTime" TIMESTAMP(3),
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "requestedBy" TEXT NOT NULL,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AttendanceCorrection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "AttendanceLock" (
    "id" TEXT NOT NULL,
    "periodStart" DATE NOT NULL,
    "periodEnd" DATE NOT NULL,
    "lockedBy" TEXT NOT NULL,
    "lockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AttendanceLock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Shift_isActive_idx" ON "Shift"("isActive");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "EmployeeShift_employeeId_idx" ON "EmployeeShift"("employeeId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "EmployeeShift_shiftId_idx" ON "EmployeeShift"("shiftId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "EmployeeShift_isActive_idx" ON "EmployeeShift"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "EmployeeShift_employeeId_effectiveFrom_key" ON "EmployeeShift"("employeeId", "effectiveFrom");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AttendanceEvent_employeeId_idx" ON "AttendanceEvent"("employeeId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AttendanceEvent_timestamp_idx" ON "AttendanceEvent"("timestamp");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AttendanceEvent_eventType_idx" ON "AttendanceEvent"("eventType");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "AttendanceEvent_employeeId_eventType_timestamp_key" ON "AttendanceEvent"("employeeId", "eventType", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "DailyAttendance_employeeId_date_key" ON "DailyAttendance"("employeeId", "date");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "DailyAttendance_employeeId_idx" ON "DailyAttendance"("employeeId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "DailyAttendance_date_idx" ON "DailyAttendance"("date");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "DailyAttendance_status_idx" ON "DailyAttendance"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "DailyAttendance_isLocked_idx" ON "DailyAttendance"("isLocked");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AttendanceCorrection_employeeId_idx" ON "AttendanceCorrection"("employeeId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AttendanceCorrection_date_idx" ON "AttendanceCorrection"("date");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AttendanceCorrection_status_idx" ON "AttendanceCorrection"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AttendanceCorrection_requestedBy_idx" ON "AttendanceCorrection"("requestedBy");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AttendanceLock_periodStart_periodEnd_idx" ON "AttendanceLock"("periodStart", "periodEnd");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AttendanceLock_isActive_idx" ON "AttendanceLock"("isActive");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'EmployeeShift_employeeId_fkey'
    ) THEN
        ALTER TABLE "EmployeeShift" 
        ADD CONSTRAINT "EmployeeShift_employeeId_fkey" 
        FOREIGN KEY ("employeeId") 
        REFERENCES "Employee"("id") 
        ON DELETE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'EmployeeShift_shiftId_fkey'
    ) THEN
        ALTER TABLE "EmployeeShift" 
        ADD CONSTRAINT "EmployeeShift_shiftId_fkey" 
        FOREIGN KEY ("shiftId") 
        REFERENCES "Shift"("id") 
        ON DELETE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'AttendanceEvent_employeeId_fkey'
    ) THEN
        ALTER TABLE "AttendanceEvent" 
        ADD CONSTRAINT "AttendanceEvent_employeeId_fkey" 
        FOREIGN KEY ("employeeId") 
        REFERENCES "Employee"("id") 
        ON DELETE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'DailyAttendance_employeeId_fkey'
    ) THEN
        ALTER TABLE "DailyAttendance" 
        ADD CONSTRAINT "DailyAttendance_employeeId_fkey" 
        FOREIGN KEY ("employeeId") 
        REFERENCES "Employee"("id") 
        ON DELETE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'DailyAttendance_shiftId_fkey'
    ) THEN
        ALTER TABLE "DailyAttendance" 
        ADD CONSTRAINT "DailyAttendance_shiftId_fkey" 
        FOREIGN KEY ("shiftId") 
        REFERENCES "Shift"("id") 
        ON DELETE SET NULL;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'AttendanceCorrection_employeeId_fkey'
    ) THEN
        ALTER TABLE "AttendanceCorrection" 
        ADD CONSTRAINT "AttendanceCorrection_employeeId_fkey" 
        FOREIGN KEY ("employeeId") 
        REFERENCES "Employee"("id") 
        ON DELETE CASCADE;
    END IF;
END $$;

