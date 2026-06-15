import type { ColumnDef } from '@tanstack/react-table';
import { FileText, MoreHorizontal, Pencil, Trash } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Can } from '@/components/auth/can';
import { ServerSideDataTableHeader } from '@/components/server-side-data-table-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { STOCK_THRESHOLD } from '@/constants/Index';
import { formatRupiah } from '@/lib/format-money';
import { PERMISSIONENUMS } from '@/support/enums/PermissionEnums';
import type { Product } from '@/support/models/product';


interface ColumnsProps {
    onDetailClick: (product: Product) => void;
    onEditClick: (product: Product) => void;
    onDeleteClick: (product: Product) => void;
    onSortChange: (orderBy: string | null, order: string | null) => void;
    orderBy: string | null;
    order: string | null;
}

export const columns = (props?: ColumnsProps): ColumnDef<Product>[] => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
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
                <ServerSideDataTableHeader column={column} title={t("page.product.data_table.columns.name_column_label", "Nama")} sortKey="name" orderBy={props?.orderBy} order={props?.order} onSortChange={props?.onSortChange} />
            ),
            size: 300,
        },
        {
            id: t("page.product.data_table.columns.sku_column_label", "SKU"),
            accessorKey: 'sku',
            header: ({ column }) => (
                <ServerSideDataTableHeader column={column} title={t("page.product.data_table.columns.sku_column_label", "SKU")} sortKey="sku" orderBy={props?.orderBy} order={props?.order} onSortChange={props?.onSortChange} />
            ),
            size: 300,
        },
        {
            id: t("page.product.data_table.columns.category_column_label", "Kategori"),
            accessorKey: 'category_name',
            header: ({ column }) => (
                <ServerSideDataTableHeader column={column} title={t("page.product.data_table.columns.category_column_label", "Kategori")} sortKey="category_id" orderBy={props?.orderBy} order={props?.order} onSortChange={props?.onSortChange} />
            ),
        },
        {
            id: t("page.product.data_table.columns.unit_column_label", "Satuan"),
            accessorKey: 'unit_name',
            header: ({ column }) => (
                <ServerSideDataTableHeader column={column} title={t("page.product.data_table.columns.unit_column_label", "Satuan")} sortKey="unit_id" orderBy={props?.orderBy} order={props?.order} onSortChange={props?.onSortChange} />
            ),
        },
        {
            id: t("page.product.data_table.columns.stock_column_label", "Stok"),
            accessorKey: 'stock',
            header: ({ column }) => (
                <ServerSideDataTableHeader column={column} title={t("page.product.data_table.columns.stock_column_label", "Stok")} sortKey="stock" orderBy={props?.orderBy} order={props?.order} onSortChange={props?.onSortChange} />
            ),
            cell: ({ row }) => (
                row.original.stock > 0 ?
                    (
                        row.original.stock > STOCK_THRESHOLD ?
                            (
                                <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                    {
                                        row.original.stock
                                    }
                                </Badge>
                            )
                            :
                            (<Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                                {
                                    row.original.stock
                                }
                            </Badge>)
                    )
                    :
                    (<Badge className="bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                        {
                            row.original.stock
                        }
                    </Badge>)
            ),
        },
        {
            id: t("page.product.data_table.columns.price_column_label", "Harga"),
            accessorKey: 'price',
            header: ({ column }) => (
                <ServerSideDataTableHeader column={column} title={t("page.product.data_table.columns.price_column_label", "Harga")} sortKey="price" orderBy={props?.orderBy} order={props?.order} onSortChange={props?.onSortChange} />
            ),
            cell: ({ row }) => (formatRupiah(row.original.price))
        },
        {
            id: t("page.product.data_table.columns.cost_price_column_label", "Harga Modal"),
            accessorKey: 'cost_price',
            header: ({ column }) => (
                <ServerSideDataTableHeader column={column} title={t("page.product.data_table.columns.cost_price_column_label", "Harga Modal")} sortKey="cost_price" orderBy={props?.orderBy} order={props?.order} onSortChange={props?.onSortChange} />
            ),
            cell: ({ row }) => (formatRupiah(row.original.cost_price))
        },
        {
            id: t("page.product.data_table.columns.is_active_column_label", "Status"),
            accessorKey: 'status',
            header: ({ column }) => (
                <ServerSideDataTableHeader column={column} title={t("page.product.data_table.columns.is_active_column_label", "Status")} sortKey="is_active" orderBy={props?.orderBy} order={props?.order} onSortChange={props?.onSortChange} />
            ),
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
            id: t("page.product.data_table.columns.is_unlimited_column_label", "Tipe Stok"),
            accessorKey: 'status_stok',
            header: ({ column }) => (
                <ServerSideDataTableHeader column={column} title={t("page.product.data_table.columns.is_unlimited_column_label", "Tipe Stok")} sortKey="is_unlimited" orderBy={props?.orderBy} order={props?.order} onSortChange={props?.onSortChange} />
            ),
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
            enableSorting: false,
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
