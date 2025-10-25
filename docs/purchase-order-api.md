# Purchase Order API Documentation

This document describes the Purchase Order APIs that allow creating, managing, and sending purchase orders to vendors after RFQ approval.

## Overview

The Purchase Order system integrates with the RFQ workflow. After a manager approves an RFQ, purchase users can create purchase orders that will be sent to vendors.

## API Endpoints

### 1. Get Approved RFQs
**GET** `/api/purchase/rfqs/approved`

Retrieves approved RFQs that can be converted to purchase orders.

**Query Parameters:**
- `limit` (optional): Number of records to return (default: 50)
- `vendor_id` (optional): Filter by vendor ID

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "rfqId": "rfq-123",
      "rfqNumber": "RFQ-2024-001",
      "vendorId": "vendor-123",
      "vendorName": "ABC Suppliers",
      "vendorEmail": "contact@abcsuppliers.com",
      "createdByName": "John Doe",
      "approvedByName": "Jane Manager",
      "approvedAt": "2024-01-15T10:30:00Z",
      "vendorPrice": 1500.00,
      "expectedDelivery": "2024-02-15T00:00:00Z",
      "vendorNotes": "Best price available",
      "totalAmount": 1500.00,
      "itemCount": 3,
      "items": [
        {
          "productId": "prod-123",
          "productName": "Widget A",
          "quantity": 10,
          "unit": "pcs"
        }
      ],
      "hasPurchaseOrder": false,
      "purchaseOrderId": null,
      "purchaseOrderStatus": null
    }
  ],
  "count": 1
}
```

### 2. Create Purchase Order from RFQ
**POST** `/api/purchase/purchase-orders/from-rfq`

Creates a purchase order from an approved RFQ.

**Request Body:**
```json
{
  "rfqId": "rfq-123",
  "poNumber": "PO-2024-001",
  "notes": "Optional notes"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Purchase order created successfully",
  "data": {
    "poId": "PO-2024-001",
    "rfqId": "rfq-123",
    "supplierId": "SUP-123",
    "supplierName": "ABC Suppliers",
    "status": "draft",
    "dateCreated": "2024-01-15T10:30:00Z",
    "lines": [
      {
        "poLineId": "POL-123",
        "productId": "prod-123",
        "productName": "Widget A",
        "quantityOrdered": 10,
        "quantityReceived": 0,
        "price": 25.50,
        "totalAmount": 255.00
      }
    ],
    "totalAmount": 1500.00
  }
}
```

### 3. Create Standalone Purchase Order
**POST** `/api/purchase/purchase-orders`

Creates a purchase order without an RFQ.

**Request Body:**
```json
{
  "supplier_id": "SUP-123",
  "status": "draft",
  "lines": [
    {
      "product_id": "prod-123",
      "quantity_ordered": 10,
      "quantity_received": 0,
      "price": 25.50
    }
  ]
}
```

### 4. Get Purchase Orders
**GET** `/api/purchase/purchase-orders`

Retrieves all purchase orders with filtering options.

**Query Parameters:**
- `status` (optional): Filter by status (draft, sent, confirmed, received, cancelled)
- `supplier_id` (optional): Filter by supplier ID
- `limit` (optional): Number of records to return (default: 50)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "po_id": "PO-2024-001",
      "rfq_id": "rfq-123",
      "supplier_id": "SUP-123",
      "supplier_name": "ABC Suppliers",
      "date_created": "2024-01-15",
      "status": "draft",
      "total_amount": 1500.00,
      "line_count": 3
    }
  ]
}
```

### 5. Get Purchase Order by ID
**GET** `/api/purchase/purchase-orders/[id]`

Retrieves a specific purchase order with full details.

**Response:**
```json
{
  "success": true,
  "data": {
    "po_id": "PO-2024-001",
    "rfq_id": "rfq-123",
    "supplier_id": "SUP-123",
    "supplier_name": "ABC Suppliers",
    "supplier_email": "contact@abcsuppliers.com",
    "supplier_phone": "+1-555-0123",
    "date_created": "2024-01-15",
    "status": "draft",
    "total_amount": 1500.00,
    "lines": [
      {
        "po_line_id": "POL-123",
        "product_id": "prod-123",
        "product_name": "Widget A",
        "product_description": "High-quality widget",
        "quantity_ordered": 10,
        "quantity_received": 0,
        "price": 25.50,
        "line_total": 255.00
      }
    ]
  }
}
```

### 6. Update Purchase Order
**PUT** `/api/purchase/purchase-orders/[id]`

Updates a purchase order.

**Request Body:**
```json
{
  "status": "sent",
  "lines": [
    {
      "product_id": "prod-123",
      "quantity_ordered": 15,
      "quantity_received": 0,
      "price": 25.50
    }
  ]
}
```

### 7. Send Purchase Order to Vendor
**POST** `/api/purchase/purchase-orders/[id]/send`

Sends a purchase order to the vendor.

**Request Body:**
```json
{
  "notes": "Please process this purchase order",
  "deliveryDate": "2024-02-15"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Purchase Order sent to vendor successfully",
  "data": {
    "poId": "PO-2024-001",
    "status": "sent",
    "supplierName": "ABC Suppliers",
    "supplierEmail": "contact@abcsuppliers.com",
    "totalAmount": 1500.00,
    "lineCount": 3,
    "notes": "Please process this purchase order",
    "deliveryDate": "2024-02-15"
  }
}
```

### 8. Delete Purchase Order
**DELETE** `/api/purchase/purchase-orders/[id]`

Deletes a purchase order (only if status is 'draft').

## Authentication & Permissions

All endpoints require authentication. The following roles can access purchase order APIs:

- **SUPER_ADMIN**: Full access to all operations
- **ADMIN**: Full access to all operations
- **PURCHASE_MANAGER**: Full access to all operations
- **PURCHASE_USER**: Can create, view, and send purchase orders

## Status Flow

Purchase orders follow this status flow:

1. **draft** - Initial state when created
2. **sent** - Sent to vendor
3. **confirmed** - Vendor confirms receipt
4. **received** - Goods received
5. **cancelled** - Order cancelled

## Error Handling

All endpoints return appropriate HTTP status codes:

- **200**: Success
- **201**: Created
- **400**: Bad Request (validation errors)
- **401**: Unauthorized
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found
- **500**: Internal Server Error

Error responses include details:
```json
{
  "error": "Error message",
  "details": "Additional error details"
}
```

## Integration with RFQ Workflow

1. Manager approves RFQ (status becomes 'approved')
2. Purchase user views approved RFQs via `/api/purchase/rfqs/approved`
3. Purchase user creates PO from RFQ via `/api/purchase/purchase-orders/from-rfq`
4. Purchase user reviews and sends PO to vendor via `/api/purchase/purchase-orders/[id]/send`

## Database Models

The system uses the following Prisma models:

- **PurchaseOrder**: Main purchase order record
- **POLine**: Individual line items in purchase orders
- **Supplier**: Vendor/supplier information
- **Product**: Product catalog
- **RFQ**: Request for quotation (source of PO)

## Testing

Use the provided test script `test-purchase-order-api.js` to test the APIs:

```bash
node test-purchase-order-api.js
```

This will run through all the API endpoints and show the results.
