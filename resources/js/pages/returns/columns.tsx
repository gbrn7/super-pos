import type { ColumnDef } from '@tanstack/react-table';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatRupiah } from '@/lib/format-money';
import i18next from 'i18next';

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
    transaction: { invoice_number: string };
    user: { name: string };
    total_refund_amount: number;
    reason: string;
    created_at: number;
    details: ReturnDetail[];
}

export const columns = ({
    onDetailClick,
}: {
    onDetailClick: (item: ReturnItem) => void;
}): ColumnDef<ReturnItem>[] => [
    {
        accessorKey: 'return_number',
        header: i18next.t('page.return.data_table.columns.return_number', 'No. Retur'),
        cell: ({ row }) => (
            <span className="font-semibold text-foreground font-mono">
                {row.original.return_number}
            </span>
        ),
    },
    {
        accessorKey: 'transaction.invoice_number',
        header: i18next.t('page.return.data_table.columns.invoice_number', 'No. Invoice Struk'),
        cell: ({ row }) => (
            <span className="font-mono text-xs">
                {row.original.transaction?.invoice_number || '-'}
            </span>
        ),
    },
    {
        accessorKey: 'user.name',
        header: i18next.t('page.return.data_table.columns.user_name', 'Kasir / Petugas'),
        cell: ({ row }) => row.original.user?.name || '-',
    },
    {
        accessorKey: 'total_refund_amount',
        header: i18next.t('page.return.data_table.columns.total_refund', 'Total Refund'),
        cell: ({ row }) => (
            <span className="font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                {formatRupiah(row.original.total_refund_amount)}
            </span>
        ),
    },
    {
        accessorKey: 'reason',
        header: i18next.t('page.return.data_table.columns.reason', 'Alasan Retur'),
        cell: ({ row }) => (
            <span className="truncate max-w-48 block text-muted-foreground text-xs">
                {row.original.reason || '-'}
            </span>
        ),
    },
    {
        accessorKey: 'created_at',
        header: i18next.t('page.return.data_table.columns.created_at', 'Tanggal & Waktu'),
        cell: ({ row }) => {
            const dateVal = row.original.created_at;
            if (!dateVal) return '-';
            const date = new Date(dateVal * 1000);
            return (
                <span className="text-xs text-muted-foreground">
                    {date.toLocaleString(i18next.language === 'en' ? 'en-US' : 'id-ID', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                    })}
                </span>
            );
        },
    },
    {
        id: 'actions',
        header: i18next.t('page.return.data_table.columns.actions', 'Aksi'),
        cell: ({ row }) => (
            <Button
                variant="ghost"
                size="icon"
                onClick={() => onDetailClick(row.original)}
                title={i18next.t('page.return.data_table.actions.view_detail', 'Lihat Detail Retur')}
            >
                <Eye className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                <span className="sr-only">{i18next.t('component.data_table.actions.detail', 'Detail')}</span>
            </Button>
        ),
    },
];
