import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';

export default function PermissionGuard({ 
  permissions, 
  requireAll = false, 
  children,
  fallback = null 
}) {
  const { hasAnyPermission, hasAllPermissions } = usePermissions();

  const hasAccess = requireAll 
    ? hasAllPermissions(permissions)
    : hasAnyPermission(permissions);

  if (!hasAccess) {
    return fallback;
  }

  return children;
}
