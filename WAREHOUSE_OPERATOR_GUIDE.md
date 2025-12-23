# Warehouse Operator Testing Guide

## 🎯 Complete Flow Testing

This guide will help you test the complete warehouse operator workflow from PO creation to stock addition.

## 👥 User Accounts

### Warehouse Operator
- **Email**: `warehouse.operator@galaxy.com`
- **Password**: `warehouse123`
- **Role**: `INVENTORY_USER`
- **Status**: ✅ **WORKING** - Password properly hashed and login verified

### Inventory Manager  
- **Email**: `inventory.manager@galaxy.com`
- **Password**: `inventory123`
- **Role**: `INVENTORY_MANAGER`
- **Status**: ✅ **WORKING** - Password properly hashed and login verified

### Purchase Manager
- **Email**: `purchase.manager@galaxy.com`
- **Password**: `purchase123`
- **Role**: `PURCHASE_MANAGER`

## 🖥️ Warehouse Operator Interface

### What the Warehouse Operator Sees:
1. **Dashboard Navigation**: 
   - ✅ **Warehouse module** visible in sidebar (separate from inventory)
   - ✅ **No access** to inventory module (restricted to inventory managers)
   - ✅ **No access** to purchase module (restricted to purchase managers)

2. **Available Pages** (Warehouse Module Only):
   - **Warehouse Dashboard** (`/dashboard/warehouse`) - Main warehouse operations dashboard
   - **Incoming Shipments** (`/dashboard/warehouse/shipments`) - View assigned shipments
   - **Process Goods** (`/dashboard/warehouse/process`) - **Main interface for processing shipments**
   - **Completed Tasks** (`/dashboard/warehouse/completed`) - View processed/rejected shipments

3. **Warehouse Module Features**:
   - ✅ View only shipments assigned to warehouses (not pending ones)
   - ✅ See shipment details (PO, supplier, items, quantities, warehouse)
   - ✅ Process shipments (confirm receipt and add stock to inventory)
   - ✅ Reject shipments if goods don't match or are damaged
   - ✅ View completed tasks and processing history
   - ✅ Real-time status updates and notifications

## 🔄 Complete Workflow Steps

### Step 1: Create and Approve Purchase Order
1. **Login as Purchase Manager** (`purchase.manager@galaxy.com`)
2. **Go to Purchase → Purchase Orders**
3. **Click "Create Purchase Order"**
4. **Fill in the form:**
   - Select Supplier: "Acme Supplies Ltd"
   - Add Product: "Desk Chair Ergonomic" (Quantity: 10, Price: $200)
5. **Click "Create Purchase Order"**
6. **Find the created PO in the list**
7. **Click "Approve" button** (this creates the incoming shipment)

### Step 2: Assign Warehouse (Inventory Manager)
1. **Login as Inventory Manager** (`inventory.manager@galaxy.com`)
2. **Go to Inventory → Incoming Shipments**
3. **Find the shipment with status "pending"**
4. **Click "Assign Warehouse"**
5. **Select a warehouse and confirm**

### Step 3: Process Shipment (Warehouse Operator)
1. **Login as Warehouse Operator** (`warehouse.operator@galaxy.com`)
2. **See "Warehouse" module in sidebar** (not inventory module)
3. **Go to Warehouse → Process Goods**
4. **Find the shipment with status "assigned"**
5. **Review shipment details and items**
6. **Click "Process" to confirm receipt** (adds stock to inventory)
7. **Or click "Reject" if goods don't match**

### Step 4: Verify Stock (Inventory Manager)
1. **Login as Inventory Manager** (`inventory.manager@galaxy.com`)
2. **Go to Inventory → Stock**
3. **Verify the product appears in inventory with correct quantity**

## 🏢 Available Warehouses

- **Main Warehouse** (WH-MAIN)
- **Secondary Warehouse** (WH-SEC)
- **Cold Storage** (WH-COLD)
- **Raw Materials Warehouse** (WH-RAW)

## 📦 Current Test Data

### Products Available
- Desk Chair Ergonomic ($200)
- A4 Paper 80gsm ($5)
- Heavy Duty Stapler ($15)
- Black Ink Cartridge ($25)

### Suppliers Available
- Acme Supplies Ltd
- Global Tech Solutions
- Office Depot Pro
- Industrial Supplies Co

## 🔧 API Endpoints Used

### Purchase Module (Purchase Manager)
- `POST /api/purchase/purchase-orders` - Create PO
- `POST /api/purchase/purchase-orders/[id]/approve` - Approve PO

### Inventory Module (Inventory Manager)
- `GET /api/inventory/incoming-shipments` - List shipments
- `POST /api/inventory/incoming-shipments/[id]/assign-warehouse` - Assign warehouse
- `GET /api/inventory/items` - Get inventory items

### Warehouse Module (Warehouse Operator)
- `GET /api/warehouse/shipments` - List assigned shipments
- `POST /api/warehouse/shipments/[id]/process` - Process shipment
- `POST /api/warehouse/shipments/[id]/reject` - Reject shipment

## ✅ Expected Results

After completing the workflow:

1. **PO Status**: `approved` → `received`
2. **Shipment Status**: `pending` → `assigned` → `processed`
3. **Inventory**: Product appears in stock with correct quantity
4. **Stock Movement**: Record created showing goods received

## 🧪 Test URLs

### Warehouse Operator Test
- **Login**: `warehouse.operator@galaxy.com` / `warehouse123`
- **Dashboard**: http://localhost:3000/dashboard/warehouse
- **Process Goods**: http://localhost:3000/dashboard/warehouse/process
- **Individual Shipment**: http://localhost:3000/dashboard/warehouse/process/cmhazing50001oe80fpvrv7um

### Inventory Manager Test
- **Login**: `inventory.manager@galaxy.com` / `inventory123`
- **Dashboard**: http://localhost:3000/dashboard/inventory
- **Incoming Shipments**: http://localhost:3000/dashboard/inventory/incoming-shipments

### Purchase Manager Test
- **Login**: `purchase.manager@galaxy.com` / `purchase123`
- **Dashboard**: http://localhost:3000/dashboard/purchase
- **Purchase Orders**: http://localhost:3000/dashboard/purchase/purchase-orders

## 🐛 Troubleshooting

### If you don't see incoming shipments:
- Make sure PO is approved (not just sent)
- Check that you're logged in as the correct role

### If warehouse operator can't process:
- Ensure shipment is assigned to a warehouse first
- Check that shipment status is "assigned"

### If stock doesn't appear:
- Verify shipment was processed successfully
- Check inventory manager has access to stock page
- Ensure product exists in the system

## 📊 Database Tables Involved

- `PurchaseOrder` - PO records
- `IncomingShipment` - Shipment records  
- `IncomingShipmentLine` - Shipment line items
- `InventoryItem` - Stock levels
- `StockMovement` - Stock transaction history
- `Warehouse` - Warehouse locations

## 🎉 Success Indicators

- ✅ PO shows "approved" status
- ✅ Incoming shipment appears in inventory module
- ✅ Warehouse operator can see assigned shipments
- ✅ Confirmation adds stock to inventory
- ✅ Inventory manager can see updated stock levels
- ✅ Stock movements are recorded

---

**Note**: All test data is already created and ready for testing. The complete flow has been verified and is working correctly.
