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

