import { useSession } from 'next-auth/react';
import { ROLE_PERMISSIONS } from '@/lib/constants/roles';

export function usePermissions() {
  const { data: session } = useSession();
  const userRole = session?.user?.role;

  const hasPermission = (permission) => {
    if (!userRole || !ROLE_PERMISSIONS[userRole]) {
      return false;
    }
    return ROLE_PERMISSIONS[userRole].includes(permission);
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
