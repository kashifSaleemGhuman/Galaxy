import prisma from '@/lib/db'
import { ROLES } from '@/lib/constants/roles'

/**
 * Check if a user is authorized to perform operations on a specific warehouse
 * @param {Object} user - The user object (from session or database)
 * @param {string} warehouseId - The warehouse ID to check
 * @returns {Promise<boolean>} - True if user is authorized, false otherwise
 */
export async function isAuthorizedForWarehouse(user, warehouseId) {
  if (!user || !warehouseId) {
    return false
  }

  const role = (user.role || '').toUpperCase()

  // Super admins and inventory managers have access to all warehouses
  if ([ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.INVENTORY_MANAGER].includes(role)) {
    return true
  }

  // Warehouse operators can only access their assigned warehouse
  if (role === ROLES.WAREHOUSE_OPERATOR) {
    try {
      const warehouse = await prisma.warehouse.findUnique({
        where: { id: warehouseId },
        select: { managerId: true }
      })

      if (!warehouse) {
        return false
      }

      // Check if the user is the manager of this warehouse
      return warehouse.managerId === user.id
    } catch (error) {
      console.error('Error checking warehouse authorization:', error)
      return false
    }
  }

  // Other roles don't have warehouse-specific access
  return false
}

/**
 * Get the warehouse ID that a warehouse operator is assigned to
 * @param {string} userId - The user ID
 * @returns {Promise<string|null>} - The warehouse ID or null if not assigned
 */
export async function getAssignedWarehouseId(userId) {
  if (!userId) {
    return null
  }

  try {
    const warehouse = await prisma.warehouse.findFirst({
      where: { managerId: userId },
      select: { id: true }
    })

    return warehouse?.id || null
  } catch (error) {
    console.error('Error getting assigned warehouse:', error)
    return null
  }
}

