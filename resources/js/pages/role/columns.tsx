import type { ColumnDef } from '@tanstack/react-table';
import { FileText, MoreHorizontal, Pencil, Trash } from 'lucide-react';
import { DataTableHeader } from '@/components/data-table-header';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Role } from '@/support/models/role';
import { useTranslation } from 'react-i18next';
import { formatDate } from '@/lib/format-date';
import { Can } from '@/components/auth/can';
import { PERMISSIONENUMS } from '@/support/enums/PermissionEnums';
import { edit as editRole, show as detailRoute } from '@/routes/roles';
import { Link } from '@inertiajs/react';


interface ColumnsProps {
    onDetailClick: (role: Role) => void;
    onEditClick: (role: Role) => void;
    onDeleteClick: (role: Role) => void;
}

export const columns = (props?: ColumnsProps): ColumnDef<Role>[] => {
    const { t } = useTranslation()

    return [
        {
            id: t("page.role.data_table.columns.select_column_label", "Pilih"),
            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && 'indeterminate')
                    }
                    onCheckedChange={(value) =>
                        table.toggleAllPageRowsSelected(!!value)
                    }
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            id: t("page.role.data_table.columns.name_column_label", "Nama"),
            accessorKey: 'name',
            header: ({ column }) => (
                <DataTableHeader column={column} title={t("page.role.data_table.columns.name_column_label", "Nama")} />
            ),
            enableSorting: true,
        },
        {
            id: t("page.role.data_table.columns.guard_name_column_label", "Nama Garda"),
            accessorKey: 'guard_name',
            header: ({ column }) => (
                <DataTableHeader column={column} title={t("page.role.data_table.columns.guard_name_column_label", "Nama Garda")} />
            ),
            enableSorting: true,
        },
        {
            id: t("page.role.data_table.columns.created_at_column_label", "Tanggal Dibuat"),
            accessorKey: 'created_at',
            header: ({ column }) => (
                <DataTableHeader column={column} title={t("page.role.data_table.columns.created_at_column_label", "Tanggal Dibuat")} />
            ),
            enableSorting: true,
            cell: ({ row }) => formatDate(row.original.created_at),
        },
        {
            id: t("page.role.data_table.columns.updated_at_column_label", "Tanggal Diperbarui"),
            accessorKey: 'updated_at',
            header: ({ column }) => (
                <DataTableHeader column={column} title={t("page.role.data_table.columns.updated_at_column_label", "Tanggal Diperbarui")} />
            ),
            enableSorting: true,
            cell: ({ row }) => formatDate(row.original.updated_at),
        },
        {
            id: t("page.role.data_table.columns.actions_column_label", "Aksi"),
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">{t("component.data_table.action_menu.trigger_btn_label", "Buka Menu")}</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>{t("component.data_table.action_menu.label", "Aksi")}</DropdownMenuLabel>
                        <Link href={detailRoute(row.original.id).url}>
                            <DropdownMenuItem>
                                <FileText className="mr-0.5 h-4 w-4" />
                                {t("component.data_table.action_menu.detail_data_btn", "Detail data")}
                            </DropdownMenuItem>
                        </Link>
                        <Can permission={PERMISSIONENUMS.ROLE.UPDATE}>
                            <Link href={editRole(row.original.id).url}>
                                <DropdownMenuItem                            >
                                    <Pencil className="mr-0.5 h-4 w-4" />
                                    {t("component.data_table.action_menu.edit_data_btn", "Edit data")}
                                </DropdownMenuItem>
                            </Link>
                        </Can>
                        <Can permission={PERMISSIONENUMS.ROLE.DELETE}>
                            <DropdownMenuItem
                                onClick={() => props?.onDeleteClick(row.original)}
                                variant="destructive"
                            >
                                <Trash className="mr-0.5 h-4 w-4" />
                                {t("component.data_table.action_menu.delete_data_btn", "Hapus data")}
                            </DropdownMenuItem>
                        </Can>
                    </DropdownMenuContent>
                </DropdownMenu >
            ),
        },
    ]
};
