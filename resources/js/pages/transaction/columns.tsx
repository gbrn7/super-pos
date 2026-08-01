import { FileText, MoreHorizontal, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ServerSideDataTableHeader } from '@/components/server-side-data-table-header';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatRupiah } from '@/lib/format-money';
import type { Transaction } from '@/support/models/transaction';
import dayjs from 'dayjs';

interface ColumnsProps {
    onDetailClick: (transaction: Transaction) => void;
    onReturnClick?: (transaction: Transaction) => void;
    onSortChange: (orderBy: string | null, order: string | null) => void;
    orderBy: string | null;
    order: string | null;
}

export const columns = (props?: ColumnsProps): ColumnDef<Transaction>[] => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { t } = useTranslation();

    return [
        {
            id: t(
                'page.transaction.data_table.columns.select_column_label',
                'Pilih',
            ),
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
            id: t(
                'page.transaction.data_table.columns.invoice_number_column_label',
                'No. Invoice',
            ),
            accessorKey: 'invoice_number',
            size: 240,
            minSize: 200,
            header: ({ column }) => (
                <ServerSideDataTableHeader
                    column={column}
                    title={t(
                        'page.transaction.data_table.columns.invoice_number_column_label',
                        'No. Invoice',
                    )}
                    sortKey="invoice_number"
                    orderBy={props?.orderBy}
                    order={props?.order}
                    onSortChange={props?.onSortChange}
                />
            ),
            cell: ({ row }) => (
                <button
                    type="button"
                    onClick={() => props?.onDetailClick(row.original)}
                    className="cursor-pointer text-left font-mono text-sm font-semibold whitespace-nowrap text-primary transition-colors hover:text-primary/80 hover:underline focus:outline-none"
                    title={t(
                        'component.data_table.action_menu.detail_data_btn',
                        'Detail data',
                    )}
                >
                    {row.original.invoice_number}
                </button>
            ),
        },
        {
            id: t(
                'page.transaction.data_table.columns.user_name_column_label',
                'Kasir / Petugas',
            ),
            accessorKey: 'user_name',
            header: ({ column }) => (
                <ServerSideDataTableHeader
                    column={column}
                    title={t(
                        'page.transaction.data_table.columns.user_name_column_label',
                        'Kasir / Petugas',
                    )}
                    sortKey="user_id"
                    orderBy={props?.orderBy}
                    order={props?.order}
                    onSortChange={props?.onSortChange}
                />
            ),
            cell: ({ row }) => row.original.user_name || '-',
        },
        {
            id: t(
                'page.transaction.data_table.columns.payment_method_column_label',
                'Metode Pembayaran',
            ),
            accessorKey: 'payment_method_name',
            header: ({ column }) => (
                <ServerSideDataTableHeader
                    column={column}
                    title={t(
                        'page.transaction.data_table.columns.payment_method_column_label',
                        'Metode Pembayaran',
                    )}
                    sortKey="payment_method_name"
                    orderBy={props?.orderBy}
                    order={props?.order}
                    onSortChange={props?.onSortChange}
                />
            ),
            cell: ({ row }) => row.original.payment_method_name || '-',
        },
        {
            id: t(
                'page.transaction.data_table.columns.total_amount_column_label',
                'Total Transaksi',
            ),
            accessorKey: 'total_amount',
            header: ({ column }) => (
                <ServerSideDataTableHeader
                    column={column}
                    title={t(
                        'page.transaction.data_table.columns.total_amount_column_label',
                        'Total Transaksi',
                    )}
                    sortKey="total_amount"
                    orderBy={props?.orderBy}
                    order={props?.order}
                    onSortChange={props?.onSortChange}
                />
            ),
            cell: ({ row }) => (
                <span className="font-semibold text-foreground">
                    {formatRupiah(row.original.total_amount)}
                </span>
            ),
        },
        {
            id: t(
                'page.transaction.data_table.columns.payment_amount_column_label',
                'Bayar',
            ),
            accessorKey: 'payment_amount',
            header: ({ column }) => (
                <ServerSideDataTableHeader
                    column={column}
                    title={t(
                        'page.transaction.data_table.columns.payment_amount_column_label',
                        'Bayar',
                    )}
                    sortKey="payment_amount"
                    orderBy={props?.orderBy}
                    order={props?.order}
                    onSortChange={props?.onSortChange}
                />
            ),
            cell: ({ row }) => formatRupiah(row.original.payment_amount),
        },
        {
            id: t(
                'page.transaction.data_table.columns.change_amount_column_label',
                'Kembali',
            ),
            accessorKey: 'change_amount',
            header: ({ column }) => (
                <ServerSideDataTableHeader
                    column={column}
                    title={t(
                        'page.transaction.data_table.columns.change_amount_column_label',
                        'Kembali',
                    )}
                    sortKey="change_amount"
                    orderBy={props?.orderBy}
                    order={props?.order}
                    onSortChange={props?.onSortChange}
                />
            ),
            cell: ({ row }) => formatRupiah(row.original.change_amount),
        },
        {
            id: t(
                'page.transaction.data_table.columns.created_at_column_label',
                'Tanggal & Waktu',
            ),
            accessorKey: 'created_at',
            header: ({ column }) => (
                <ServerSideDataTableHeader
                    column={column}
                    title={t(
                        'page.transaction.data_table.columns.created_at_column_label',
                        'Tanggal & Waktu',
                    )}
                    sortKey="created_at"
                    orderBy={props?.orderBy}
                    order={props?.order}
                    onSortChange={props?.onSortChange}
                />
            ),
            cell: ({ row }) => {
                const dateVal = row.original.created_at;
                if (!dateVal) return '-';
                let parsed: dayjs.Dayjs;
                if (typeof dateVal === 'number' || !isNaN(Number(dateVal))) {
                    const num = Number(dateVal);
                    // Check if timestamp is in seconds (10 digits) or milliseconds (13 digits)
                    parsed = num > 1e11 ? dayjs(num) : dayjs.unix(num);
                } else {
                    parsed = dayjs(dateVal);
                }
                return (
                    <span className="whitespace-nowrap">
                        {parsed.isValid() ? parsed.format('DD/MM/YYYY, HH:mm') : '-'}
                    </span>
                );
            },
        },
        {
            id: t(
                'page.transaction.data_table.columns.actions_column_label',
                'Aksi',
            ),
            enableSorting: false,
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">
                                {t(
                                    'component.data_table.action_menu.trigger_btn_label',
                                    'Buka Menu',
                                )}
                            </span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>
                            {t(
                                'component.data_table.action_menu.label',
                                'Aksi',
                            )}
                        </DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={() => props?.onDetailClick(row.original)}
                        >
                            <FileText className="mr-2 h-4 w-4 text-white" />
                            {t(
                                'component.data_table.action_menu.detail_data_btn',
                                'Detail data',
                            )}
                        </DropdownMenuItem>
                        {props?.onReturnClick && (
                            <DropdownMenuItem
                                onClick={() => props.onReturnClick!(row.original)}
                            >
                                <RotateCcw className="mr-2 h-4 w-4 text-white" />
                                {t(
                                    'component.data_table.action_menu.return_btn',
                                    'Retur Barang',
                                )}
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];
};
