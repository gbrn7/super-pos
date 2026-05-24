import { useTranslation } from "react-i18next"

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

export const PERMISSIONLIST = (): Permission[] => {
  const { t } = useTranslation()

  return [
    {
      LABEL: t("permission_label.category.permission", "Kategori"),
      ACCESSLIST: [
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
    {
      LABEL: t("permission_label.role.permission", "Peran"),
      ACCESSLIST: [
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
    {
      LABEL: t("permission_label.dashboard.permission", "Dasbor"),
      ACCESSLIST: [
        {
          LABEL: t("permission_label.dashboard.read", "Baca Dasbor"),
          VALUE: DashboardPermissionEnums.READ,
        }
      ]
    },
  ]
}
