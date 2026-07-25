import type { ColumnDef } from '@tanstack/react-table';
import i18next from 'i18next';
import { ServerSideDataTableHeader } from '@/components/server-side-data-table-header';
import { Badge } from '@/components/ui/badge';
import { formatRupiah } from '@/lib/format-money';
import dayjs from 'dayjs';
import type { ProfitWalletTransaction } from '@/support/models/profitWallet';

interface ColumnProps {
    onInvoiceClick: (invoiceNumber: string) => void;
    onSortChange: (orderBy: string | null, order: string | null) => void;
    orderBy?: string;
    order?: string;
}

export const columns = ({ onInvoiceClick, onSortChange, orderBy, order }: ColumnProps): ColumnDef<ProfitWalletTransaction>[] => [
    {
        accessorKey: 'created_at',
        header: () => i18next.t('page.profit_wallet.data_table.columns.created_at', 'Waktu Mutasi'),
        cell: ({ row }) => (
            <span className="whitespace-nowrap">
                {dayjs.unix(row.original.created_at).format('DD/MM/YYYY HH:mm')}
            </span>
        ),
    },
    {
        accessorKey: 'transaction_type',
        header: () => i18next.t('page.profit_wallet.data_table.columns.tx_type', 'Jenis Transaksi'),
        cell: ({ row }) => {
            const txType = row.original.transaction_type;
            let label: string = txType;
            if (txType === 'sales_profit') {
                label = i18next.t('page.profit_wallet.data_table.filters.tx_sales_profit', 'Keuntungan Penjualan');
            } else if (txType === 'disbursement') {
                label = i18next.t('page.profit_wallet.data_table.filters.tx_disbursement', 'Pencairan Profit');
            } else if (txType === 'capital_withdrawal') {
                label = i18next.t('page.profit_wallet.data_table.filters.tx_capital_withdrawal', 'Penarikan Modal');
            }
            return <span className="whitespace-nowrap font-medium">{label}</span>;
        },
    },
    {
        accessorKey: 'type',
        header: () => i18next.t('page.profit_wallet.data_table.columns.direction', 'Arah Aliran'),
        cell: ({ row }) => {
            const type = row.original.type;
            if (type === 'in') {
                return (
                    <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border-none font-normal">
                        {i18next.t('page.profit_wallet.data_table.filters.direction_in', 'Uang Masuk')}
                    </Badge>
                );
            }
            return (
                <Badge className="bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400 border-none font-normal">
                    {i18next.t('page.profit_wallet.data_table.filters.direction_out', 'Uang Keluar')}
                </Badge>
            );
        },
    },
    {
        accessorKey: 'amount',
        header: () => i18next.t('page.profit_wallet.data_table.columns.amount', 'Jumlah'),
        cell: ({ row }) => {
            const val = row.original.amount;
            const type = row.original.type;
            const sign = type === 'in' ? '+' : '-';
            const colorClass = type === 'in' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400';
            return <span className={`font-semibold ${colorClass}`}>{sign} {formatRupiah(val)}</span>;
        },
    },
    {
        accessorKey: 'balance_before',
        header: () => i18next.t('page.profit_wallet.data_table.columns.balance_before', 'Saldo Awal'),
        cell: ({ row }) => formatRupiah(row.original.balance_before),
    },
    {
        accessorKey: 'balance_after',
        header: () => i18next.t('page.profit_wallet.data_table.columns.balance_after', 'Saldo Akhir'),
        cell: ({ row }) => <span className="font-medium text-foreground">{formatRupiah(row.original.balance_after)}</span>,
    },
    {
        accessorKey: 'notes',
        header: () => i18next.t('page.profit_wallet.data_table.columns.notes', 'Catatan'),
        cell: ({ row }) => <span className="text-muted-foreground line-clamp-1">{row.original.notes || '-'}</span>,
    },
    {
        accessorKey: 'reference',
        header: () => i18next.t('page.profit_wallet.data_table.columns.reference', 'Rujukan'),
        cell: ({ row }) => {
            const inv = row.original.invoice_number;
            if (!inv || inv === '-') return <span>-</span>;
            return (
                <button
                    onClick={() => onInvoiceClick(inv)}
                    className="text-primary hover:underline font-medium text-left cursor-pointer"
                >
                    {inv}
                </button>
            );
        },
    },
];
