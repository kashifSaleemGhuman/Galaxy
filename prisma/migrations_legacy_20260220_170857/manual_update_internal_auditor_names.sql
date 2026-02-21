-- Migration: Update internalAuditorName to internalAuditorNames (String to Json array)
-- Run this SQL script manually if Prisma CLI is not working due to Node.js version

-- Step 1: Add the new column (nullable Json)
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "internalAuditorNames" JSONB DEFAULT '[]'::jsonb;

-- Step 2: Migrate existing data (convert single string to array)
-- If internalAuditorName has a value, convert it to a JSON array
UPDATE "Organization" 
SET "internalAuditorNames" = CASE 
    WHEN "internalAuditorName" IS NOT NULL AND "internalAuditorName" != '' 
    THEN jsonb_build_array("internalAuditorName")
    ELSE '[]'::jsonb
END
WHERE "internalAuditorNames" IS NULL;

-- Step 3: Remove the old column (after verifying data migration)
-- Uncomment the line below after verifying the migration worked correctly
-- ALTER TABLE "Organization" DROP COLUMN IF EXISTS "internalAuditorName";


