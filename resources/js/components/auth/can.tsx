import { ReactNode } from 'react';
import { useAuth } from '@/hooks/use-auth';

interface CanProps {
  children: ReactNode;
  role?: string | string[];
  permission?: string | string[];
  fallback?: ReactNode;
  requireAll?: boolean; // true = semua harus ada, false = minimal satu
}

export const Can = ({
  children,
  role,
  permission,
  fallback = null,
  requireAll = false,
}: CanProps) => {
  const { hasRole, hasPermission, hasAnyPermission, isSuperAdmin } = useAuth();

  // Super admin bypass semua checks
  if (isSuperAdmin()) {
    return children;
  }

  let hasAccess = true;

  if (role) {
    if (Array.isArray(role)) {
      hasAccess = requireAll
        ? role.every(r => hasRole(r))
        : role.some(r => hasRole(r));
    } else {
      hasAccess = hasRole(role);
    }
  }

  if (permission && hasAccess) {
    if (Array.isArray(permission)) {
      hasAccess = requireAll
        ? permission.every(p => hasPermission(p))
        : hasAnyPermission(permission);
    } else {
      hasAccess = hasPermission(permission);
    }
  }

  return hasAccess ? children : fallback;
};