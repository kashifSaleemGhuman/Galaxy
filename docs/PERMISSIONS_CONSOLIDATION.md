# Permissions System Consolidation

## Summary

The permission system has been successfully consolidated into a **single source of truth** located at `src/lib/constants/roles.js`. All duplicate permission definitions have been removed, and all files now import from this unified location.

## Changes Made

### 1. **Expanded Unified Permission System** (`src/lib/constants/roles.js`)

- **All Roles Defined**: Complete list of all roles matching database values
  - `SUPER_ADMIN`, `ADMIN`, `PURCHASE_MANAGER`, `PURCHASE_USER`
  - `INVENTORY_MANAGER`, `INVENTORY_USER`, `WAREHOUSE_OPERATOR`
  - `CRM_MANAGER`, `SALES_MANAGER`, `ACCOUNTS_MANAGER`, `ACCOUNTS_USER`
  - `HR_MANAGER`, `ACCOUNTANT`, `VENDOR`, `USER`

- **All Permissions Defined**: Comprehensive permission structure organized by module
  - **Purchase**: `purchase.view_all`, `purchase.create_rfq`, `purchase.approve_rfq`, etc.
  - **Inventory**: `inventory.product.read`, `inventory.stock.adjust`, `inventory.receipt.validate`, etc.
  - **Warehouse**: `warehouse.shipment.process`, `warehouse.stock.adjust`, etc.
  - **CRM**: `crm.customer.read`, `crm.lead.write`, etc.
  - **Sales**: `sales.order.read`, `sales.invoice.write`, etc.
  - **Accounts**: `accounts.manage_invoices`, `accounts.approve_payments`, etc.
  - **HR**: `hr.employee.read`, `hr.payroll.write`, etc.
  - **Admin**: `admin.manage_users`, `admin.manage_roles`, etc.

- **Complete Role-Permission Mappings**: Every role has its permissions clearly defined
  - Super Admin: All permissions
  - Admin: All module permissions + limited admin permissions
  - Module Managers: Full access to their module
  - Module Users: Limited access to their module
  - Warehouse Operator: Warehouse and inventory operations
  - Vendor: View-only access to RFQs

- **Helper Functions**: Utility functions for permission checking
  - `hasPermission(userRole, permission)`
  - `hasAnyPermission(userRole, permissions)`
  - `hasAllPermissions(userRole, permissions)`
  - `isSuperAdmin(userRole)`
  - `isAdminOrSuperAdmin(userRole)`

### 2. **Updated usePermissions Hook** (`src/hooks/usePermissions.js`)

- Now uses the unified permission system directly
- Removed role mapping logic (no longer needed)
- Uses helper functions from `constants/roles.js`
- Returns `userRole` and `userPermissions` for convenience

### 3. **Updated Components**

- **Dashboard Layout** (`src/app/dashboard/layout.jsx`): Updated import to use unified system
- **RFQ Details Page**: Already using correct imports
- **PermissionGuard Component**: Works with unified system

### 4. **Updated API Routes**

- **Inventory Receipts** (`src/app/api/inventory/receipts/route.js`): Updated to use unified system
- **Inventory Receipts Validate** (`src/app/api/inventory/receipts/[id]/validate/route.js`): Updated to use unified system
- **All other API routes**: Already using `ROLES` from unified system

### 5. **Updated Middleware** (`src/middleware.js`)

- Now uses `PERMISSIONS` constants from unified system
- Added permission checks for:
  - Purchase approvals
  - User management
  - CRM module
  - Inventory module
  - Warehouse module

### 6. **Removed Old File**

- Deleted `src/lib/permissions.js` (old duplicate system)

## Benefits

1. **Single Source of Truth**: All permissions defined in one place
2. **Consistency**: No more role mapping or permission string mismatches
3. **Maintainability**: Easy to add new roles or permissions
4. **Type Safety**: All permissions are constants, reducing typos
5. **Clear Documentation**: Each module's permissions are clearly organized

## Usage Examples

### In Components

```jsx
import { PERMISSIONS } from '@/lib/constants/roles'
import PermissionGuard from '@/components/guards/PermissionGuard'

<PermissionGuard permissions={[PERMISSIONS.PURCHASE.APPROVE_RFQ]}>
  <ApproveButton />
</PermissionGuard>
```

### In API Routes

```javascript
import { hasPermission, PERMISSIONS } from '@/lib/constants/roles'

if (!hasPermission(session.user.role, PERMISSIONS.INVENTORY.RECEIPT_VALIDATE)) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}
```

### In Middleware

```javascript
import { PERMISSIONS } from '@/lib/constants/roles'

if (path.startsWith('/dashboard/purchase/approvals')) {
  const hasPermission = token.permissions?.includes(PERMISSIONS.PURCHASE.APPROVE_RFQ)
  if (!hasPermission) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }
}
```

## Module Access Control

Each role now has clear access to their respective modules:

- **Purchase Module**: `PURCHASE_MANAGER`, `PURCHASE_USER`, `SUPER_ADMIN`, `ADMIN`
- **Inventory Module**: `INVENTORY_MANAGER`, `INVENTORY_USER`, `SUPER_ADMIN`, `ADMIN`
- **Warehouse Module**: `WAREHOUSE_OPERATOR`, `SUPER_ADMIN`, `ADMIN`
- **CRM Module**: `CRM_MANAGER`, `SUPER_ADMIN`, `ADMIN`
- **Sales Module**: `SALES_MANAGER`, `SUPER_ADMIN`, `ADMIN`
- **Accounts Module**: `ACCOUNTS_MANAGER`, `ACCOUNTS_USER`, `ACCOUNTANT`, `SUPER_ADMIN`, `ADMIN`
- **HR Module**: `HR_MANAGER`, `SUPER_ADMIN`, `ADMIN`

## Next Steps

1. Test all permission checks to ensure they work correctly
2. Update any remaining hardcoded role checks to use permission constants
3. Consider adding TypeScript types for better type safety
4. Add unit tests for permission helper functions

## Files Modified

- ✅ `src/lib/constants/roles.js` - Expanded and consolidated
- ✅ `src/hooks/usePermissions.js` - Updated to use unified system
- ✅ `src/middleware.js` - Updated to use unified permissions
- ✅ `src/app/dashboard/layout.jsx` - Updated imports
- ✅ `src/app/api/inventory/receipts/route.js` - Updated to use unified system
- ✅ `src/app/api/inventory/receipts/[id]/validate/route.js` - Updated to use unified system
- ✅ `src/lib/permissions.js` - **DELETED** (consolidated into constants/roles.js)

## Verification

All files now import from `@/lib/constants/roles` only. No duplicate permission systems exist.


