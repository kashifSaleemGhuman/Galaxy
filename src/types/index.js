/**
 * Core types for the Galaxy ERP System
 * Note: These are JSDoc type definitions for better IDE support
 */

/**
 * @typedef {Object} User
 * @property {string} id - User unique identifier
 * @property {string} tenantId - Associated tenant ID
 * @property {string} email - User email address
 * @property {string} firstName - User first name
 * @property {string} lastName - User last name
 * @property {string} roleId - Associated role ID
 * @property {boolean} isActive - Whether user is active
 * @property {Date} createdAt - User creation timestamp
 * @property {Date} updatedAt - User last update timestamp
 */

/**
 * @typedef {Object} Role
 * @property {string} id - Role unique identifier
 * @property {string} name - Role name
 * @property {string} description - Role description
 * @property {Array} permissions - Array of permissions
 */

/**
 * @typedef {Object} Tenant
 * @property {string} id - Tenant unique identifier
 * @property {string} name - Organization name
 * @property {string} domain - Organization domain
 * @property {Object} settings - Tenant-specific settings
 * @property {Date} createdAt - Tenant creation timestamp
 * @property {Date} updatedAt - Tenant last update timestamp
 */

/**
 * @typedef {Object} Customer
 * @property {string} id - Customer unique identifier
 * @property {string} tenantId - Associated tenant ID
 * @property {string} companyName - Company name
 * @property {string} contactPerson - Contact person name
 * @property {string} email - Contact email
 * @property {string} phone - Contact phone
 * @property {string} address - Customer address
 * @property {string} status - Customer status
 * @property {Date} createdAt - Customer creation timestamp
 * @property {string} createdBy - User who created the customer
 */

/**
 * @typedef {Object} Lead
 * @property {string} id - Lead unique identifier
 * @property {string} tenantId - Associated tenant ID
 * @property {string} customerId - Associated customer ID
 * @property {string} title - Lead title
 * @property {string} description - Lead description
 * @property {number} value - Lead value
 * @property {string} stage - Lead stage
 * @property {string} assignedTo - User assigned to lead
 * @property {Date} createdAt - Lead creation timestamp
 * @property {string} createdBy - User who created the lead
 */

/**
 * @typedef {Object} Product
 * @property {string} id - Product unique identifier
 * @property {string} tenantId - Associated tenant ID
 * @property {string} name - Product name
 * @property {string} sku - Product SKU
 * @property {string} description - Product description
 * @property {number} price - Product price
 * @property {number} cost - Product cost
 * @property {string} categoryId - Product category ID
 * @property {boolean} isActive - Whether product is active
 */

/**
 * @typedef {Object} Order
 * @property {string} id - Order unique identifier
 * @property {string} tenantId - Associated tenant ID
 * @property {string} customerId - Associated customer ID
 * @property {string} orderNumber - Order number
 * @property {string} status - Order status
 * @property {number} totalAmount - Order total amount
 * @property {string} createdBy - User who created the order
 * @property {Date} createdAt - Order creation timestamp
 */

/**
 * @typedef {Object} InventoryItem
 * @property {string} id - Inventory item unique identifier
 * @property {string} tenantId - Associated tenant ID
 * @property {string} productId - Associated product ID
 * @property {string} warehouseId - Associated warehouse ID
 * @property {number} quantityOnHand - Current stock quantity
 * @property {number} reorderPoint - Reorder point threshold
 * @property {number} maxStock - Maximum stock level
 * @property {string} location - Item location
 * @property {Date} createdAt - Item creation timestamp
 * @property {Date} updatedAt - Item last update timestamp
 */

/**
 * @typedef {Object} StockMovement
 * @property {string} id - Movement unique identifier
 * @property {string} tenantId - Associated tenant ID
 * @property {string} inventoryItemId - Associated inventory item ID
 * @property {string} movementType - Movement type (in/out/transfer)
 * @property {number} quantity - Movement quantity
 * @property {string} referenceType - Reference type
 * @property {string} referenceId - Reference ID
 * @property {string} notes - Movement notes
 * @property {Date} createdAt - Movement creation timestamp
 * @property {string} createdBy - User who created the movement
 */

/**
 * @typedef {Object} Employee
 * @property {string} id - Employee unique identifier
 * @property {string} tenantId - Associated tenant ID
 * @property {string} userId - Associated user ID
 * @property {string} employeeId - Employee ID
 * @property {string} departmentId - Associated department ID
 * @property {string} position - Employee position
 * @property {Date} hireDate - Employee hire date
 * @property {number} salary - Employee salary
 * @property {boolean} isActive - Whether employee is active
 * @property {Date} createdAt - Employee creation timestamp
 * @property {Date} updatedAt - Employee last update timestamp
 */

/**
 * @typedef {Object} Department
 * @property {string} id - Department unique identifier
 * @property {string} tenantId - Associated tenant ID
 * @property {string} name - Department name
 * @property {string} description - Department description
 * @property {string} managerId - Department manager ID
 * @property {Date} createdAt - Department creation timestamp
 * @property {Date} updatedAt - Department last update timestamp
 */

/**
 * @typedef {Object} ChartOfAccount
 * @property {string} id - Account unique identifier
 * @property {string} tenantId - Associated tenant ID
 * @property {string} accountCode - Account code
 * @property {string} accountName - Account name
 * @property {string} accountType - Account type
 * @property {string} parentAccountId - Parent account ID
 * @property {boolean} isActive - Whether account is active
 */

/**
 * @typedef {Object} JournalEntry
 * @property {string} id - Entry unique identifier
 * @property {string} tenantId - Associated tenant ID
 * @property {string} entryNumber - Entry number
 * @property {Date} entryDate - Entry date
 * @property {string} description - Entry description
 * @property {string} reference - Entry reference
 * @property {string} createdBy - User who created the entry
 * @property {Date} createdAt - Entry creation timestamp
 */

/**
 * @typedef {Object} JournalEntryLine
 * @property {string} id - Line unique identifier
 * @property {string} journalEntryId - Associated journal entry ID
 * @property {string} accountId - Associated account ID
 * @property {number} debitAmount - Debit amount
 * @property {number} creditAmount - Credit amount
 * @property {string} description - Line description
 */

/**
 * @typedef {Object} LoginCredentials
 * @property {string} email - User email
 * @property {string} password - User password
 */

/**
 * @typedef {Object} RegisterData
 * @property {string} firstName - User first name
 * @property {string} lastName - User last name
 * @property {string} email - User email
 * @property {string} password - User password
 * @property {string} companyName - Company name
 * @property {string} companyDomain - Company domain
 */

/**
 * @typedef {Object} ApiResponse
 * @property {boolean} success - Response success status
 * @property {string} message - Response message
 * @property {*} data - Response data
 * @property {string} error - Error message if any
 */

/**
 * @typedef {Object} PaginationInfo
 * @property {number} page - Current page number
 * @property {number} limit - Items per page
 * @property {number} total - Total items
 * @property {number} totalPages - Total pages
 */

/**
 * @typedef {Object} SearchParams
 * @property {string} query - Search query
 * @property {string} filter - Filter criteria
 * @property {string} sort - Sort criteria
 * @property {PaginationInfo} pagination - Pagination information
 */

/**
 * @typedef {Object} TableColumn
 * @property {string} key - Column key
 * @property {string} label - Column label
 * @property {string} type - Column type
 * @property {boolean} sortable - Whether column is sortable
 * @property {boolean} searchable - Whether column is searchable
 */

/**
 * @typedef {Object} TableProps
 * @property {Array} data - Table data
 * @property {Array<TableColumn>} columns - Table columns
 * @property {Function} onRowClick - Row click handler
 * @property {Function} onSort - Sort handler
 * @property {Function} onSearch - Search handler
 */

/**
 * @typedef {Object} FormField
 * @property {string} name - Field name
 * @property {string} label - Field label
 * @property {string} type - Field type
 * @property {boolean} required - Whether field is required
 * @property {string} placeholder - Field placeholder
 * @property {*} defaultValue - Field default value
 */

/**
 * @typedef {Object} Permission
 * @property {string} resource - Resource name
 * @property {string} action - Action type
 * @property {string} scope - Permission scope
 */

/**
 * @typedef {Object} UserPermissions
 * @property {string} userId - User ID
 * @property {Array<Permission>} permissions - User permissions
 */

/**
 * @typedef {Object} DashboardMetric
 * @property {string} name - Metric name
 * @property {*} value - Metric value
 * @property {string} change - Change indicator
 * @property {string} changeType - Change type (positive/negative)
 * @property {string} icon - Metric icon
 */

/**
 * @typedef {Object} ChartData
 * @property {string} label - Chart label
 * @property {*} value - Chart value
 * @property {string} color - Chart color
 */

/**
 * @typedef {Object} ReportFilter
 * @property {string} field - Filter field
 * @property {string} operator - Filter operator
 * @property {*} value - Filter value
 */

/**
 * @typedef {Object} Notification
 * @property {string} id - Notification ID
 * @property {string} type - Notification type
 * @property {string} title - Notification title
 * @property {string} message - Notification message
 * @property {boolean} read - Whether notification is read
 * @property {Date} createdAt - Notification creation timestamp
 */

/**
 * @typedef {Object} AuditLog
 * @property {string} id - Log ID
 * @property {string} userId - User ID
 * @property {string} action - Action performed
 * @property {string} resource - Resource affected
 * @property {string} resourceId - Resource ID
 * @property {Object} details - Action details
 * @property {string} ipAddress - User IP address
 * @property {string} userAgent - User agent string
 * @property {Date} createdAt - Log creation timestamp
 */ 