import React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

export const columns = (
    onDetailClick: (item: ReturnItem) => void,
): ColumnDef<ReturnItem>[] => [
    {
        accessorKey: 'return_number',
        header: 'No. Retur',
        cell: ({ row }) => (
            <span className="font-semibold text-gray-900 dark:text-white">
                {row.original.return_number}
            </span>
        ),
    },
    {
        accessorKey: 'transaction.invoice_number',
        header: 'No. Struk',
        cell: ({ row }) => row.original.transaction?.invoice_number || '-',
    },
    {
        accessorKey: 'user.name',
        header: 'Kasir',
        cell: ({ row }) => row.original.user?.name || '-',
    },
    {
        accessorKey: 'total_refund_amount',
        header: 'Total Refund',
        cell: ({ row }) => (
            <span className="font-bold text-rose-600 dark:text-rose-400">
                Rp {Number(row.original.total_refund_amount).toLocaleString('id-ID')}
            </span>
        ),
    },
    {
        accessorKey: 'reason',
        header: 'Alasan Retur',
        cell: ({ row }) => row.original.reason || '-',
    },
    {
        accessorKey: 'created_at',
        header: 'Tanggal',
        cell: ({ row }) => new Date(row.original.created_at).toLocaleString('id-ID'),
    },
    {
        id: 'actions',
        header: 'Aksi',
        cell: ({ row }) => (
            <Button
                variant="outline"
                size="sm"
                onClick={() => onDetailClick(row.original)}
                className="flex items-center gap-1 text-xs"
            >
                <RotateCcw className="h-3.5 w-3.5" />
                Detail
            </Button>
        ),
    },
];
