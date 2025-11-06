import { useSession } from 'next-auth/react';
import { ROLE_PERMISSIONS } from '@/lib/constants/roles';

export function usePermissions() {
  const { data: session } = useSession();
  const userRole = session?.user?.role;

  const hasPermission = (permission) => {
    if (!userRole) {
      return false;
    }
    
    // Handle role mapping - convert database roles to permission keys
    const roleKey = userRole === 'SUPER_ADMIN' ? 'Admin' : 
                   userRole === 'PURCHASE_MANAGER' ? 'Purchase Manager' :
                   userRole === 'INVENTORY_MANAGER' ? 'Inventory Manager' :
                   userRole;
    
    const rolePermissions = ROLE_PERMISSIONS[roleKey];
    if (!rolePermissions) {
      // If no specific role permissions, check if user is admin/super admin
      if (userRole === 'SUPER_ADMIN' || userRole === 'ADMIN') {
        return true; // Super admin and admin have all permissions
      }
      return false;
    }
    
    return rolePermissions.includes(permission);
  };

  const hasAnyPermission = (permissions) => {
    return permissions.some(permission => hasPermission(permission));
  };

  const hasAllPermissions = (permissions) => {
    return permissions.every(permission => hasPermission(permission));
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    userRole
  };
}
