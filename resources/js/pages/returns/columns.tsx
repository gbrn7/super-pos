import type { ColumnDef } from '@tanstack/react-table';
import i18next from 'i18next';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/format-date';
import { formatRupiah } from '@/lib/format-money';

export interface ReturnDetail {
    id: number;
    product?: { name: string };
    product_name?: string;
    quantity: number;
    price_per_unit: number;
    subtotal: number;
}

export interface ReturnItem {
    id: number;
    return_number: string;
    transaction_id?: number;
    transaction: { invoice_number: string };
    user: { name: string };
    total_refund_amount: number;
    reason: string;
    created_at: number;
    details: ReturnDetail[];
}

export const columns = ({
    onDetailClick,
    onInvoiceClick,
}: {
    onDetailClick: (item: ReturnItem) => void;
    onInvoiceClick: (transactionId: number) => void;
}): ColumnDef<ReturnItem>[] => [
    {
        id: i18next.t(
            'page.return.data_table.columns.return_number',
            'No. Retur',
        ),
        accessorKey: 'return_number',
        header: i18next.t(
            'page.return.data_table.columns.return_number',
            'No. Retur',
        ),
        cell: ({ row }) => (
            <button
                type="button"
                onClick={() => onDetailClick(row.original)}
                className="cursor-pointer border-0 bg-transparent p-0 text-left font-mono font-semibold text-primary hover:underline"
            >
                {row.original.return_number}
            </button>
        ),
    },
    {
        id: i18next.t(
            'page.return.data_table.columns.invoice_number',
            'No. Invoice Struk',
        ),
        accessorKey: 'transaction.invoice_number',
        header: i18next.t(
            'page.return.data_table.columns.invoice_number',
            'No. Invoice Struk',
        ),
        cell: ({ row }) => {
            const invoiceNumber = row.original.transaction?.invoice_number;
            const transactionId = row.original.transaction_id;

            return invoiceNumber ? (
                <button
                    type="button"
                    onClick={() =>
                        transactionId && onInvoiceClick(transactionId)
                    }
                    className="cursor-pointer border-0 bg-transparent p-0 text-left font-mono font-semibold text-primary hover:underline"
                >
                    {invoiceNumber}
                </button>
            ) : (
                <span className="font-mono text-xs text-muted-foreground">
                    -
                </span>
            );
        },
    },
    {
        id: i18next.t(
            'page.return.data_table.columns.user_name',
            'Kasir / Petugas',
        ),
        accessorKey: 'user.name',
        header: i18next.t(
            'page.return.data_table.columns.user_name',
            'Kasir / Petugas',
        ),
        cell: ({ row }) => row.original.user?.name || '-',
    },
    {
        id: i18next.t(
            'page.return.data_table.columns.total_refund',
            'Total Refund',
        ),
        accessorKey: 'total_refund_amount',
        header: i18next.t(
            'page.return.data_table.columns.total_refund',
            'Total Refund',
        ),
        cell: ({ row }) => (
            <span className="font-bold text-rose-600 tabular-nums dark:text-rose-400">
                {formatRupiah(row.original.total_refund_amount)}
            </span>
        ),
    },
    {
        id: i18next.t('page.return.data_table.columns.reason', 'Alasan Retur'),
        accessorKey: 'reason',
        header: i18next.t(
            'page.return.data_table.columns.reason',
            'Alasan Retur',
        ),
        cell: ({ row }) => (
            <span className="block max-w-48 truncate text-xs text-muted-foreground">
                {row.original.reason || '-'}
            </span>
        ),
    },
    {
        id: i18next.t(
            'page.return.data_table.columns.created_at',
            'Tanggal & Waktu',
        ),
        accessorKey: 'created_at',
        header: i18next.t(
            'page.return.data_table.columns.created_at',
            'Tanggal & Waktu',
        ),
        cell: ({ row }) => formatDate(row.original.created_at),
    },
    {
        id: i18next.t('page.return.data_table.columns.actions', 'Aksi'),
        header: i18next.t('page.return.data_table.columns.actions', 'Aksi'),
        enableHiding: false,
        cell: ({ row }) => (
            <Button
                variant="ghost"
                size="icon"
                onClick={() => onDetailClick(row.original)}
                title={i18next.t(
                    'page.return.data_table.actions.view_detail',
                    'Lihat Detail Retur',
                )}
            >
                <Eye className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                <span className="sr-only">
                    {i18next.t('component.data_table.actions.detail', 'Detail')}
                </span>
            </Button>
        ),
    },
];
