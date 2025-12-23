# Incoming Traceability Setup Instructions

## Issue
The API calls are failing because the database tables for the traceability feature haven't been created yet.

## Solution

### Step 1: Generate Prisma Client
First, regenerate the Prisma client to include the new models:

```bash
npm run db:generate
```

Or directly:
```bash
npx prisma generate
```

### Step 2: Create and Run Database Migration
Create a migration for the new traceability tables:

```bash
npm run db:migrate
```

Or directly:
```bash
npx prisma migrate dev --name add_incoming_traceability
```

This will:
1. Create a new migration file
2. Apply the migration to your database
3. Generate the Prisma client automatically

### Step 3: Verify
After running the migration, the API endpoints should work correctly. You can verify by:
1. Refreshing the traceability page - the statistics should load (may show 0 if no data exists yet)
2. Checking the browser console - there should be no 500 errors

## Alternative: If Migration Fails

If you encounter issues with migrations, you can use `db push` instead (this is for development only):

```bash
npm run db:push
```

**Note:** `db push` doesn't create migration files and is not recommended for production.

## Node Version Requirement

**Important:** Prisma 5.x requires Node.js 16 or higher. Your current Node version (12.15.0) is too old.

To upgrade Node.js:
1. Use nvm (Node Version Manager):
   ```bash
   nvm install 18
   nvm use 18
   ```

2. Or use the latest LTS version:
   ```bash
   nvm install --lts
   nvm use --lts
   ```

After upgrading Node.js, run the migration commands again.

## Temporary Fix

I've added error handling to the API routes that will return empty arrays instead of 500 errors if the tables don't exist yet. This allows the frontend to load without crashing, but you still need to run the migration to actually use the feature.

