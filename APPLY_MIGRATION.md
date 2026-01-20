# Apply Document Content Migration

The document editing feature requires database tables that need to be created. Since automated Prisma migrations are failing due to Node.js version compatibility, please apply the migration manually.

## Option 1: Apply Migration SQL Directly

Connect to your PostgreSQL database and run the SQL from:
`prisma/migrations/20250120000001_add_document_content_tracking/migration.sql`

Or run this SQL directly:

```sql
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

-- AddForeignKey
ALTER TABLE "DocumentContent" DROP CONSTRAINT IF EXISTS "DocumentContent_documentId_fkey";
ALTER TABLE "DocumentContent" ADD CONSTRAINT "DocumentContent_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentRevision" DROP CONSTRAINT IF EXISTS "DocumentRevision_documentId_fkey";
ALTER TABLE "DocumentRevision" ADD CONSTRAINT "DocumentRevision_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

## Option 2: Use Prisma Studio or Database Client

1. Open your database client (pgAdmin, DBeaver, etc.)
2. Connect to your database
3. Run the SQL from the migration file

## Option 3: Generate Prisma Client After Migration

After applying the migration, regenerate the Prisma client:

```bash
npx prisma generate
```

## Verify Migration

After applying the migration, the document editing feature should work. You can verify by:
1. Restarting your Next.js server
2. Navigating to any document page
3. Edit buttons should appear for admin users
4. Editing and saving should work without errors

