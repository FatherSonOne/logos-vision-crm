import React, { ReactNode } from 'react';
import { usePermissions } from '../contexts/PermissionContext';
import { Permission } from '../types';

interface ProtectedComponentProps {
  children: ReactNode;
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean; // If true, user must have all permissions. If false, any permission is enough.
  fallback?: ReactNode;
  onUnauthorized?: () => void;
}

/**
 * ProtectedComponent - Conditionally renders children based on user permissions
 *
 * Usage:
 * <ProtectedComponent permission={Permission.ProjectCreate}>
 *   <button>Create Project</button>
 * </ProtectedComponent>
 *
 * Or with multiple permissions:
 * <ProtectedComponent permissions={[Permission.ProjectCreate, Permission.ProjectEdit]} requireAll={false}>
 *   <button>Manage Projects</button>
 * </ProtectedComponent>
 */
export const ProtectedComponent: React.FC<ProtectedComponentProps> = ({
  children,
  permission,
  permissions,
  requireAll = false,
  fallback = null,
  onUnauthorized,
}) => {
  const permissionContext = usePermissions();

  let hasAccess = true;

  if (permission) {
    hasAccess = permissionContext.hasPermission(permission);
  } else if (permissions && permissions.length > 0) {
    hasAccess = requireAll
      ? permissionContext.hasAllPermissions(permissions)
      : permissionContext.hasAnyPermission(permissions);
  }

  if (!hasAccess) {
    if (onUnauthorized) {
      onUnauthorized();
    }
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

/**
 * Hook version for programmatic permission checks
 */
export const useProtectedAction = () => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

  const protectedAction = (
    action: () => void,
    permission: Permission | Permission[],
    options?: {
      requireAll?: boolean;
      onUnauthorized?: () => void;
    }
  ) => {
    let hasAccess = false;

    if (Array.isArray(permission)) {
      hasAccess = options?.requireAll
        ? hasAllPermissions(permission)
        : hasAnyPermission(permission);
    } else {
      hasAccess = hasPermission(permission);
    }

    if (hasAccess) {
      action();
    } else if (options?.onUnauthorized) {
      options.onUnauthorized();
    }
  };

  return { protectedAction };
};
