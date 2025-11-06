export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  PURCHASE_MANAGER: 'PURCHASE_MANAGER',
  PURCHASE_USER: 'PURCHASE_USER',
  ACCOUNTS_MANAGER: 'ACCOUNTS_MANAGER',
  ACCOUNTS_USER: 'ACCOUNTS_USER',
  INVENTORY_MANAGER: 'INVENTORY_MANAGER',
  INVENTORY_USER: 'INVENTORY_USER',
  CRM_MANAGER: 'CRM_MANAGER',
  SALES_MANAGER: 'SALES_MANAGER',
  HR_MANAGER: 'HR_MANAGER',
  ACCOUNTANT: 'ACCOUNTANT',
  VENDOR: 'VENDOR',
  USER: 'USER'
};

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
    MANAGE_SETTINGS: 'purchase.manage_settings'
  },
  
  // Inventory Module Permissions
  INVENTORY: {
    VIEW_ALL: 'inventory.view_all',
    MANAGE_STOCK: 'inventory.manage_stock',
    APPROVE_TRANSFERS: 'inventory.approve_transfers',
    VIEW_REPORTS: 'inventory.view_reports',
    MANAGE_SETTINGS: 'inventory.manage_settings'
  },
  
  // Accounts Module Permissions
  ACCOUNTS: {
    VIEW_ALL: 'accounts.view_all',
    MANAGE_INVOICES: 'accounts.manage_invoices',
    APPROVE_PAYMENTS: 'accounts.approve_payments',
    VIEW_REPORTS: 'accounts.view_reports',
    MANAGE_SETTINGS: 'accounts.manage_settings'
  },
  
  // Admin Permissions
  ADMIN: {
    MANAGE_USERS: 'admin.manage_users',
    MANAGE_ROLES: 'admin.manage_roles',
    VIEW_AUDIT_LOGS: 'admin.view_audit_logs',
    MANAGE_SYSTEM_SETTINGS: 'admin.manage_system_settings'
  }
};

export const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: [
    ...Object.values(PERMISSIONS.PURCHASE),
    ...Object.values(PERMISSIONS.INVENTORY),
    ...Object.values(PERMISSIONS.ACCOUNTS),
    ...Object.values(PERMISSIONS.ADMIN)
  ],
  
  [ROLES.ADMIN]: [
    ...Object.values(PERMISSIONS.PURCHASE),
    ...Object.values(PERMISSIONS.INVENTORY),
    ...Object.values(PERMISSIONS.ACCOUNTS),
    PERMISSIONS.ADMIN.MANAGE_USERS,
    PERMISSIONS.ADMIN.VIEW_AUDIT_LOGS
  ],
  
  [ROLES.PURCHASE_MANAGER]: [
    PERMISSIONS.PURCHASE.VIEW_ALL,
    PERMISSIONS.PURCHASE.CREATE_RFQ,
    PERMISSIONS.PURCHASE.APPROVE_RFQ,
    PERMISSIONS.PURCHASE.CREATE_PO,
    PERMISSIONS.PURCHASE.APPROVE_PO,
    PERMISSIONS.PURCHASE.VIEW_REPORTS,
    PERMISSIONS.PURCHASE.MANAGE_VENDORS
  ],
  
  [ROLES.PURCHASE_USER]: [
    PERMISSIONS.PURCHASE.VIEW_ALL,
    PERMISSIONS.PURCHASE.CREATE_RFQ,
    PERMISSIONS.PURCHASE.CREATE_PO
  ],
  
  [ROLES.ACCOUNTS_MANAGER]: [
    PERMISSIONS.ACCOUNTS.VIEW_ALL,
    PERMISSIONS.ACCOUNTS.MANAGE_INVOICES,
    PERMISSIONS.ACCOUNTS.APPROVE_PAYMENTS,
    PERMISSIONS.ACCOUNTS.VIEW_REPORTS,
    PERMISSIONS.ACCOUNTS.MANAGE_SETTINGS
  ],
  
  [ROLES.INVENTORY_MANAGER]: [
    PERMISSIONS.INVENTORY.VIEW_ALL,
    PERMISSIONS.INVENTORY.MANAGE_STOCK,
    PERMISSIONS.INVENTORY.APPROVE_TRANSFERS,
    PERMISSIONS.INVENTORY.VIEW_REPORTS,
    PERMISSIONS.INVENTORY.MANAGE_SETTINGS
  ]
};
