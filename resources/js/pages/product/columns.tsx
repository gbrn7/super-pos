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
import type { Product } from '@/support/models/product';
import { useTranslation } from 'react-i18next';
import { Can } from '@/components/auth/can';
import { PERMISSIONENUMS } from '@/support/enums/PermissionEnums';
import { Badge } from '@/components/ui/badge';
import { formatRupiah } from '@/lib/format-money';


interface ColumnsProps {
    onDetailClick: (product: Product) => void;
    onEditClick: (product: Product) => void;
    onDeleteClick: (product: Product) => void;
}

export const columns = (props?: ColumnsProps): ColumnDef<Product>[] => {
    const { t } = useTranslation()

    return [
        {
            id: t("page.product.data_table.columns.select_column_label", "Pilih"),
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
            id: t("page.product.data_table.columns.name_column_label", "Nama"),
            accessorKey: 'name',
            header: ({ column }) => (
                <DataTableHeader column={column} title={t("page.product.data_table.columns.name_column_label", "Nama")} />
            ),
            enableSorting: true,
            size: 300,
        },
        {
            id: t("page.product.data_table.columns.sku_column_label", "SKU"),
            accessorKey: 'sku',
            header: ({ column }) => (
                <DataTableHeader column={column} title={t("page.product.data_table.columns.sku_column_label", "SKU")} />
            ),
            enableSorting: true,
            size: 300,
        },
        {
            id: t("page.product.data_table.columns.category_column_label", "Kategori"),
            accessorKey: 'category_name',
            header: ({ column }) => (
                <DataTableHeader column={column} title={t("page.product.data_table.columns.category_column_label", "Kategori")} />
            ),
            enableSorting: true,
        },
        {
            id: t("page.product.data_table.columns.unit_column_label", "Satuan"),
            accessorKey: 'unit_name',
            header: ({ column }) => (
                <DataTableHeader column={column} title={t("page.product.data_table.columns.unit_column_label", "Satuan")} />
            ),
            enableSorting: true,
        },
        {
            id: t("page.product.data_table.columns.stock_column_label", "Stok"),
            accessorKey: 'stock',
            header: ({ column }) => (
                <DataTableHeader column={column} title={t("page.product.data_table.columns.stock_column_label", "Stok")} />
            ),
            enableSorting: true,
        },
        {
            id: t("page.product.data_table.columns.price_column_label", "Harga"),
            accessorKey: 'price',
            header: ({ column }) => (
                <DataTableHeader column={column} title={t("page.product.data_table.columns.price_column_label", "Harga")} />
            ),
            enableSorting: true,
            cell: ({ row }) => (formatRupiah(row.original.price))
        },
        {
            id: t("page.product.data_table.columns.cost_price_column_label", "Harga Modal"),
            accessorKey: 'cost_price',
            header: ({ column }) => (
                <DataTableHeader column={column} title={t("page.product.data_table.columns.cost_price_column_label", "Harga Modal")} />
            ),
            enableSorting: true,
            cell: ({ row }) => (formatRupiah(row.original.cost_price))
        },
        {
            id: t("page.product.data_table.columns.is_active_column_label", "Status"),
            accessorKey: 'status',
            header: ({ column }) => (
                <DataTableHeader column={column} title={t("page.product.data_table.columns.is_active_column_label", "Status")} />
            ),
            enableSorting: true,
            cell: ({ row }) => (
                row.original.is_active ? (<Badge className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
                    {
                        t("page.product.is_active.active", "Aktif")
                    }
                </Badge>) :
                    (<Badge className="bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300">
                        {
                            t("page.product.is_active.inactive", "Tidak Aktif")
                        }
                    </Badge>)
            ),
        },
        {
            id: t("page.product.data_table.columns.is_unlimited_column_label", "Status Stok"),
            accessorKey: 'status_stok',
            header: ({ column }) => (
                <DataTableHeader column={column} title={t("page.product.data_table.columns.is_unlimited_column_label", "Status Stok")} />
            ),
            enableSorting: true,
            cell: ({ row }) => (
                row.original.is_unlimited ? (
                    <Badge className="bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                        {
                            t("page.product.is_unlimited.unlimited", "Tidak Terbatas")
                        }
                    </Badge>
                )
                    :
                    (
                        <Badge className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                            {
                                t("page.product.is_unlimited.limited", "Terbatas")
                            }
                        </Badge>
                    )
            ),
        },
        {
            id: t("page.product.data_table.columns.actions_column_label", "Aksi"),
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
                        <Can permission={PERMISSIONENUMS.PRODUCT.UPDATE}>
                            <DropdownMenuItem
                                onClick={() => props?.onEditClick(row.original)}
                            >
                                <Pencil className="mr-0.5 h-4 w-4" />
                                {t("component.data_table.action_menu.edit_data_btn", "Edit data")}
                            </DropdownMenuItem>
                        </Can>
                        <Can permission={PERMISSIONENUMS.PRODUCT.DELETE}>
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
