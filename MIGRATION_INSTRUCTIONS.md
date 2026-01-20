# How to Apply the Document Content Migration

The migration needs to be applied to enable document editing functionality. Here are the steps:

## Option 1: Use the Web Interface (Recommended)

1. **Navigate to any document page** (e.g., KPI page: `/dashboard/organization/kpi`)
2. **Click the "Apply Migration" button** in the red warning banner
3. **On the migration page**, click "Apply Migration" button
4. **Wait for completion** - you'll see success messages
5. **Refresh the page** - the warning should disappear and edit buttons will work

## Option 2: Use the API Endpoint Directly

If you have access to make authenticated API calls:

```bash
# Make sure you're logged in as admin, then:
curl -X POST http://localhost:3000/api/organization/documents/apply-migration \
  -H "Cookie: your-session-cookie" \
  -H "Content-Type: application/json"
```

## Option 3: Manual SQL Execution

If the above methods don't work, you can run the SQL manually:

1. **Connect to your PostgreSQL database** using any database client (pgAdmin, DBeaver, psql, etc.)
2. **Open the migration file**: `prisma/migrations/20250120000001_add_document_content_tracking/migration.sql`
3. **Execute all SQL statements** in the file
4. **Verify** by checking if these tables exist:
   - `DocumentContent`
   - `DocumentRevision`

## Verification

After applying the migration, verify it worked by:

1. **Restart your Next.js server**
2. **Navigate to any document page**
3. **Check that**:
   - No red migration warning appears
   - Edit buttons are visible (for admin users)
   - You can edit and save document content

## Troubleshooting

If you encounter errors:

1. **Check database connection** - Make sure DATABASE_URL is correct
2. **Check permissions** - Ensure the database user has CREATE TABLE permissions
3. **Check if tables already exist** - The migration uses `IF NOT EXISTS` so it's safe to run multiple times
4. **Check server logs** - Look for any error messages in the console

## Migration Details

The migration creates:
- **DocumentContent table**: Stores current document content and revision info
- **DocumentRevision table**: Stores revision history
- **Indexes**: For efficient queries
- **Foreign Keys**: Links to Document table

All tables use `IF NOT EXISTS` so running the migration multiple times is safe.


