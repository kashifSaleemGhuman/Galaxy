# Adding Warehouses and Inventory

This guide explains how to add warehouses and inventory items to your Galaxy ERP system.

## Problem

When creating a sales order from a quotation, you may see:
- **Empty warehouses list**: No warehouses are available to select
- **N/A for available stock**: Products show "N/A" because they don't have inventory items created

## Solution

### Option 1: Using the Script (Recommended for Quick Setup)

Run the provided script to automatically create warehouses and add inventory for all products:

```bash
node scripts/add-warehouses-and-inventory.js
```

This script will:
1. Create 3 default warehouses (if they don't exist):
   - Main Warehouse (WH-001)
   - Secondary Warehouse (WH-002)
   - Distribution Center (WH-003)
2. Add inventory items for all active products in all warehouses
3. Set initial stock quantities (100 units per product per warehouse)

### Option 2: Using the Web UI

#### Adding Warehouses

1. **Login as SUPER_ADMIN** (only SUPER_ADMIN can create warehouses)
2. Navigate to **Inventory → Warehouses** (`/dashboard/inventory/warehouses`)
3. Click **"Add Warehouse"** button
4. Fill in the form:
   - **Name**: e.g., "Main Warehouse"
   - **Code**: e.g., "WH-001" (must be unique)
   - **Address**: Optional warehouse address
   - **Status**: Active/Inactive
5. Click **"Save"**

#### Adding Inventory Items

Currently, inventory items are created automatically when:
- Products are created with `trackQuantity: true` and a `warehouseId` is provided
- Incoming shipments are processed
- Stock movement requests are approved

**To add inventory manually via API:**

You can use the new `/api/inventory/items` endpoint:

```bash
# Create or update inventory item
curl -X POST http://localhost:3000/api/inventory/items \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{
    "productId": "product-id-here",
    "warehouseId": "warehouse-id-here",
    "quantity": 100,
    "minLevel": 10,
    "maxLevel": 1000
  }'
```

**Required permissions**: SUPER_ADMIN, ADMIN, or WAREHOUSE_OPERATOR

### Option 3: Direct Database Insert (Advanced)

If you need to add inventory directly to the database:

```sql
-- First, get product and warehouse IDs
SELECT id, name FROM "Product" WHERE name = 'Your Product Name';
SELECT id, name FROM "Warehouse" WHERE code = 'WH-001';

-- Then insert inventory item
INSERT INTO "inventory_items" (
  "id",
  "product_id",
  "warehouse_id",
  "quantity",
  "available",
  "reserved",
  "minLevel",
  "maxLevel",
  "createdAt",
  "updatedAt"
) VALUES (
  gen_random_uuid()::text,  -- or use cuid() if available
  'product-id-here',
  'warehouse-id-here',
  100,  -- quantity
  100,  -- available (should equal quantity if no reserved)
  0,    -- reserved
  10,   -- minLevel
  1000, -- maxLevel
  NOW(),
  NOW()
);
```

## Fixing "N/A" Stock in Quotations

The "N/A" appears when quotation items don't have a `productId`. This happens when:
- Items were added manually without selecting from the product list
- Products were deleted after the quotation was created

**To fix this:**

1. **Edit the quotation** (if status is 'draft' or 'rejected')
2. **Remove items without productId** or **re-add them using the product selector**
3. When adding items, use the product selector to ensure `productId` is set
4. Save the quotation

## Verifying Inventory

### Check Inventory via API

```bash
# Get stock availability for a product
curl http://localhost:3000/api/inventory/products/{productId}/stock-availability

# Get inventory items
curl http://localhost:3000/api/inventory/items?productId={productId}&warehouseId={warehouseId}
```

### Check in Web UI

1. Navigate to **Inventory → Products**
2. Click on a product to view details
3. Check the "Stock" or "Inventory" section to see available quantities per warehouse

## Troubleshooting

### No Warehouses Showing

1. **Check if warehouses exist:**
   ```bash
   curl http://localhost:3000/api/inventory/warehouses
   ```

2. **Verify user permissions**: Only SUPER_ADMIN can create warehouses via UI

3. **Check warehouse status**: Ensure warehouses are marked as `isActive: true`

### Inventory Shows Zero or N/A

1. **Verify inventory items exist:**
   - Check if `InventoryItem` records exist for the product-warehouse combination
   - Run the setup script to create inventory items

2. **Check product tracking:**
   - Ensure products have `trackQuantity: true`
   - Products with `trackQuantity: false` won't show inventory

3. **Verify productId in quotation items:**
   - Quotation items need `productId` to check inventory
   - Items added manually without product selection won't have `productId`

### API Returns Empty Warehouses

The API endpoint `/api/inventory/warehouses` returns warehouses based on:
- User's tenant (if multi-tenant)
- Active status filter
- Search term

Make sure:
- Warehouses are created and active
- User has proper permissions
- No search/filter is hiding results

## Next Steps

After adding warehouses and inventory:

1. **Create Sales Orders**: You can now create sales orders from sent quotations
2. **Track Stock Movements**: Inventory changes will be tracked automatically
3. **Set Reorder Points**: Configure `minLevel` and `maxLevel` for automatic reordering
4. **Process Shipments**: Use incoming shipments to add inventory in bulk

## Related Documentation

- [Inventory Management Guide](./STOCK_MOVEMENTS_GUIDE.md)
- [Warehouse Setup](./TRACEABILITY_SETUP.md)
- [Sales Order Creation](./NAVIGATION_FLOW.md)
