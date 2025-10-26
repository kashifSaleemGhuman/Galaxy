// Permission constants for role-based access control
export const PERMISSIONS = {
  // Super Admin permissions
  SUPER_ADMIN: {
    ALL: 'super_admin:all',
    MANAGE_USERS: 'super_admin:manage_users',
    MANAGE_TENANTS: 'super_admin:manage_tenants',
    MANAGE_ROLES: 'super_admin:manage_roles',
    SYSTEM_SETTINGS: 'super_admin:system_settings'
  },
  
  // Inventory Manager permissions
  INVENTORY: {
    // Products
    PRODUCT_READ: 'inventory:product:read',
    PRODUCT_WRITE: 'inventory:product:write',
    PRODUCT_DELETE: 'inventory:product:delete',
    
    // Stock Management
    STOCK_READ: 'inventory:stock:read',
    STOCK_ADJUST: 'inventory:stock:adjust',
    STOCK_TRANSFER: 'inventory:stock:transfer',
    
    // Receipts
    RECEIPT_READ: 'inventory:receipt:read',
    RECEIPT_CREATE: 'inventory:receipt:create',
    RECEIPT_VALIDATE: 'inventory:receipt:validate',
    
    // Warehouses
    WAREHOUSE_READ: 'inventory:warehouse:read',
    WAREHOUSE_WRITE: 'inventory:warehouse:write',
    
    // Locations
    LOCATION_READ: 'inventory:location:read',
    LOCATION_WRITE: 'inventory:location:write',
    
    // Movements
    MOVEMENT_READ: 'inventory:movement:read',
    MOVEMENT_CREATE: 'inventory:movement:create',
    
    // Cycle Counts
    CYCLE_COUNT_READ: 'inventory:cycle_count:read',
    CYCLE_COUNT_CREATE: 'inventory:cycle_count:create',
    CYCLE_COUNT_VALIDATE: 'inventory:cycle_count:validate'
  },
  
  // Purchase permissions (for super admin)
  PURCHASE: {
    RFQ_READ: 'purchase:rfq:read',
    RFQ_WRITE: 'purchase:rfq:write',
    PO_READ: 'purchase:po:read',
    PO_WRITE: 'purchase:po:write',
    SUPPLIER_READ: 'purchase:supplier:read',
    SUPPLIER_WRITE: 'purchase:supplier:write'
  },
  
  // CRM permissions (for super admin)
  CRM: {
    CUSTOMER_READ: 'crm:customer:read',
    CUSTOMER_WRITE: 'crm:customer:write',
    LEAD_READ: 'crm:lead:read',
    LEAD_WRITE: 'crm:lead:write'
  }
}

// Role definitions
export const ROLES = {
  SUPER_ADMIN: 'Admin',
  INVENTORY_MANAGER: 'Inventory Manager',
  WAREHOUSE_OPERATOR: 'Warehouse Operator',
  PURCHASE_MANAGER: 'Purchase Manager',
  CRM_MANAGER: 'CRM Manager',
  HR_MANAGER: 'HR Manager',
  ACCOUNTANT: 'Accountant',
  SALES_MANAGER: 'Sales Manager'
}

// Default role permissions
export const ROLE_PERMISSIONS = {
  'Admin': [
    PERMISSIONS.SUPER_ADMIN.ALL,
    PERMISSIONS.INVENTORY.PRODUCT_READ,
    PERMISSIONS.INVENTORY.PRODUCT_WRITE,
    PERMISSIONS.INVENTORY.PRODUCT_DELETE,
    PERMISSIONS.INVENTORY.STOCK_READ,
    PERMISSIONS.INVENTORY.STOCK_ADJUST,
    PERMISSIONS.INVENTORY.STOCK_TRANSFER,
    PERMISSIONS.INVENTORY.RECEIPT_READ,
    PERMISSIONS.INVENTORY.RECEIPT_CREATE,
    PERMISSIONS.INVENTORY.RECEIPT_VALIDATE,
    PERMISSIONS.INVENTORY.WAREHOUSE_READ,
    PERMISSIONS.INVENTORY.WAREHOUSE_WRITE,
    PERMISSIONS.INVENTORY.LOCATION_READ,
    PERMISSIONS.INVENTORY.LOCATION_WRITE,
    PERMISSIONS.INVENTORY.MOVEMENT_READ,
    PERMISSIONS.INVENTORY.MOVEMENT_CREATE,
    PERMISSIONS.INVENTORY.CYCLE_COUNT_READ,
    PERMISSIONS.INVENTORY.CYCLE_COUNT_CREATE,
    PERMISSIONS.INVENTORY.CYCLE_COUNT_VALIDATE,
    PERMISSIONS.PURCHASE.RFQ_READ,
    PERMISSIONS.PURCHASE.RFQ_WRITE,
    PERMISSIONS.PURCHASE.PO_READ,
    PERMISSIONS.PURCHASE.PO_WRITE,
    PERMISSIONS.PURCHASE.SUPPLIER_READ,
    PERMISSIONS.PURCHASE.SUPPLIER_WRITE,
    PERMISSIONS.CRM.CUSTOMER_READ,
    PERMISSIONS.CRM.CUSTOMER_WRITE,
    PERMISSIONS.CRM.LEAD_READ,
    PERMISSIONS.CRM.LEAD_WRITE
  ],
  
  'Inventory Manager': [
    PERMISSIONS.INVENTORY.PRODUCT_READ,
    PERMISSIONS.INVENTORY.STOCK_READ,
    PERMISSIONS.INVENTORY.STOCK_ADJUST,
    PERMISSIONS.INVENTORY.STOCK_TRANSFER,
    PERMISSIONS.INVENTORY.RECEIPT_READ,
    PERMISSIONS.INVENTORY.RECEIPT_CREATE,
    PERMISSIONS.INVENTORY.RECEIPT_VALIDATE,
    PERMISSIONS.INVENTORY.WAREHOUSE_READ,
    PERMISSIONS.INVENTORY.LOCATION_READ,
    PERMISSIONS.INVENTORY.MOVEMENT_READ,
    PERMISSIONS.INVENTORY.MOVEMENT_CREATE,
    PERMISSIONS.INVENTORY.CYCLE_COUNT_READ,
    PERMISSIONS.INVENTORY.CYCLE_COUNT_CREATE,
    PERMISSIONS.INVENTORY.CYCLE_COUNT_VALIDATE
  ],
  
  'Warehouse Operator': [
    PERMISSIONS.INVENTORY.STOCK_READ,
    PERMISSIONS.INVENTORY.STOCK_ADJUST,
    PERMISSIONS.INVENTORY.RECEIPT_READ,
    PERMISSIONS.INVENTORY.RECEIPT_CREATE,
    PERMISSIONS.INVENTORY.RECEIPT_VALIDATE,
    PERMISSIONS.INVENTORY.WAREHOUSE_READ,
    PERMISSIONS.INVENTORY.LOCATION_READ,
    PERMISSIONS.INVENTORY.MOVEMENT_READ,
    PERMISSIONS.INVENTORY.MOVEMENT_CREATE,
    PERMISSIONS.INVENTORY.TRANSFER_READ,
    PERMISSIONS.INVENTORY.TRANSFER_CREATE,
    PERMISSIONS.INVENTORY.ADJUSTMENT_READ,
    PERMISSIONS.INVENTORY.ADJUSTMENT_CREATE,
    PERMISSIONS.INVENTORY.CYCLE_COUNT_READ,
    PERMISSIONS.INVENTORY.CYCLE_COUNT_CREATE,
    PERMISSIONS.INVENTORY.CYCLE_COUNT_VALIDATE
  ]
}

// Helper functions
export const hasPermission = (userRole, permission) => {
  const rolePermissions = ROLE_PERMISSIONS[userRole] || []
  return rolePermissions.includes(permission) || rolePermissions.includes(PERMISSIONS.SUPER_ADMIN.ALL)
}

export const hasAnyPermission = (userRole, permissions) => {
  return permissions.some(permission => hasPermission(userRole, permission))
}

export const isSuperAdmin = (userRole) => {
  return userRole === ROLES.SUPER_ADMIN
}

export const isInventoryManager = (userRole) => {
  return userRole === ROLES.INVENTORY_MANAGER
}

export const isWarehouseOperator = (userRole) => {
  return userRole === ROLES.WAREHOUSE_OPERATOR
}
