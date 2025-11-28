import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { Permission, UserRole, rolePermissionsMap } from '../types';

interface PermissionContextType {
  userRole: UserRole;
  permissions: Permission[];
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  canView: (resource: string) => boolean;
  canCreate: (resource: string) => boolean;
  canEdit: (resource: string) => boolean;
  canDelete: (resource: string) => boolean;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export const usePermissions = () => {
  const context = useContext(PermissionContext);
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  return context;
};

interface PermissionProviderProps {
  children: ReactNode;
}

export const PermissionProvider: React.FC<PermissionProviderProps> = ({ children }) => {
  const { user } = useAuth();

  const value = useMemo<PermissionContextType>(() => {
    // Default to Admin role if no role specified or in development mode
    let userRole: UserRole = UserRole.Admin;

    if (user?.role) {
      // Try to map the string role to UserRole enum
      const roleMap: Record<string, UserRole> = {
        'admin': UserRole.Admin,
        'manager': UserRole.Manager,
        'consultant': UserRole.Consultant,
        'client': UserRole.Client,
      };
      userRole = roleMap[user.role.toLowerCase()] || UserRole.Admin;
    }

    // Get permissions based on role
    const permissions = rolePermissionsMap[userRole] || [];

    const hasPermission = (permission: Permission): boolean => {
      return permissions.includes(permission);
    };

    const hasAnyPermission = (requiredPermissions: Permission[]): boolean => {
      return requiredPermissions.some(p => permissions.includes(p));
    };

    const hasAllPermissions = (requiredPermissions: Permission[]): boolean => {
      return requiredPermissions.every(p => permissions.includes(p));
    };

    const canView = (resource: string): boolean => {
      const viewPermission = `${resource}:view` as Permission;
      return permissions.includes(viewPermission);
    };

    const canCreate = (resource: string): boolean => {
      const createPermission = `${resource}:create` as Permission;
      return permissions.includes(createPermission);
    };

    const canEdit = (resource: string): boolean => {
      const editPermission = `${resource}:edit` as Permission;
      return permissions.includes(editPermission);
    };

    const canDelete = (resource: string): boolean => {
      const deletePermission = `${resource}:delete` as Permission;
      return permissions.includes(deletePermission);
    };

    return {
      userRole,
      permissions,
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
      canView,
      canCreate,
      canEdit,
      canDelete,
    };
  }, [user]);

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
};
