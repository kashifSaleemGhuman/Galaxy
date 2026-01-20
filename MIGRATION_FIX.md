# Fix Failed Migration Issue

## Problem
The migration `20251102183555_add_rfq_item_pricing` is marked as failed in the database, blocking new migrations from being applied.

## Solution

Run these commands in order:

### Step 1: Mark the failed migration as rolled back
```bash
npx prisma migrate resolve --rolled-back 20251102183555_add_rfq_item_pricing
```

This tells Prisma that the failed migration has been rolled back and it's safe to continue.

### Step 2: Deploy remaining migrations
```bash
npx prisma migrate deploy
```

This will apply all pending migrations that haven't been run yet.

### Step 3: Regenerate Prisma Client
```bash
npx prisma generate
```

### Step 4: Restart your dev server
```bash
# Stop current server (Ctrl+C), then:
npm run dev
```

## Alternative: If migrate resolve doesn't work

If the above doesn't work, you can manually fix the migration table:

1. Connect to your database:
```bash
psql -d galaxy_erp -U postgres
```

2. Check the migration status:
```sql
SELECT * FROM "_prisma_migrations" WHERE migration_name = '20251102183555_add_rfq_item_pricing';
```

3. Delete the failed migration record:
```sql
DELETE FROM "_prisma_migrations" WHERE migration_name = '20251102183555_add_rfq_item_pricing';
```

4. Then run `npx prisma migrate deploy` again.

## Quick Fix (Development Only)

If you're in development and want to bypass migrations entirely:

```bash
npx prisma db push
```

This will sync your schema directly to the database without using migrations. **Warning:** This is for development only and will not create migration files.

