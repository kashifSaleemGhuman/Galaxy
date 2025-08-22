# Customers API Documentation

This document describes the complete CRUD API for managing customers in the CRM system.

## Base URL
```
/api/crm/customers
```

## Authentication
All endpoints require authentication via NextAuth session. Include the session cookie in your requests.

## Endpoints Overview

### 1. Customer Management
- `GET /api/crm/customers` - List customers with pagination and filters
- `POST /api/crm/customers` - Create a new customer
- `GET /api/crm/customers/[id]` - Get customer by ID
- `PUT /api/crm/customers/[id]` - Update customer
- `DELETE /api/crm/customers/[id]` - Delete customer

### 2. Bulk Operations
- `POST /api/crm/customers/bulk` - Bulk update, delete, or status change

### 3. Search & Analytics
- `POST /api/crm/customers/search` - Advanced search with filters
- `GET /api/crm/customers/stats` - Customer statistics and analytics

### 4. Data Export
- `POST /api/crm/customers/export` - Export customer data in various formats

## Detailed Endpoint Documentation

### GET /api/crm/customers
List customers with pagination, search, and filtering.

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 10) - Items per page
- `search` (string) - Search term for company name, email, contact person, or industry
- `status` (string) - Filter by status (active, inactive, prospect, churned)
- `industry` (string) - Filter by industry

**Response:**
```json
{
  "customers": [
    {
      "id": "cust_123",
      "companyName": "Acme Corp",
      "contactPerson": "John Doe",
      "email": "john@acme.com",
      "phone": "+1-555-1234",
      "address": "123 Main St",
      "website": "https://acme.com",
      "industry": "Technology",
      "value": 50000.00,
      "status": "active",
      "lastContact": "2024-01-15T00:00:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-15T00:00:00.000Z",
      "orders": [...],
      "creator": {
        "firstName": "Jane",
        "lastName": "Smith"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "totalPages": 15,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### POST /api/crm/customers
Create a new customer.

**Request Body:**
```json
{
  "companyName": "New Company",
  "contactPerson": "Contact Name",
  "email": "contact@newcompany.com",
  "phone": "+1-555-5678",
  "address": "456 Business Ave",
  "website": "https://newcompany.com",
  "industry": "Manufacturing",
  "value": 75000.00,
  "status": "active",
  "lastContact": "2024-01-20"
}
```

**Required Fields:**
- `companyName`
- `contactPerson`
- `email`

**Response:**
```json
{
  "message": "Customer created successfully",
  "customer": {
    "id": "cust_456",
    "companyName": "New Company",
    // ... other fields
  }
}
```

### GET /api/crm/customers/[id]
Get detailed information about a specific customer.

**Response:**
```json
{
  "id": "cust_123",
  "companyName": "Acme Corp",
  "contactPerson": "John Doe",
  "email": "john@acme.com",
  "phone": "+1-555-1234",
  "address": "123 Main St",
  "website": "https://acme.com",
  "industry": "Technology",
  "value": 50000.00,
  "status": "active",
  "lastContact": "2024-01-15T00:00:00.000Z",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-15T00:00:00.000Z",
  "orders": [
    {
      "id": "order_123",
      "orderNumber": "ORD-001",
      "totalAmount": 5000.00,
      "status": "completed",
      "createdAt": "2024-01-10T00:00:00.000Z"
    }
  ],
  "leads": [
    {
      "id": "lead_123",
      "title": "New Project",
      "value": 25000.00,
      "stage": "qualified",
      "createdAt": "2024-01-05T00:00:00.000Z"
    }
  ],
  "creator": {
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane@company.com"
  }
}
```

### PUT /api/crm/customers/[id]
Update an existing customer.

**Request Body:**
```json
{
  "companyName": "Updated Company Name",
  "status": "inactive",
  "value": 60000.00
}
```

**Response:**
```json
{
  "message": "Customer updated successfully",
  "customer": {
    "id": "cust_123",
    "companyName": "Updated Company Name",
    // ... updated fields
  }
}
```

### DELETE /api/crm/customers/[id]
Delete a customer (only if no related orders or leads exist).

**Response:**
```json
{
  "message": "Customer deleted successfully"
}
```

**Note:** Customers with existing orders or leads cannot be deleted. Consider updating their status to "inactive" instead.

### POST /api/crm/customers/bulk
Perform bulk operations on multiple customers.

**Request Body:**
```json
{
  "operation": "status",
  "customerIds": ["cust_123", "cust_456", "cust_789"],
  "data": {
    "status": "inactive"
  }
}
```

**Supported Operations:**
- `update` - Bulk update fields
- `delete` - Bulk delete (with safety checks)
- `status` - Bulk status update

**Response:**
```json
{
  "message": "Bulk status completed successfully",
  "updatedCount": 3,
  "newStatus": "inactive"
}
```

### POST /api/crm/customers/search
Advanced search with multiple filters and sorting options.

**Request Body:**
```json
{
  "query": "technology",
  "filters": {
    "status": "active",
    "industry": "Technology",
    "valueRange": {
      "min": 10000,
      "max": 100000
    },
    "dateRange": {
      "from": "2024-01-01",
      "to": "2024-12-31"
    },
    "hasOrders": true
  },
  "sortBy": "value",
  "sortOrder": "desc",
  "page": 1,
  "limit": 20,
  "includeStats": true
}
```

**Response:**
```json
{
  "customers": [...],
  "pagination": {...},
  "filters": {
    "applied": {...},
    "totalResults": 45
  },
  "sort": {
    "field": "value",
    "order": "desc"
  },
  "stats": {
    "statusDistribution": [...],
    "industryDistribution": [...],
    "valueMetrics": {
      "average": 45000.00,
      "total": 2025000.00,
      "min": 10000.00,
      "max": 100000.00
    }
  }
}
```

### GET /api/crm/customers/stats
Get customer statistics and analytics.

**Query Parameters:**
- `period` (string, default: "30d") - Time period (7d, 30d, 90d, 1y)
- `trends` (boolean, default: false) - Include trend data
- `charts` (boolean, default: false) - Include chart data

**Response:**
```json
{
  "overview": {
    "totalCustomers": 150,
    "activeCustomers": 120,
    "newCustomers": 15,
    "totalValue": 7500000.00,
    "avgValue": 50000.00,
    "conversionRate": 65.5
  },
  "distribution": {
    "status": [
      { "status": "active", "_count": { "status": 120 } },
      { "status": "inactive", "_count": { "status": 20 } },
      { "status": "prospect", "_count": { "status": 10 } }
    ],
    "industry": [
      { "industry": "Technology", "_count": { "industry": 50 } },
      { "industry": "Manufacturing", "_count": { "industry": 30 } }
    ]
  },
  "topCustomers": [...],
  "recentActivity": [...],
  "period": "30d",
  "trends": {
    "monthly": [...]
  },
  "charts": {
    "status": [...],
    "industry": [...],
    "valueDistribution": [...]
  }
}
```

### POST /api/crm/customers/export
Export customer data in various formats.

**Request Body:**
```json
{
  "format": "csv",
  "filters": {
    "status": "active",
    "industry": "Technology"
  },
  "fields": ["companyName", "email", "industry", "value"],
  "includeRelated": true
}
```

**Supported Formats:**
- `csv` - Comma-separated values
- `json` - JSON format
- `xlsx` - Excel format (not yet implemented)

**Response:** File download with appropriate headers.

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error message description"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized
- `404` - Not Found
- `409` - Conflict (e.g., duplicate email)
- `429` - Rate Limit Exceeded
- `500` - Internal Server Error

## Rate Limiting

Rate limits are applied per user and endpoint:
- **GET operations**: 100 requests per minute
- **POST operations**: 50 requests per minute
- **PUT operations**: 50 requests per minute
- **DELETE operations**: 20 requests per minute
- **Bulk operations**: 30 requests per minute
- **Export operations**: 10 requests per minute

## Caching

Customer data is cached for performance:
- **List queries**: 30 minutes
- **Individual customers**: 15 minutes
- **Search results**: 15 minutes
- **Statistics**: 30 minutes

Cache is automatically invalidated when data is modified.

## Data Validation

### Customer Fields
- **companyName**: Required, non-empty string
- **contactPerson**: Required, non-empty string
- **email**: Required, valid email format, unique per tenant
- **phone**: Optional, string
- **address**: Optional, string
- **website**: Optional, string
- **industry**: Optional, string
- **value**: Optional, decimal number
- **status**: Optional, one of: active, inactive, prospect, churned
- **lastContact**: Optional, valid date

### Status Values
- `active` - Active customer
- `inactive` - Inactive customer
- `prospect` - Potential customer
- `churned` - Lost customer

## Best Practices

1. **Use pagination** for large datasets
2. **Implement proper error handling** for all API calls
3. **Cache responses** on the client side when appropriate
4. **Use bulk operations** for multiple updates
5. **Validate data** before sending to the API
6. **Handle rate limiting** gracefully
7. **Use search endpoint** for complex queries instead of filtering on the client

## Example Usage

### JavaScript/TypeScript
```typescript
// Create a customer
const createCustomer = async (customerData) => {
  const response = await fetch('/api/crm/customers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(customerData),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }
  
  return response.json();
};

// Get customers with filters
const getCustomers = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const response = await fetch(`/api/crm/customers?${params}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }
  
  return response.json();
};

// Update customer
const updateCustomer = async (id, updates) => {
  const response = await fetch(`/api/crm/customers/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }
  
  return response.json();
};
```

### cURL Examples
```bash
# Get customers
curl -X GET "http://localhost:3000/api/crm/customers?page=1&limit=10" \
  -H "Cookie: session=your-session-cookie"

# Create customer
curl -X POST "http://localhost:3000/api/crm/customers" \
  -H "Content-Type: application/json" \
  -H "Cookie: session=your-session-cookie" \
  -d '{
    "companyName": "New Company",
    "contactPerson": "John Doe",
    "email": "john@newcompany.com"
  }'

# Update customer
curl -X PUT "http://localhost:3000/api/crm/customers/cust_123" \
  -H "Content-Type: application/json" \
  -H "Cookie: session=your-session-cookie" \
  -d '{"status": "inactive"}'

# Delete customer
curl -X DELETE "http://localhost:3000/api/crm/customers/cust_123" \
  -H "Cookie: session=your-session-cookie"
```

## Support

For questions or issues with the Customers API, please refer to the main project documentation or contact the development team. 