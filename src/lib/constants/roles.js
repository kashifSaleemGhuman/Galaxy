// ============================================================================
// SINGLE SOURCE OF TRUTH FOR ROLES AND PERMISSIONS
// ============================================================================
// This file defines all roles, permissions, and role-permission mappings
// All other files should import from this file only
// ============================================================================

// Role Constants - These match the values stored in the database
export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  PURCHASE_MANAGER: 'PURCHASE_MANAGER',
  PURCHASE_USER: 'PURCHASE_USER',
  ACCOUNTS_MANAGER: 'ACCOUNTS_MANAGER',
  ACCOUNTS_USER: 'ACCOUNTS_USER',
  INVENTORY_MANAGER: 'INVENTORY_MANAGER',
  INVENTORY_USER: 'INVENTORY_USER',
  WAREHOUSE_OPERATOR: 'WAREHOUSE_OPERATOR',
  CRM_MANAGER: 'CRM_MANAGER',
  SALES_MANAGER: 'SALES_MANAGER',
  HR_MANAGER: 'HR_MANAGER',
  ACCOUNTANT: 'ACCOUNTANT',
  VENDOR: 'VENDOR',
  USER: 'USER'
};

// Permission Constants - Organized by module
export const PERMISSIONS = {
  // Purchase Module Permissions
  PURCHASE: {
    VIEW_ALL: 'purchase.view_all',
    CREATE_RFQ: 'purchase.create_rfq',
    APPROVE_RFQ: 'purchase.approve_rfq',
    CREATE_PO: 'purchase.create_po',
    APPROVE_PO: 'purchase.approve_po',
    VIEW_REPORTS: 'purchase.view_reports',
    MANAGE_VENDORS: 'purchase.manage_vendors',
    MANAGE_SUPPLIERS: 'purchase.manage_suppliers',
    MANAGE_PRODUCTS: 'purchase.manage_products',
    MANAGE_SETTINGS: 'purchase.manage_settings'
  },
  
  // Inventory Module Permissions
  INVENTORY: {
    VIEW_ALL: 'inventory.view_all',
    PRODUCT_READ: 'inventory.product.read',
    PRODUCT_WRITE: 'inventory.product.write',
    PRODUCT_DELETE: 'inventory.product.delete',
    MANAGE_STOCK: 'inventory.manage_stock',
    STOCK_READ: 'inventory.stock.read',
    STOCK_ADJUST: 'inventory.stock.adjust',
    STOCK_TRANSFER: 'inventory.stock.transfer',
    APPROVE_TRANSFERS: 'inventory.approve_transfers',
    RECEIPT_READ: 'inventory.receipt.read',
    RECEIPT_CREATE: 'inventory.receipt.create',
    RECEIPT_VALIDATE: 'inventory.receipt.validate',
    WAREHOUSE_READ: 'inventory.warehouse.read',
    WAREHOUSE_WRITE: 'inventory.warehouse.write',
    LOCATION_READ: 'inventory.location.read',
    LOCATION_WRITE: 'inventory.location.write',
    MOVEMENT_READ: 'inventory.movement.read',
    MOVEMENT_CREATE: 'inventory.movement.create',
    CYCLE_COUNT_READ: 'inventory.cycle_count.read',
    CYCLE_COUNT_CREATE: 'inventory.cycle_count.create',
    CYCLE_COUNT_VALIDATE: 'inventory.cycle_count.validate',
    VIEW_REPORTS: 'inventory.view_reports',
    MANAGE_SETTINGS: 'inventory.manage_settings'
  },
  
  // Warehouse Module Permissions
  WAREHOUSE: {
    VIEW_ALL: 'warehouse.view_all',
    SHIPMENT_READ: 'warehouse.shipment.read',
    SHIPMENT_PROCESS: 'warehouse.shipment.process',
    SHIPMENT_ASSIGN: 'warehouse.shipment.assign',
    STOCK_READ: 'warehouse.stock.read',
    STOCK_ADJUST: 'warehouse.stock.adjust',
    RECEIPT_CREATE: 'warehouse.receipt.create',
    RECEIPT_VALIDATE: 'warehouse.receipt.validate',
    TRANSFER_READ: 'warehouse.transfer.read',
    TRANSFER_CREATE: 'warehouse.transfer.create',
    ADJUSTMENT_READ: 'warehouse.adjustment.read',
    ADJUSTMENT_CREATE: 'warehouse.adjustment.create'
  },
  
  // CRM Module Permissions
  CRM: {
    VIEW_ALL: 'crm.view_all',
    CUSTOMER_READ: 'crm.customer.read',
    CUSTOMER_WRITE: 'crm.customer.write',
    CUSTOMER_DELETE: 'crm.customer.delete',
    LEAD_READ: 'crm.lead.read',
    LEAD_WRITE: 'crm.lead.write',
    LEAD_DELETE: 'crm.lead.delete',
    VIEW_REPORTS: 'crm.view_reports',
    MANAGE_SETTINGS: 'crm.manage_settings'
  },
  
  // Sales Module Permissions
  SALES: {
    VIEW_ALL: 'sales.view_all',
    ORDER_READ: 'sales.order.read',
    ORDER_WRITE: 'sales.order.write',
    QUOTE_READ: 'sales.quote.read',
    QUOTE_WRITE: 'sales.quote.write',
    INVOICE_READ: 'sales.invoice.read',
    INVOICE_WRITE: 'sales.invoice.write',
    VIEW_REPORTS: 'sales.view_reports',
    MANAGE_SETTINGS: 'sales.manage_settings'
  },
  
  // Accounts Module Permissions
  ACCOUNTS: {
    VIEW_ALL: 'accounts.view_all',
    MANAGE_INVOICES: 'accounts.manage_invoices',
    APPROVE_PAYMENTS: 'accounts.approve_payments',
    VIEW_REPORTS: 'accounts.view_reports',
    MANAGE_SETTINGS: 'accounts.manage_settings'
  },
  
  // HR Module Permissions
  HR: {
    VIEW_ALL: 'hr.view_all',
    EMPLOYEE_READ: 'hr.employee.read',
    EMPLOYEE_WRITE: 'hr.employee.write',
    DEPARTMENT_READ: 'hr.department.read',
    DEPARTMENT_WRITE: 'hr.department.write',
    PAYROLL_READ: 'hr.payroll.read',
    PAYROLL_WRITE: 'hr.payroll.write',
    VIEW_REPORTS: 'hr.view_reports',
    MANAGE_SETTINGS: 'hr.manage_settings'
  },
  
  // Admin Permissions
  ADMIN: {
    MANAGE_USERS: 'admin.manage_users',
    MANAGE_ROLES: 'admin.manage_roles',
    VIEW_AUDIT_LOGS: 'admin.view_audit_logs',
    MANAGE_SYSTEM_SETTINGS: 'admin.manage_system_settings'
  }
};

// Role-Permission Mappings
// Each role gets a specific set of permissions based on their responsibilities
export const ROLE_PERMISSIONS = {
  // Super Admin - Full access to everything
  [ROLES.SUPER_ADMIN]: [
    ...Object.values(PERMISSIONS.PURCHASE),
    ...Object.values(PERMISSIONS.INVENTORY),
    ...Object.values(PERMISSIONS.WAREHOUSE),
    ...Object.values(PERMISSIONS.CRM),
    ...Object.values(PERMISSIONS.SALES),
    ...Object.values(PERMISSIONS.ACCOUNTS),
    ...Object.values(PERMISSIONS.HR),
    ...Object.values(PERMISSIONS.ADMIN)
  ],
  
  // Admin - Full module access but limited admin permissions
  [ROLES.ADMIN]: [
    ...Object.values(PERMISSIONS.PURCHASE),
    ...Object.values(PERMISSIONS.INVENTORY),
    ...Object.values(PERMISSIONS.WAREHOUSE),
    ...Object.values(PERMISSIONS.CRM),
    ...Object.values(PERMISSIONS.SALES),
    ...Object.values(PERMISSIONS.ACCOUNTS),
    ...Object.values(PERMISSIONS.HR),
    PERMISSIONS.ADMIN.MANAGE_USERS,
    PERMISSIONS.ADMIN.VIEW_AUDIT_LOGS
  ],
  
  // Purchase Manager - Full purchase module access
  [ROLES.PURCHASE_MANAGER]: [
    PERMISSIONS.PURCHASE.VIEW_ALL,
    PERMISSIONS.PURCHASE.CREATE_RFQ,
    PERMISSIONS.PURCHASE.APPROVE_RFQ,
    PERMISSIONS.PURCHASE.CREATE_PO,
    PERMISSIONS.PURCHASE.APPROVE_PO,
    PERMISSIONS.PURCHASE.VIEW_REPORTS,
    PERMISSIONS.PURCHASE.MANAGE_VENDORS,
    PERMISSIONS.PURCHASE.MANAGE_SUPPLIERS,
    PERMISSIONS.PURCHASE.MANAGE_PRODUCTS,
    PERMISSIONS.PURCHASE.MANAGE_SETTINGS
  ],
  
  // Purchase User - Can create but not approve
  [ROLES.PURCHASE_USER]: [
    PERMISSIONS.PURCHASE.VIEW_ALL,
    PERMISSIONS.PURCHASE.CREATE_RFQ,
    PERMISSIONS.PURCHASE.CREATE_PO,
    PERMISSIONS.PURCHASE.VIEW_REPORTS
  ],
  
  // Inventory Manager - Full inventory access
  [ROLES.INVENTORY_MANAGER]: [
    PERMISSIONS.INVENTORY.VIEW_ALL,
    PERMISSIONS.INVENTORY.PRODUCT_READ,
    PERMISSIONS.INVENTORY.PRODUCT_WRITE,
    PERMISSIONS.INVENTORY.PRODUCT_DELETE,
    PERMISSIONS.INVENTORY.MANAGE_STOCK,
    PERMISSIONS.INVENTORY.STOCK_READ,
    PERMISSIONS.INVENTORY.STOCK_ADJUST,
    PERMISSIONS.INVENTORY.STOCK_TRANSFER,
    PERMISSIONS.INVENTORY.APPROVE_TRANSFERS,
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
    PERMISSIONS.INVENTORY.VIEW_REPORTS,
    PERMISSIONS.INVENTORY.MANAGE_SETTINGS
  ],
  
  // Inventory User - Limited inventory access + basic warehouse access
  [ROLES.INVENTORY_USER]: [
    PERMISSIONS.INVENTORY.VIEW_ALL,
    PERMISSIONS.INVENTORY.PRODUCT_READ,
    PERMISSIONS.INVENTORY.STOCK_READ,
    PERMISSIONS.INVENTORY.RECEIPT_READ,
    PERMISSIONS.INVENTORY.WAREHOUSE_READ,
    PERMISSIONS.INVENTORY.LOCATION_READ,
    PERMISSIONS.INVENTORY.MOVEMENT_READ,
    PERMISSIONS.INVENTORY.VIEW_REPORTS,
    // Add warehouse permissions for inventory users to access warehouse module
    PERMISSIONS.WAREHOUSE.VIEW_ALL,
    PERMISSIONS.WAREHOUSE.SHIPMENT_READ
  ],
  
  // Warehouse Operator - Can process shipments and manage stock
  [ROLES.WAREHOUSE_OPERATOR]: [
    PERMISSIONS.WAREHOUSE.VIEW_ALL,
    PERMISSIONS.WAREHOUSE.SHIPMENT_READ,
    PERMISSIONS.WAREHOUSE.SHIPMENT_PROCESS,
    PERMISSIONS.WAREHOUSE.STOCK_READ,
    PERMISSIONS.WAREHOUSE.STOCK_ADJUST,
    PERMISSIONS.WAREHOUSE.RECEIPT_CREATE,
    PERMISSIONS.WAREHOUSE.RECEIPT_VALIDATE,
    PERMISSIONS.WAREHOUSE.TRANSFER_READ,
    PERMISSIONS.WAREHOUSE.TRANSFER_CREATE,
    PERMISSIONS.WAREHOUSE.ADJUSTMENT_READ,
    PERMISSIONS.WAREHOUSE.ADJUSTMENT_CREATE,
    PERMISSIONS.INVENTORY.STOCK_READ,
    PERMISSIONS.INVENTORY.STOCK_ADJUST,
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
  
  // CRM Manager - Full CRM access
  [ROLES.CRM_MANAGER]: [
    PERMISSIONS.CRM.VIEW_ALL,
    PERMISSIONS.CRM.CUSTOMER_READ,
    PERMISSIONS.CRM.CUSTOMER_WRITE,
    PERMISSIONS.CRM.CUSTOMER_DELETE,
    PERMISSIONS.CRM.LEAD_READ,
    PERMISSIONS.CRM.LEAD_WRITE,
    PERMISSIONS.CRM.LEAD_DELETE,
    PERMISSIONS.CRM.VIEW_REPORTS,
    PERMISSIONS.CRM.MANAGE_SETTINGS
  ],
  
  // Sales Manager - Full sales access
  [ROLES.SALES_MANAGER]: [
    PERMISSIONS.SALES.VIEW_ALL,
    PERMISSIONS.SALES.ORDER_READ,
    PERMISSIONS.SALES.ORDER_WRITE,
    PERMISSIONS.SALES.QUOTE_READ,
    PERMISSIONS.SALES.QUOTE_WRITE,
    PERMISSIONS.SALES.INVOICE_READ,
    PERMISSIONS.SALES.INVOICE_WRITE,
    PERMISSIONS.SALES.VIEW_REPORTS,
    PERMISSIONS.SALES.MANAGE_SETTINGS
  ],
  
  // Accounts Manager - Full accounts access
  [ROLES.ACCOUNTS_MANAGER]: [
    PERMISSIONS.ACCOUNTS.VIEW_ALL,
    PERMISSIONS.ACCOUNTS.MANAGE_INVOICES,
    PERMISSIONS.ACCOUNTS.APPROVE_PAYMENTS,
    PERMISSIONS.ACCOUNTS.VIEW_REPORTS,
    PERMISSIONS.ACCOUNTS.MANAGE_SETTINGS
  ],
  
  // Accounts User - Limited accounts access
  [ROLES.ACCOUNTS_USER]: [
    PERMISSIONS.ACCOUNTS.VIEW_ALL,
    PERMISSIONS.ACCOUNTS.VIEW_REPORTS
  ],
  
  // Accountant - Accounting access
  [ROLES.ACCOUNTANT]: [
    PERMISSIONS.ACCOUNTS.VIEW_ALL,
    PERMISSIONS.ACCOUNTS.MANAGE_INVOICES,
    PERMISSIONS.ACCOUNTS.VIEW_REPORTS
  ],
  
  // HR Manager - Full HR access
  [ROLES.HR_MANAGER]: [
    PERMISSIONS.HR.VIEW_ALL,
    PERMISSIONS.HR.EMPLOYEE_READ,
    PERMISSIONS.HR.EMPLOYEE_WRITE,
    PERMISSIONS.HR.DEPARTMENT_READ,
    PERMISSIONS.HR.DEPARTMENT_WRITE,
    PERMISSIONS.HR.PAYROLL_READ,
    PERMISSIONS.HR.PAYROLL_WRITE,
    PERMISSIONS.HR.VIEW_REPORTS,
    PERMISSIONS.HR.MANAGE_SETTINGS
  ],
  
  // Vendor - External vendor access (limited)
  [ROLES.VENDOR]: [
    PERMISSIONS.PURCHASE.VIEW_ALL // Can view RFQs sent to them
  ],
  
  // Basic User - Minimal access
  [ROLES.USER]: [
    // No specific permissions - can only access public areas
  ]
};

// Helper function to check if a role has a permission
export function hasPermission(userRole, permission) {
  if (!userRole || !permission) return false;
  
  const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
  
  // Super admin has all permissions
  if (userRole === ROLES.SUPER_ADMIN) {
    return true;
  }
  
  return rolePermissions.includes(permission);
}

// Helper function to check if a role has any of the specified permissions
export function hasAnyPermission(userRole, permissions) {
  if (!userRole || !permissions || permissions.length === 0) return false;
  return permissions.some(permission => hasPermission(userRole, permission));
}

// Helper function to check if a role has all of the specified permissions
export function hasAllPermissions(userRole, permissions) {
  if (!userRole || !permissions || permissions.length === 0) return false;
  return permissions.every(permission => hasPermission(userRole, permission));
}

// Helper function to check if user is super admin
export function isSuperAdmin(userRole) {
  return userRole === ROLES.SUPER_ADMIN;
}

// Helper function to check if user is admin or super admin
export function isAdminOrSuperAdmin(userRole) {
  return userRole === ROLES.SUPER_ADMIN || userRole === ROLES.ADMIN;
}
