import { useSession } from 'next-auth/react';
import { hasPermission as checkPermission, hasAnyPermission as checkAnyPermission, hasAllPermissions as checkAllPermissions } from '@/lib/constants/roles';

/**
 * Hook to check user permissions based on their role
 * Uses the unified permission system from @/lib/constants/roles
 */
export function usePermissions() {
  const { data: session } = useSession();
  const userRole = session?.user?.role;
  const userPermissions = session?.user?.permissions || [];

  /**
   * Check if user has a specific permission
   * @param {string} permission - Permission string to check
   * @returns {boolean}
   */
  const hasPermission = (permission) => {
    if (!userRole || !permission) {
      return false;
    }
    
    // First check if permissions are available in session (faster)
    if (userPermissions && userPermissions.length > 0) {
      if (userPermissions.includes(permission)) {
        return true;
      }
    }
    
    // Fallback to role-based permission check
    return checkPermission(userRole, permission);
  };

  /**
   * Check if user has any of the specified permissions
   * @param {string[]} permissions - Array of permission strings
   * @returns {boolean}
   */
  const hasAnyPermission = (permissions) => {
    if (!userRole || !permissions || permissions.length === 0) {
      return false;
    }
    return checkAnyPermission(userRole, permissions);
  };

  /**
   * Check if user has all of the specified permissions
   * @param {string[]} permissions - Array of permission strings
   * @returns {boolean}
   */
  const hasAllPermissions = (permissions) => {
    if (!userRole || !permissions || permissions.length === 0) {
      return false;
    }
    return checkAllPermissions(userRole, permissions);
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    userRole,
    userPermissions
  };
}
