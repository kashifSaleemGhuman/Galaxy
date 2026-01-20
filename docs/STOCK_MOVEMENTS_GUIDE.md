# Stock Movements System - Complete Usage Guide

## Overview
The Stock Movements system allows you to track all inventory movements including stock in, stock out, transfers between warehouses, and adjustments. All movements are automatically synced with inventory levels.

## Features

### ✅ Fully Functional Features

1. **Stock In** - Add inventory to a warehouse
2. **Stock Out** - Remove inventory from a warehouse
3. **Transfers** - Move inventory between warehouses
4. **Adjustments** - Correct inventory discrepancies
5. **Location Management** - Assign locations within warehouses
6. **Real-time Updates** - Data refreshes every 5 seconds
7. **Search & Filters** - Filter by type, warehouse, date, and search terms

## How to Use

### 1. Stock In (Adding Inventory)

**When to use:** When receiving goods from suppliers, returns, or any addition to inventory.

**Steps:**
1. Go to **Inventory → Stock Movements**
2. Click the green **"Stock In"** button
3. Fill in the form:
   - **Product** (required): Select the product from dropdown
   - **Warehouse** (required): Select destination warehouse
   - **Location** (optional): Select specific location within warehouse
   - **Quantity** (required): Enter the quantity being added
   - **Reason** (optional): Why stock is being added (e.g., "Received from supplier")
   - **Reference** (optional): PO number, receipt number, etc.
4. Click **"Save"**

**What happens:**
- Creates a stock movement record
- Updates inventory quantity in the warehouse
- If location is specified, assigns inventory to that location
- Creates inventory item if it doesn't exist

---

### 2. Stock Out (Removing Inventory)

**When to use:** When shipping to customers, internal use, damage, or any removal from inventory.

**Steps:**
1. Go to **Inventory → Stock Movements**
2. Click the red **"Stock Out"** button
3. Fill in the form:
   - **Product** (required): Select the product
   - **Warehouse** (required): Select source warehouse
   - **Location** (optional): Select specific location
   - **Quantity** (required): Enter the quantity being removed
   - **Reason** (optional): Why stock is being removed (e.g., "Sold to customer")
   - **Reference** (optional): Sales order number, etc.
4. Click **"Save"**

**What happens:**
- Creates a stock movement record (with negative quantity)
- Decreases inventory quantity in the warehouse
- Prevents going below 0 (quantity stays at 0 minimum)

---

### 3. Transfers (Moving Between Warehouses)

**When to use:** When moving inventory from one warehouse to another.

**Steps:**
1. Go to **Inventory → Stock Movements**
2. Click the blue **"Transfer"** button
3. Fill in transfer details:
   - **From Warehouse** (required): Source warehouse
   - **To Warehouse** (required): Destination warehouse
   - **Reference** (optional): Transfer reference number
   - **Notes** (optional): Additional notes
4. Add transfer lines:
   - Click **"Add Line"**
   - Select **Product**
   - Select **From Location** (optional)
   - Select **To Location** (optional)
   - Enter **Quantity**
   - Add line notes (optional)
5. Click **"Create Transfer"**

**What happens:**
- Creates TWO stock movements:
  - One "out" movement from source warehouse (negative quantity)
  - One "in" movement to destination warehouse (positive quantity)
- Updates inventory in both warehouses
- Checks that source warehouse has sufficient stock
- Both movements share the same reference number

**Important:** 
- Source warehouse must have enough stock
- You cannot transfer to the same warehouse
- Both warehouses must exist

---

### 4. Adjustments (Correcting Inventory)

**When to use:** When you need to correct inventory discrepancies (cycle counts, found items, damaged items, etc.).

**Steps:**
1. Go to **Inventory → Stock Movements**
2. Click the orange **"Adjustment"** button
3. Fill in adjustment details:
   - **Warehouse** (required): Select warehouse
   - **Reason** (required): Why adjustment is needed (damage, found, cycle count, etc.)
   - **Reference** (optional): Adjustment reference number
   - **Notes** (optional): Additional notes
4. Add adjustment lines:
   - Click **"Add Line"**
   - Select **Product**
   - Enter **Expected Quantity**: What the system shows
   - Enter **Actual Quantity**: What you physically counted
   - Select **Location** (optional)
   - Add line notes (optional)
   - The **Difference** is calculated automatically
5. Click **"Create Adjustment"**

**What happens:**
- Creates stock movement with the difference (positive or negative)
- Updates inventory to match actual quantity
- If actual > expected: Adds stock (positive adjustment)
- If actual < expected: Removes stock (negative adjustment)
- If actual = expected: No movement created (skipped)

**Example:**
- Expected: 100 units
- Actual: 95 units
- Difference: -5 (removes 5 units)

---

## Viewing Stock Movements

### Filters Available

1. **Type Filter:**
   - All Types
   - Stock In
   - Stock Out
   - Transfer
   - Adjustment

2. **Warehouse Filter:**
   - All Warehouses
   - Specific warehouse

3. **Date Range Filter:**
   - All Time
   - Today
   - This Week
   - This Month

4. **Search:**
   - Search by product name, SKU, warehouse name, or reference number

### Statistics Cards

The dashboard shows:
- **Total Movements**: All movements count
- **Stock In**: Count of stock in movements
- **Stock Out**: Count of stock out movements
- **Transfers**: Count of transfer movements

### Table View

Columns displayed:
- **Movement**: Product name and SKU with icon
- **Type**: Movement type badge (color-coded)
- **Quantity**: Positive (green) or negative (red)
- **Warehouse**: Warehouse name and code
- **Location**: Location code and name (if assigned)
- **Reference**: Reference number and type
- **Cost**: Total cost (if available)
- **User**: User who created the movement
- **Date**: Movement date and time

### Grid View

Switch to grid view for a card-based layout showing all movement details.

---

## Data Synchronization

### Automatic Updates
- Inventory levels update immediately when movements are created
- Stock movements list refreshes every 5 seconds
- All changes are saved to the database in real-time

### Inventory Impact

**Stock In:**
- Increases warehouse inventory
- Creates inventory item if it doesn't exist
- Updates available quantity

**Stock Out:**
- Decreases warehouse inventory
- Cannot go below 0 (stays at 0 minimum)
- Updates available quantity

**Transfer:**
- Decreases source warehouse inventory
- Increases destination warehouse inventory
- Creates inventory item in destination if needed
- Validates sufficient stock in source

**Adjustment:**
- Updates inventory to match actual count
- Can increase or decrease inventory
- Creates inventory item if adjustment is positive and item doesn't exist

---

## Permissions

### Who Can Do What

**View Movements:**
- SUPER_ADMIN
- ADMIN
- INVENTORY_MANAGER
- INVENTORY_USER
- WAREHOUSE_OPERATOR

**Create Movements (Stock In/Out):**
- SUPER_ADMIN
- ADMIN
- INVENTORY_MANAGER
- WAREHOUSE_OPERATOR

**Create Transfers:**
- SUPER_ADMIN
- ADMIN
- INVENTORY_MANAGER
- WAREHOUSE_OPERATOR

**Create Adjustments:**
- SUPER_ADMIN
- ADMIN
- INVENTORY_MANAGER

---

## Best Practices

1. **Always use references** for traceability (PO numbers, SO numbers, etc.)
2. **Add reasons** to explain why movements occurred
3. **Use locations** to track where items are stored within warehouses
4. **Verify quantities** before creating movements
5. **Use adjustments** for cycle counts and corrections
6. **Check inventory levels** before creating stock out or transfers

---

## Common Scenarios

### Scenario 1: Receiving Goods from Supplier
1. Create **Stock In** movement
2. Reference: PO number
3. Reason: "Received from supplier"
4. Add location if known

### Scenario 2: Shipping to Customer
1. Create **Stock Out** movement
2. Reference: Sales order number
3. Reason: "Shipped to customer"
4. Select location if items are stored in specific location

### Scenario 3: Moving Stock Between Warehouses
1. Create **Transfer**
2. Select from and to warehouses
3. Add all products being transferred
4. Reference: Transfer number

### Scenario 4: Cycle Count Adjustment
1. Create **Adjustment**
2. Reason: "Cycle count"
3. For each product:
   - Enter expected (system quantity)
   - Enter actual (counted quantity)
   - System calculates difference

---

## Troubleshooting

### Issue: "Insufficient stock" error on transfer
**Solution:** Check that source warehouse has enough inventory. Use Stock In to add inventory first.

### Issue: Location not showing in dropdown
**Solution:** Make sure you've created locations for the warehouse. Go to Warehouses → Manage Locations.

### Issue: Movement not appearing in list
**Solution:** 
- Wait a few seconds (auto-refresh every 5 seconds)
- Check filters (might be filtered out)
- Refresh the page

### Issue: Inventory not updating
**Solution:** 
- Check that movement was created successfully
- Verify product and warehouse exist
- Check browser console for errors

---

## API Endpoints

### GET /api/inventory/movements
Get all stock movements with filters

**Query Parameters:**
- `type`: Movement type (in, out, transfer, adjustment)
- `warehouseId`: Filter by warehouse
- `search`: Search term
- `page`: Page number
- `limit`: Items per page

### POST /api/inventory/movements
Create a stock movement (Stock In/Out)

**Body:**
```json
{
  "productId": "product_id",
  "warehouseId": "warehouse_id",
  "locationId": "location_id (optional)",
  "type": "in|out",
  "quantity": 10,
  "reason": "Reason for movement",
  "reference": "PO-001"
}
```

### POST /api/inventory/transfers
Create a transfer between warehouses

**Body:**
```json
{
  "fromWarehouseId": "warehouse_id",
  "toWarehouseId": "warehouse_id",
  "reference": "TR-001",
  "notes": "Transfer notes",
  "lines": [
    {
      "productId": "product_id",
      "quantity": 5,
      "fromLocationId": "location_id (optional)",
      "toLocationId": "location_id (optional)",
      "reason": "Line notes"
    }
  ]
}
```

### POST /api/inventory/adjustments
Create an adjustment

**Body:**
```json
{
  "warehouseId": "warehouse_id",
  "reason": "Cycle count",
  "reference": "ADJ-001",
  "lines": [
    {
      "productId": "product_id",
      "expectedQuantity": 100,
      "actualQuantity": 95,
      "locationId": "location_id (optional)",
      "notes": "Line notes"
    }
  ]
}
```

---

## Summary

The Stock Movements system is now fully functional with:
- ✅ Stock In/Out operations
- ✅ Warehouse transfers
- ✅ Inventory adjustments
- ✅ Location management
- ✅ Real-time data synchronization
- ✅ Complete audit trail
- ✅ Automatic inventory updates

All data is synced between frontend and backend, and inventory levels are automatically maintained.


