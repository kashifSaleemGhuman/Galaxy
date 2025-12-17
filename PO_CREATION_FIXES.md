# Purchase Order Creation Fixes

## Issues Found and Fixed

### 1. **Incorrect Prisma Model Names**
**Problem**: The API was using `pO_Line` instead of the correct `pOLine` model name.

**Files Fixed**:
- `/src/app/api/purchase/purchase-orders/from-rfq/route.js`
- `/src/app/api/purchase/purchase-orders/route.js`
- `/src/app/api/purchase/purchase-orders/[id]/route.js`
- `/src/app/api/purchase/po-lines/route.js`

**Fix**: Changed all instances of `prisma.pO_Line` to `prisma.pOLine`

### 2. **Missing Product ID Handling**
**Problem**: RFQ items might not have `productId` directly, could be nested in `product.id`.

**Fix**: Added fallback logic:
```javascript
productId: item.productId || item.product?.id
```

### 3. **Enhanced Error Handling**
**Problem**: Generic error messages made debugging difficult.

**Fix**: Added detailed error logging:
```javascript
console.error('Error details:', {
  name: error.name,
  message: error.message,
  code: error.code,
  meta: error.meta
});
```

### 4. **Added Data Validation**
**Problem**: No validation for required RFQ data.

**Fix**: Added validation for:
- RFQ vendor information
- RFQ items existence
- RFQ status verification

### 5. **Improved PO Line ID Generation**
**Problem**: Random string generation could cause conflicts.

**Fix**: Used timestamp + index for unique IDs:
```javascript
poLineId: `POL-${Date.now()}-${index}`
```

## Database Schema Updates

### Prisma Schema Sync
- Ran `npx prisma db push` to sync database with schema
- Ran `npx prisma generate` to update Prisma client
- Added missing models: `PurchaseOrder`, `POLine`, `Supplier`, `GoodsReceipt`, `VendorBill`

## Testing the Fix

### Expected Behavior
1. User clicks "Create Purchase Order" on approved RFQ
2. API validates RFQ data and creates supplier if needed
3. Creates purchase order with lines from RFQ items
4. Returns success response with PO details
5. User is redirected to PO details page

### API Endpoint
```
POST /api/purchase/purchase-orders/from-rfq
```

### Request Body
```json
{
  "rfqId": "rfq-123",
  "poNumber": "PO-2024-001",
  "notes": "Created from RFQ RFQ-2024-001"
}
```

### Success Response
```json
{
  "success": true,
  "message": "Purchase order created successfully",
  "data": {
    "poId": "PO-2024-001",
    "rfqId": "rfq-123",
    "supplierId": "SUP-123",
    "status": "draft",
    "lines": [...],
    "totalAmount": 600.00
  }
}
```

## Files Modified

1. **API Routes**:
   - `src/app/api/purchase/purchase-orders/from-rfq/route.js`
   - `src/app/api/purchase/purchase-orders/route.js`
   - `src/app/api/purchase/purchase-orders/[id]/route.js`
   - `src/app/api/purchase/po-lines/route.js`

2. **Database Schema**:
   - `prisma/schema.prisma` (added missing models)

3. **Frontend Components**:
   - `src/app/dashboard/purchase/_components/rfq/RfqDetails.jsx`
   - `src/app/dashboard/purchase/_components/rfq/constants.js`

## Next Steps

1. Test the purchase order creation from approved RFQ
2. Verify the PO details page loads correctly
3. Test sending the PO to vendor
4. Verify all CRUD operations work for purchase orders

## Debugging Tips

If issues persist, check:
1. Database connection in `.env`
2. Prisma client generation: `npx prisma generate`
3. Database sync: `npx prisma db push`
4. Server logs for detailed error messages
5. Network tab in browser dev tools for API responses
