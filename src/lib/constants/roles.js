export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  PURCHASE_MANAGER: 'purchase_manager',
  PURCHASE_USER: 'purchase_user',
  ACCOUNTS_MANAGER: 'accounts_manager',
  ACCOUNTS_USER: 'accounts_user',
  INVENTORY_MANAGER: 'inventory_manager',
  INVENTORY_USER: 'inventory_user',
  SALES_MANAGER: 'sales_manager',
  SALES_USER: 'sales_user',
  VENDOR: 'vendor',
  BASIC_USER: 'basic_user'
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
  
  // Sales Module Permissions
  SALES: {
    VIEW_ALL: 'sales.view_all',
    CREATE_QUOTATION: 'sales.create_quotation',
    APPROVE_QUOTATION: 'sales.approve_quotation',
    SEND_QUOTATION: 'sales.send_quotation',
    VIEW_REPORTS: 'sales.view_reports',
    MANAGE_SETTINGS: 'sales.manage_settings'
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
    ...Object.values(PERMISSIONS.SALES),
    ...Object.values(PERMISSIONS.ADMIN)
  ],
  
  [ROLES.ADMIN]: [
    ...Object.values(PERMISSIONS.PURCHASE),
    ...Object.values(PERMISSIONS.INVENTORY),
    ...Object.values(PERMISSIONS.ACCOUNTS),
    ...Object.values(PERMISSIONS.SALES),
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
  ],
  
  [ROLES.SALES_MANAGER]: [
    PERMISSIONS.SALES.VIEW_ALL,
    PERMISSIONS.SALES.CREATE_QUOTATION,
    PERMISSIONS.SALES.APPROVE_QUOTATION,
    PERMISSIONS.SALES.SEND_QUOTATION,
    PERMISSIONS.SALES.VIEW_REPORTS,
    PERMISSIONS.SALES.MANAGE_SETTINGS
  ],
  
  [ROLES.SALES_USER]: [
    PERMISSIONS.SALES.VIEW_ALL,
    PERMISSIONS.SALES.CREATE_QUOTATION,
    PERMISSIONS.SALES.SEND_QUOTATION
  ]
};
