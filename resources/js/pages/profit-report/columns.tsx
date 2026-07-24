import type { ColumnDef } from '@tanstack/react-table';
import { FileText, MoreHorizontal } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ServerSideDataTableHeader } from '@/components/server-side-data-table-header';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatRupiah } from '@/lib/format-money';
import dayjs from 'dayjs';

export interface ProfitRecord {
    id: number;
    transaction_id: number;
    invoice_number: string;
    created_at: number;
    cashier_name: string;
    payment_method_name: string;
    total_revenue: number;
    total_cost: number;
    profit: number;
}

interface ColumnsProps {
    onDetailClick: (id: number, invoice: string) => void;
    onSortChange: (orderBy: string | null, order: string | null) => void;
    orderBy: string | null;
    order: string | null;
}

export const columns = (props?: ColumnsProps): ColumnDef<ProfitRecord>[] => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { t } = useTranslation();

    return [
        {
            id: t('page.profit.columns.invoice', 'No. Invoice'),
            accessorKey: 'invoice_number',
            header: ({ column }) => (
                <ServerSideDataTableHeader
                    column={column}
                    title={t('page.profit.columns.invoice', 'No. Invoice')}
                    sortKey="invoice_number"
                    orderBy={props?.orderBy}
                    order={props?.order}
                    onSortChange={props?.onSortChange}
                />
            ),
            cell: ({ row }) => (
                <button
                    type="button"
                    onClick={() => props?.onDetailClick(row.original.transaction_id, row.original.invoice_number)}
                    className="cursor-pointer text-left font-mono text-sm font-semibold whitespace-nowrap text-primary transition-colors hover:text-primary/80 hover:underline focus:outline-none"
                >
                    {row.original.invoice_number}
                </button>
            ),
        },
        {
            id: t('page.profit.columns.date', 'Tanggal & Waktu'),
            accessorKey: 'created_at',
            cell: ({ row }) => dayjs.unix(row.original.created_at).format('DD/MM/YYYY HH:mm'),
        },
        {
            id: t('page.profit.columns.cashier', 'Kasir'),
            accessorKey: 'cashier_name',
            cell: ({ row }) => row.original.cashier_name,
        },
        {
            id: t('page.profit.columns.payment', 'Metode Bayar'),
            accessorKey: 'payment_method_name',
            cell: ({ row }) => row.original.payment_method_name,
        },
        {
            id: t('page.profit.columns.revenue', 'Total Penjualan'),
            accessorKey: 'total_revenue',
            header: ({ column }) => (
                <ServerSideDataTableHeader
                    column={column}
                    title={t('page.profit.columns.revenue', 'Total Penjualan')}
                    sortKey="total_revenue"
                    orderBy={props?.orderBy}
                    order={props?.order}
                    onSortChange={props?.onSortChange}
                />
            ),
            cell: ({ row }) => formatRupiah(row.original.total_revenue),
        },
        {
            id: t('page.profit.columns.cost', 'Total Modal (HPP)'),
            accessorKey: 'total_cost',
            header: ({ column }) => (
                <ServerSideDataTableHeader
                    column={column}
                    title={t('page.profit.columns.cost', 'Total Modal (HPP)')}
                    sortKey="total_cost"
                    orderBy={props?.orderBy}
                    order={props?.order}
                    onSortChange={props?.onSortChange}
                />
            ),
            cell: ({ row }) => formatRupiah(row.original.total_cost),
        },
        {
            id: t('page.profit.columns.profit', 'Laba Bersih'),
            accessorKey: 'profit',
            header: ({ column }) => (
                <ServerSideDataTableHeader
                    column={column}
                    title={t('page.profit.columns.profit', 'Laba Bersih')}
                    sortKey="profit"
                    orderBy={props?.orderBy}
                    order={props?.order}
                    onSortChange={props?.onSortChange}
                />
            ),
            cell: ({ row }) => {
                const profit = row.original.profit;
                const isPositive = profit >= 0;
                return (
                    <span className={`font-bold ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {formatRupiah(profit)}
                    </span>
                );
            },
        },
        {
            id: t('page.profit.columns.actions', 'Aksi'),
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>{t('page.profit.actions.title', 'Aksi')}</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => props?.onDetailClick(row.original.transaction_id, row.original.invoice_number)}>
                            <FileText className="mr-2 h-4 w-4 text-blue-500" />
                            Detail Transaksi
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];
};
