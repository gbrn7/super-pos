interface Permission {
  LABEL: string
  ACCESS: {
    LABEL: string
    VALUE: string
  }[]
}

export interface PermissionList {
  CATEGORY: Permission
  ROLE: Permission
  DASHBOARD: Permission
}