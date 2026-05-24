import { useTranslation } from "react-i18next"
import { Permissions } from "../interfaces/permission/permission"

enum CategoryPermissionEnums {
  CREATE = 'create category',
  READ = 'read category',
  UPDATE = 'update category',
  DELETE = 'delete category',
}

enum DashboardPermissionEnums {
  CREATE = 'create dashboard',
  READ = 'read dashboard',
  UPDATE = 'update dashboard',
  DELETE = 'delete dashboard',
}

enum RolePermissionEnums {
  CREATE = 'create role',
  READ = 'read role',
  UPDATE = 'update role',
  DELETE = 'delete role',
}


export const PERMISSIONS = (): Permissions => {
  const { t } = useTranslation()

  return {
    CATEGORY: {
      LABEL: t("permission_label.category.permission", "Kategori"),
      ACCESS: {
        CREATE: {
          LABEL: t("permission_label.category.create", "Buat Kategori"),
          VALUE: CategoryPermissionEnums.CREATE,
        },
        READ: {
          LABEL: t("permission_label.category.read", "Baca Kategori"),
          VALUE: CategoryPermissionEnums.READ,
        },
        UPDATE: {
          LABEL: t("permission_label.category.update", "Update Kategori"),
          VALUE: CategoryPermissionEnums.UPDATE,
        },
        DELETE: {
          LABEL: t("permission_label.category.delete", "Hapus Kategori"),
          VALUE: CategoryPermissionEnums.DELETE,
        }
      }
    },
    ROLE: {
      LABEL: t("permission_label.role.permission", "Peran"),
      ACCESS: {
        CREATE: {
          LABEL: t("permission_label.role.create", "Buat Peran"),
          VALUE: RolePermissionEnums.CREATE,
        },
        READ: {
          LABEL: t("permission_label.role.read", "Baca Peran"),
          VALUE: RolePermissionEnums.READ,
        },
        UPDATE: {
          LABEL: t("permission_label.role.update", "Update Peran"),
          VALUE: RolePermissionEnums.UPDATE,
        },
        DELETE: {
          LABEL: t("permission_label.role.delete", "Hapus Peran"),
          VALUE: RolePermissionEnums.DELETE,
        }
      }
    },
    DASHBOARD: {
      LABEL: t("permission_label.dashboard.permission", "Dasbor"),
      ACCESS: {
        CREATE: {
          LABEL: t("permission_label.dashboard.create", "Buat Dasbor"),
          VALUE: DashboardPermissionEnums.CREATE,
        },
        READ: {
          LABEL: t("permission_label.dashboard.read", "Baca Dasbor"),
          VALUE: DashboardPermissionEnums.READ,
        },
        UPDATE: {
          LABEL: t("permission_label.dashboard.update", "Update Dasbor"),
          VALUE: DashboardPermissionEnums.UPDATE,
        },
        DELETE: {
          LABEL: t("permission_label.dashboard.delete", "Hapus Dasbor"),
          VALUE: DashboardPermissionEnums.DELETE,
        }
      }
    }
  }
}
