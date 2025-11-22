-- Alter Product to support custom attributes and traceability questions
ALTER TABLE "Product"
ADD COLUMN IF NOT EXISTS "attributes" JSONB NOT NULL DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS "traceabilityQuestions" JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Store vendor-provided traceability answers per RFQ item
ALTER TABLE "RFQItem"
ADD COLUMN IF NOT EXISTS "traceabilityAnswers" JSONB NOT NULL DEFAULT '[]'::jsonb;

