enum CategoryPermissionEnums {
  CREATE = 'create category',
  READ = 'read category',
  UPDATE = 'update category',
  DELETE = 'delete category',
}

enum DashboardPermissionEnums {
  READ = 'read dashboard',
}

enum RolePermissionEnums {
  CREATE = 'create role',
  READ = 'read role',
  UPDATE = 'update role',
  DELETE = 'delete role',
}

export const PERMISSIONENUMS = {
  CATEGORY: CategoryPermissionEnums,
  DASHBOARD: DashboardPermissionEnums,
  ROLE: RolePermissionEnums,
}