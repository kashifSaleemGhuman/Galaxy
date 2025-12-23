# Server Restart Required

## Issue
The warehouse and IGP APIs are failing with 500 errors because the Next.js dev server is using a cached version of the Prisma client that doesn't include the new `SupplierLeatherWarehouse` model.

## Solution

**You need to restart your Next.js development server:**

1. **Stop the current dev server** (Ctrl+C in the terminal where it's running)

2. **Restart the dev server:**
   ```bash
   npm run dev
   ```

3. **Verify the fix:**
   - The warehouse API should now work
   - The IGP API should now work
   - You should be able to create warehouses and IGPs

## Why This Happens

When you add new Prisma models:
1. The Prisma schema is updated ✓
2. The Prisma client is regenerated ✓
3. **BUT** the Next.js dev server caches the Prisma client module
4. The server needs to be restarted to load the new Prisma client

## Alternative: Clear Next.js Cache

If restarting doesn't work, try clearing the Next.js cache:

```bash
rm -rf .next
npm run dev
```

This will force Next.js to rebuild everything from scratch.

