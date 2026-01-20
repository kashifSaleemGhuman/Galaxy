-- CreateTable
CREATE TABLE IF NOT EXISTS "DocumentContent" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "documentName" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "revisionNo" INTEGER NOT NULL DEFAULT 1,
    "revisionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastEditedBy" TEXT,
    "lastEditedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "DocumentRevision" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "documentName" TEXT NOT NULL,
    "revisionNo" INTEGER NOT NULL,
    "revisionDate" TIMESTAMP(3) NOT NULL,
    "content" JSONB NOT NULL,
    "editedBy" TEXT,
    "changeDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentRevision_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "DocumentContent_documentId_key" ON "DocumentContent"("documentId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "DocumentContent_documentName_idx" ON "DocumentContent"("documentName");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "DocumentRevision_documentId_idx" ON "DocumentRevision"("documentId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "DocumentRevision_documentName_idx" ON "DocumentRevision"("documentName");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "DocumentRevision_documentId_revisionNo_key" ON "DocumentRevision"("documentId", "revisionNo");

-- AddForeignKey (drop if exists first to avoid errors)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'DocumentContent_documentId_fkey') THEN
        ALTER TABLE "DocumentContent" DROP CONSTRAINT "DocumentContent_documentId_fkey";
    END IF;
END $$;

ALTER TABLE "DocumentContent" ADD CONSTRAINT "DocumentContent_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey (drop if exists first to avoid errors)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'DocumentRevision_documentId_fkey') THEN
        ALTER TABLE "DocumentRevision" DROP CONSTRAINT "DocumentRevision_documentId_fkey";
    END IF;
END $$;

ALTER TABLE "DocumentRevision" ADD CONSTRAINT "DocumentRevision_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

