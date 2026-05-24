import { useTranslation } from "react-i18next"
import { PermissionList } from "../interfaces/permission/permission"

enum CategoryPermissionEnums {
  CREATE = 'create-category',
  READ = 'read-category',
  UPDATE = 'update-category',
  DELETE = 'delete-category',
}

enum DashboardPermissionEnums {
  READ = 'read-dashboard',
}

enum RolePermissionEnums {
  CREATE = 'create-role',
  READ = 'read-role',
  UPDATE = 'update-role',
  DELETE = 'delete-role',
}

export const PERMISSIONENUMS = {
  CATEGORY: CategoryPermissionEnums,
  DASHBOARD: DashboardPermissionEnums,
  ROLE: RolePermissionEnums,
}

export const PERMISSIONList = (): PermissionList => {
  const { t } = useTranslation()

  return {
    CATEGORY: {
      LABEL: t("permission_label.category.permission", "Kategori"),
      ACCESS: [
        {
          LABEL: t("permission_label.category.create", "Buat Kategori"),
          VALUE: CategoryPermissionEnums.CREATE,
        },
        {
          LABEL: t("permission_label.category.read", "Baca Kategori"),
          VALUE: CategoryPermissionEnums.READ,
        },
        {
          LABEL: t("permission_label.category.update", "Update Kategori"),
          VALUE: CategoryPermissionEnums.UPDATE,
        },
        {
          LABEL: t("permission_label.category.delete", "Hapus Kategori"),
          VALUE: CategoryPermissionEnums.DELETE,
        }
      ],
    },
    ROLE: {
      LABEL: t("permission_label.role.permission", "Peran"),
      ACCESS: [
        {
          LABEL: t("permission_label.role.create", "Buat Peran"),
          VALUE: RolePermissionEnums.CREATE,
        },
        {
          LABEL: t("permission_label.role.read", "Baca Peran"),
          VALUE: RolePermissionEnums.READ,
        },
        {
          LABEL: t("permission_label.role.update", "Update Peran"),
          VALUE: RolePermissionEnums.UPDATE,
        },
        {
          LABEL: t("permission_label.role.delete", "Hapus Peran"),
          VALUE: RolePermissionEnums.DELETE,
        }
      ]
    },
    DASHBOARD: {
      LABEL: t("permission_label.dashboard.permission", "Dasbor"),
      ACCESS: [
        {
          LABEL: t("permission_label.dashboard.read", "Baca Dasbor"),
          VALUE: DashboardPermissionEnums.READ,
        }
      ]
    }
  }
}
