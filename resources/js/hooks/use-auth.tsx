import { RoleEnums } from '@/support/enums/RoleEnums';
import { usePage } from '@inertiajs/react';

interface User {
  id: number;
  name: string;
  email: string;
  roles: string[];
  permissions: string[];
}

export const useAuth = () => {
  const { auth } = usePage().props;
  const user = auth?.user as User | undefined;

  const hasRole = (role: string | string[]): boolean => {
    if (!user) return false;

    if (typeof role === 'string') {
      return user.roles.includes(role);
    }

    // Jika array, cek apakah user memiliki salah satu role
    return role.some(r => user.roles.includes(r));
  };

  const isSuperAdmin = (): boolean => {
    return hasRole(RoleEnums.SUPER_ADMIN);
  };

  const hasPermission = (permission: string | string[]): boolean => {
    if (!user) return false;

    // Super admin bypass semua permission checks
    if (isSuperAdmin()) return true;

    if (typeof permission === 'string') {
      return user.permissions.includes(permission);
    }

    // Jika array, cek apakah user memiliki semua permissions
    return permission.every(p => user.permissions.includes(p));
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    if (!user) return false;

    // Super admin bypass semua permission checks
    if (isSuperAdmin()) return true;

    return permissions.some(p => user.permissions.includes(p));
  };


  return {
    user,
    hasRole,
    hasPermission,
    hasAnyPermission,
    isSuperAdmin,
  };
};