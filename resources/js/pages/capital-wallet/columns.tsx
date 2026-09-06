import type { ColumnDef } from '@tanstack/react-table';
import i18next from 'i18next';
import { ServerSideDataTableHeader } from '@/components/server-side-data-table-header';
import { Badge } from '@/components/ui/badge';
import { formatRupiah } from '@/lib/format-money';
import { formatDate } from '@/lib/format-date';
import type { CapitalWalletTransaction } from '@/support/models/capitalWallet';

interface ColumnProps {
    onInvoiceClick: (invoiceNumber: string) => void;
    onSortChange: (orderBy: string | null, order: string | null) => void;
    orderBy?: string;
    order?: string;
}

export const columns = ({
    onInvoiceClick,
    onSortChange,
    orderBy,
    order,
}: ColumnProps): ColumnDef<CapitalWalletTransaction>[] => [
    {
        accessorKey: 'created_at',
        header: () =>
            i18next.t(
                'page.capital_wallet.data_table.columns.created_at',
                'Waktu Mutasi',
            ),
        cell: ({ row }) => (
            <span className="whitespace-nowrap">
                {formatDate(row.original.created_at)}
            </span>
        ),
    },
    {
        accessorKey: 'transaction_type',
        header: () =>
            i18next.t(
                'page.capital_wallet.data_table.columns.tx_type',
                'Jenis Transaksi',
            ),
        cell: ({ row }) => {
            const txType = row.original.transaction_type;
            let label: string = txType;
            if (txType === 'capital_injection') {
                label = i18next.t(
                    'page.capital_wallet.data_table.filters.tx_capital_injection',
                    'Suntik Modal',
                );
            } else if (txType === 'capital_drawdown') {
                label = i18next.t(
                    'page.capital_wallet.data_table.filters.tx_capital_drawdown',
                    'Tarik Modal',
                );
            } else if (txType === 'product_purchase') {
                label = i18next.t(
                    'page.capital_wallet.data_table.filters.tx_product_purchase',
                    'Belanja Stok',
                );
            } else if (
                txType === 'sales_capital_recovery' ||
                txType === 'sales_recovery'
            ) {
                label = i18next.t(
                    'page.capital_wallet.data_table.filters.tx_sales_capital_recovery',
                    'Pemulihan Modal',
                );
            } else if (txType === 'reinvestment') {
                label = i18next.t(
                    'page.capital_wallet.data_table.filters.tx_reinvestment',
                    'Reinvestasi',
                );
            } else if (txType === 'sales_return_deduction') {
                label = i18next.t(
                    'page.capital_wallet.data_table.filters.tx_sales_return_deduction',
                    'Potongan Retur',
                );
            }
            return (
                <span className="font-medium whitespace-nowrap">{label}</span>
            );
        },
    },
    {
        accessorKey: 'type',
        header: () =>
            i18next.t(
                'page.capital_wallet.data_table.columns.direction',
                'Arah Aliran',
            ),
        cell: ({ row }) => {
            const type = row.original.type;
            if (type === 'in') {
                return (
                    <Badge className="border-none bg-emerald-100 font-normal text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400">
                        {i18next.t(
                            'page.capital_wallet.data_table.filters.direction_in',
                            'Uang Masuk',
                        )}
                    </Badge>
                );
            }
            return (
                <Badge className="border-none bg-rose-100 font-normal text-rose-800 dark:bg-rose-950/40 dark:text-rose-400">
                    {i18next.t(
                        'page.capital_wallet.data_table.filters.direction_out',
                        'Uang Keluar',
                    )}
                </Badge>
            );
        },
    },
    {
        accessorKey: 'amount',
        header: () =>
            i18next.t(
                'page.capital_wallet.data_table.columns.amount',
                'Jumlah',
            ),
        cell: ({ row }) => {
            const val = row.original.amount;
            const type = row.original.type;
            const sign = type === 'in' ? '+' : '-';
            const colorClass =
                type === 'in'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400';
            return (
                <span className={`font-semibold ${colorClass}`}>
                    {sign} {formatRupiah(val)}
                </span>
            );
        },
    },
    {
        accessorKey: 'balance_before',
        header: () =>
            i18next.t(
                'page.capital_wallet.data_table.columns.balance_before',
                'Saldo Awal',
            ),
        cell: ({ row }) => formatRupiah(row.original.balance_before),
    },
    {
        accessorKey: 'balance_after',
        header: () =>
            i18next.t(
                'page.capital_wallet.data_table.columns.balance_after',
                'Saldo Akhir',
            ),
        cell: ({ row }) => (
            <span className="font-medium text-foreground">
                {formatRupiah(row.original.balance_after)}
            </span>
        ),
    },
    {
        accessorKey: 'notes',
        header: () =>
            i18next.t(
                'page.capital_wallet.data_table.columns.notes',
                'Catatan',
            ),
        cell: ({ row }) => (
            <span className="line-clamp-1 text-muted-foreground">
                {row.original.notes || '-'}
            </span>
        ),
    },
    {
        accessorKey: 'reference',
        header: () =>
            i18next.t(
                'page.capital_wallet.data_table.columns.reference',
                'Rujukan',
            ),
        cell: ({ row }) => {
            const inv = row.original.invoice_number;
            if (!inv || inv === '-') return <span>-</span>;
            return (
                <button
                    onClick={() => onInvoiceClick(inv)}
                    className="cursor-pointer text-left font-medium text-primary hover:underline"
                >
                    {inv}
                </button>
            );
        },
    },
];
