import type { ColumnDef } from '@tanstack/react-table';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatRupiah } from '@/lib/format-money';

export interface ReturnDetail {
    id: number;
    product: { name: string };
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
    created_at: string;
    details: ReturnDetail[];
}

export const columns = ({
    onDetailClick,
}: {
    onDetailClick: (item: ReturnItem) => void;
}): ColumnDef<ReturnItem>[] => [
    {
        accessorKey: 'return_number',
        header: 'No. Retur',
        cell: ({ row }) => (
            <span className="font-semibold text-foreground font-mono">
                {row.original.return_number}
            </span>
        ),
    },
    {
        accessorKey: 'transaction.invoice_number',
        header: 'No. Invoice Struk',
        cell: ({ row }) => (
            <span className="font-mono text-xs">
                {row.original.transaction?.invoice_number || '-'}
            </span>
        ),
    },
    {
        accessorKey: 'user.name',
        header: 'Kasir / Petugas',
        cell: ({ row }) => row.original.user?.name || '-',
    },
    {
        accessorKey: 'total_refund_amount',
        header: 'Total Refund',
        cell: ({ row }) => (
            <span className="font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                {formatRupiah(row.original.total_refund_amount)}
            </span>
        ),
    },
    {
        accessorKey: 'reason',
        header: 'Alasan Retur',
        cell: ({ row }) => (
            <span className="truncate max-w-48 block text-muted-foreground text-xs">
                {row.original.reason || '-'}
            </span>
        ),
    },
    {
        accessorKey: 'created_at',
        header: 'Waktu Retur',
        cell: ({ row }) => (
            <span className="text-xs text-muted-foreground">
                {new Date(row.original.created_at).toLocaleString('id-ID')}
            </span>
        ),
    },
    {
        id: 'actions',
        header: 'Aksi',
        cell: ({ row }) => (
            <Button
                variant="ghost"
                size="icon"
                onClick={() => onDetailClick(row.original)}
                title="Lihat Detail Retur"
            >
                <Eye className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                <span className="sr-only">Detail</span>
            </Button>
        ),
    },
];
