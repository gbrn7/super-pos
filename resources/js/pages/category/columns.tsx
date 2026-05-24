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
import type { Category } from '@/support/models/category';
import { useTranslation } from 'react-i18next';
import { formatDate } from '@/lib/formatdate';
import { Can } from '@/components/auth/can';
import { PERMISSIONS } from '@/support/enums/PermissionEnums';


interface ColumnsProps {
    onDetailClick: (category: Category) => void;
    onEditClick: (category: Category) => void;
    onDeleteClick: (category: Category) => void;
}

export const columns = (props?: ColumnsProps): ColumnDef<Category>[] => {
    const { t } = useTranslation()

    const PERMISSIONSLIST = PERMISSIONS();


    return [
        {
            id: t("page.category.data_table.columns.select_column_label", "Pilih"),
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
            id: t("page.category.data_table.columns.name_column_label", "Nama"),
            accessorKey: 'name',
            header: ({ column }) => (
                <DataTableHeader column={column} title={t("page.category.data_table.columns.name_column_label", "Nama")} />
            ),
            enableSorting: true,
        },
        {
            id: t("page.category.data_table.columns.desc_column_label", "Deskripsi"),
            accessorKey: 'desc',
            header: ({ column }) => (
                <DataTableHeader column={column} title={t("page.category.data_table.columns.desc_column_label", "Deskripsi")} />
            ),
            enableSorting: true,
        },
        {
            id: t("page.category.data_table.columns.created_at_column_label", "Tanggal Dibuat"),
            accessorKey: 'created_at',
            header: ({ column }) => (
                <DataTableHeader column={column} title={t("page.category.data_table.columns.created_at_column_label", "Tanggal Dibuat")} />
            ),
            enableSorting: true,
            cell: ({ row }) => formatDate(row.original.created_at),
        },
        {
            id: t("page.category.data_table.columns.updated_at_column_label", "Tanggal Diperbarui"),
            accessorKey: 'updated_at',
            header: ({ column }) => (
                <DataTableHeader column={column} title={t("page.category.data_table.columns.updated_at_column_label", "Tanggal Diperbarui")} />
            ),
            enableSorting: true,
            cell: ({ row }) => formatDate(row.original.updated_at),
        },
        {
            id: t("page.category.data_table.columns.actions_column_label", "Aksi"),
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
                        <DropdownMenuItem
                            onClick={() => props?.onDetailClick(row.original)}
                        >
                            <FileText className="mr-0.5 h-4 w-4" />
                            {t("component.data_table.action_menu.detail_data_btn", "Detail data")}
                        </DropdownMenuItem>
                        <Can permission={PERMISSIONSLIST.CATEGORY.ACCESS.UPDATE.VALUE}>
                            <DropdownMenuItem
                                onClick={() => props?.onEditClick(row.original)}
                            >
                                <Pencil className="mr-0.5 h-4 w-4" />
                                {t("component.data_table.action_menu.edit_data_btn", "Edit data")}
                            </DropdownMenuItem>
                        </Can>
                        <Can permission={PERMISSIONSLIST.CATEGORY.ACCESS.DELETE.VALUE}>
                            <DropdownMenuItem
                                onClick={() => props?.onDeleteClick(row.original)}
                                variant="destructive"
                            >
                                <Trash className="mr-0.5 h-4 w-4" />
                                {t("component.data_table.action_menu.delete_data_btn", "Hapus data")}
                            </DropdownMenuItem>
                        </Can>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ]
};
