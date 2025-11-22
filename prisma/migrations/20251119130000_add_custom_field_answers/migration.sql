-- Add customFieldAnswers column to RFQItem
ALTER TABLE "RFQItem"
ADD COLUMN IF NOT EXISTS "customFieldAnswers" JSONB NOT NULL DEFAULT '{}'::jsonb;

