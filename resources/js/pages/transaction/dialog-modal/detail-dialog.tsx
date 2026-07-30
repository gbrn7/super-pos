import dayjs from 'dayjs';
import { CreditCard, Calendar, User, Printer, ShoppingBag, Package, Hash, Wallet, TrendingUp, Landmark, PercentCircle, RotateCcw } from 'lucide-react';
import { useMemo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pie, PieChart, Cell, Label } from 'recharts';
import ReceiptCard from '@/components/receipt-card';
import type { StoreSetting } from '@/components/receipt-modal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from '@/components/ui/chart';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import axiosInstance from '@/lib/axios';
import { formatRupiah } from '@/lib/format-money';
import { handleApiError } from '@/lib/utils';
import { show as apiShowTransaction } from '@/routes/apiTransactions';
import type { ResponseApi } from '@/support/interfaces/response/Response';
import type { Transaction } from '@/support/models/transaction';

const BREAKDOWN_COLORS = {
    profit: 'hsl(152, 57%, 48%)',
    cost: 'hsl(217, 71%, 53%)',
    discount: 'hsl(346, 77%, 55%)',
} as const;

interface DetailDialogProps {
    isOpen: boolean;
    transaction: Transaction | null;
    onOpenChange: (open: boolean) => void;
    storeSetting?: StoreSetting | null;
}

export function DetailDialog({
    isOpen,
    transaction,
    onOpenChange,
    storeSetting,
}: DetailDialogProps) {
    const { t } = useTranslation();
    const [detailData, setDetailData] = useState<Transaction | null>(null);
    const [loading, setLoading] = useState(false);
    const [prevTransactionId, setPrevTransactionId] = useState<number | null>(
        null,
    );

    const finalStoreSetting = storeSetting || {
        name: 'Toko Maju Jaya',
        address: 'Jl. Raya Bekasi KM.18 RT.004/0009, Jakarta Timur, 13250',
        phone: '081234567890',
        email: 'contact@majujaya.com',
        receipt_footer: null,
    };

    if (isOpen && transaction?.id && transaction.id !== prevTransactionId) {
        setPrevTransactionId(transaction.id);
        setLoading(true);
        setDetailData(null);
    }

    if (!isOpen && prevTransactionId !== null) {
        setPrevTransactionId(null);
        setLoading(false);
        setDetailData(null);
    }

    useEffect(() => {
        if (isOpen && transaction?.id) {
            let isMounted = true;
            const apiUrl = apiShowTransaction(transaction.id).url;
            axiosInstance
                .get<ResponseApi<Transaction>>(apiUrl)
                .then((res) => {
                    if (isMounted && res.data.success && res.data.data) {
                        setDetailData(res.data.data);
                    }
                })
                .catch((err) => {
                    if (isMounted) {
                        handleApiError(err);
                    }
                })
                .finally(() => {
                    if (isMounted) {
                        setLoading(false);
                    }
                });

            return () => {
                isMounted = false;
            };
        }
    }, [isOpen, transaction?.id]);

    if (!transaction) {
        return null;
    }

    const currentTransaction = detailData || transaction;
    const discountAmount = Number(currentTransaction.discount_amount || 0);
    const details = currentTransaction.details ?? [];
    const netSubtotal = details.length > 0
        ? details.reduce(
            (sum, item) =>
                sum +
                (item.subtotal ??
                    (Number(item.price) - Number(item.discount || 0)) *
                    item.quantity),
            0,
        )
        : Number(currentTransaction.total_amount) + discountAmount;

    const totalItems = details.length;
    const totalQuantity = details.reduce((sum, item) => sum + item.quantity, 0);
    const totalItemDiscount = details.reduce(
        (sum, item) => sum + Number(item.discount || 0) * item.quantity,
        0,
    );

    const totalCost = details.reduce(
        (sum, item) => sum + Number(item.cost_price || 0) * item.quantity,
        0,
    );
    const totalAllDiscount = totalItemDiscount + discountAmount;
    const totalProfit = netSubtotal - totalCost - discountAmount;
    const totalRefund = useMemo(() => {
        if (!currentTransaction.returns) return 0;
        return currentTransaction.returns.reduce(
            (sum: number, ret: any) => sum + Number(ret.total_refund_amount || 0),
            0,
        );
    }, [currentTransaction.returns]);
    const totalRefundQuantity = useMemo(() => {
        if (!currentTransaction.returns) return 0;
        return currentTransaction.returns.reduce(
            (sum: number, ret: any) => {
                const detailsSum = (ret.details || []).reduce(
                    (dSum: number, d: any) => dSum + Number(d.quantity || 0),
                    0
                );
                return sum + detailsSum;
            },
            0,
        );
    }, [currentTransaction.returns]);
    const profitMarginPercentage = useMemo(() => {
        const totalAmount = Number(currentTransaction.total_amount || 0);
        if (totalAmount <= 0) return 0;
        return (totalProfit / totalAmount) * 100;
    }, [totalProfit, currentTransaction.total_amount]);

    const pieData = useMemo(() => {
        if (!details.length) return [];
        const grossTotal = totalCost + Math.max(totalProfit, 0) + totalAllDiscount;
        if (grossTotal <= 0) return [];
        const data: { name: string; value: number; fill: string }[] = [
            {
                name: t('page.transaction.dialog_modal.detail_dialog.profit_label', 'Keuntungan'),
                value: Math.max(totalProfit, 0),
                fill: BREAKDOWN_COLORS.profit,
            },
            {
                name: t('page.transaction.dialog_modal.detail_dialog.cost_label', 'Biaya Modal'),
                value: totalCost,
                fill: BREAKDOWN_COLORS.cost,
            },
        ];
        if (totalAllDiscount > 0) {
            data.push({
                name: t('page.transaction.dialog_modal.detail_dialog.discount_label', 'Diskon'),
                value: totalAllDiscount,
                fill: BREAKDOWN_COLORS.discount,
            });
        }
        return data;
    }, [details, totalCost, totalProfit, totalAllDiscount, discountAmount, t]);

    const chartConfig: ChartConfig = {
        profit: {
            label: t('page.transaction.dialog_modal.detail_dialog.profit_label', 'Keuntungan'),
            color: BREAKDOWN_COLORS.profit,
        },
        cost: {
            label: t('page.transaction.dialog_modal.detail_dialog.cost_label', 'Biaya Modal'),
            color: BREAKDOWN_COLORS.cost,
        },
        discount: {
            label: t('page.transaction.dialog_modal.detail_dialog.discount_label', 'Diskon'),
            color: BREAKDOWN_COLORS.discount,
        },
    };

    const handlePrint = () => {
        window.print();
    };

    const formattedDate = currentTransaction.created_at
        ? typeof currentTransaction.created_at === 'number'
            ? dayjs
                .unix(currentTransaction.created_at)
                .format('DD/MM/YYYY, HH:mm')
            : dayjs(currentTransaction.created_at).format('DD/MM/YYYY, HH:mm')
        : '-';

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[80vh] overflow-y-auto p-6 sm:max-w-4xl">
                <div className="space-y-6 print:hidden">
                    <DialogHeader className="border-b pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                                    <ShoppingBag className="h-5 w-5 text-primary" />
                                    {t(
                                        'page.transaction.dialog_modal.detail_dialog.dialog_title',
                                        'Detail Transaksi',
                                    )}
                                </DialogTitle>
                                <p className="mt-1 font-mono text-sm text-muted-foreground">
                                    #{currentTransaction.invoice_number}
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handlePrint}
                                className="mr-8 gap-1.5 print:hidden"
                                disabled={loading}
                            >
                                <Printer className="h-4 w-4" />
                                {t(
                                    'page.transaction.dialog_modal.detail_dialog.print_btn',
                                    'Cetak Nota',
                                )}
                            </Button>
                        </div>
                    </DialogHeader>

                    <Tabs defaultValue="details" className="w-full">
                        <TabsList className="mb-4">
                            <TabsTrigger value="details">
                                {t(
                                    'page.transaction.dialog_modal.detail_dialog.tab_details',
                                    'Rincian Transaksi',
                                )}
                            </TabsTrigger>
                            <TabsTrigger value="receipt">
                                {t(
                                    'page.transaction.dialog_modal.detail_dialog.tab_receipt',
                                    'Struk / Nota',
                                )}
                            </TabsTrigger>
                            <TabsTrigger value="returns">
                                {t(
                                    'page.transaction.dialog_modal.detail_dialog.tab_returns',
                                    'Barang Diretur',
                                )}
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent
                            value="details"
                            className="space-y-6 border-none p-0 pt-4 outline-none"
                        >
                            {/* Section: Informasi Umum */}
                            <div className="space-y-3">
                                <h4 className="text-sm font-semibold">
                                    {t(
                                        'page.transaction.dialog_modal.detail_dialog.general_info',
                                        'Informasi Umum',
                                    )}
                                </h4>
                                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                                    <div className="rounded-lg border bg-card p-3 shadow-xs">
                                        <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                                            <User className="h-3.5 w-3.5" />
                                            {t(
                                                'page.transaction.dialog_modal.detail_dialog.cashier_label',
                                                'Kasir / Petugas',
                                            )}
                                        </div>
                                        {loading ? (
                                            <Skeleton className="mt-1 h-5 w-24" />
                                        ) : (
                                            <p className="text-sm font-semibold">
                                                {currentTransaction.user_name ||
                                                    '-'}
                                            </p>
                                        )}
                                    </div>
                                    <div className="rounded-lg border bg-card p-3 shadow-xs">
                                        <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                                            <CreditCard className="h-3.5 w-3.5" />
                                            {t(
                                                'page.transaction.dialog_modal.detail_dialog.payment_method_label',
                                                'Metode Pembayaran',
                                            )}
                                        </div>
                                        {loading ? (
                                            <Skeleton className="mt-1 h-5 w-20" />
                                        ) : (
                                            <p className="text-sm font-semibold">
                                                {currentTransaction.payment_method_name
                                                    ? t(
                                                        `payment_method_name.${currentTransaction.payment_method_name}`,
                                                        currentTransaction.payment_method_name,
                                                    )
                                                    : '-'}
                                            </p>
                                        )}
                                    </div>
                                    <div className="rounded-lg border bg-card p-3 shadow-xs">
                                        <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                                            <Calendar className="h-3.5 w-3.5" />
                                            {t(
                                                'page.transaction.dialog_modal.detail_dialog.date_label',
                                                'Waktu Transaksi',
                                            )}
                                        </div>
                                        {loading ? (
                                            <Skeleton className="mt-1 h-5 w-28" />
                                        ) : (
                                            <p className="text-xs font-medium text-foreground">
                                                {formattedDate}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Section: Analisis & Ringkasan Keuangan */}
                            <div className="space-y-3">
                                <h4 className="text-sm font-semibold">
                                    {t(
                                        'page.transaction.dialog_modal.detail_dialog.analysis_summary',
                                        'Analisis & Ringkasan Keuangan',
                                    )}
                                </h4>
                                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                                    {/* 1. Total Transaksi */}
                                    <Card className="gap-2 py-3">
                                        <CardContent className="flex items-center gap-3 px-4">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                                                <Wallet className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="truncate text-xs text-muted-foreground">
                                                    {t('page.transaction.dialog_modal.detail_dialog.total_amount_card', 'Total Transaksi')}
                                                </p>
                                                {loading ? (
                                                    <Skeleton className="mt-1 h-5 w-20" />
                                                ) : (
                                                    <p className="text-base font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                                                        {formatRupiah(currentTransaction.total_amount)}
                                                    </p>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* 2. Total Modal */}
                                    <Card className="gap-2 py-3">
                                        <CardContent className="flex items-center gap-3 px-4">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
                                                <Landmark className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="truncate text-xs text-muted-foreground">
                                                    {t('page.transaction.dialog_modal.detail_dialog.total_cost_card', 'Total Modal')}
                                                </p>
                                                {loading ? (
                                                    <Skeleton className="mt-1 h-5 w-16" />
                                                ) : (
                                                    <p className="text-base font-bold tabular-nums text-blue-600 dark:text-blue-400">
                                                        {formatRupiah(totalCost)}
                                                    </p>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* 3. Margin / Keuntungan Bersih */}
                                    <Card className="gap-2 py-3">
                                        <CardContent className="flex items-center gap-3 px-4">
                                            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${totalProfit >= 0 ? 'bg-teal-500/10' : 'bg-red-500/10'}`}>
                                                <TrendingUp className={`h-4.5 w-4.5 ${totalProfit >= 0 ? 'text-teal-600 dark:text-teal-400' : 'text-red-600 dark:text-red-400'}`} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="truncate text-xs text-muted-foreground">
                                                    {t('page.transaction.dialog_modal.detail_dialog.total_profit_card', 'Margin / Keuntungan')}
                                                </p>
                                                {loading ? (
                                                    <Skeleton className="mt-1 h-5 w-16" />
                                                ) : (
                                                    <p className={`text-base font-bold tabular-nums ${totalProfit >= 0 ? 'text-teal-600 dark:text-teal-400' : 'text-red-600 dark:text-red-400'}`}>
                                                        {totalProfit > 0 ? `+${formatRupiah(totalProfit)}` : totalProfit < 0 ? `-${formatRupiah(Math.abs(totalProfit))}` : formatRupiah(0)}
                                                    </p>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Persentase Margin Keuntungan */}
                                    <Card className="gap-2 py-3">
                                        <CardContent className="flex items-center gap-3 px-4">
                                            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${profitMarginPercentage >= 0 ? 'bg-teal-500/10' : 'bg-red-500/10'}`}>
                                                <TrendingUp className={`h-4.5 w-4.5 ${profitMarginPercentage >= 0 ? 'text-teal-600 dark:text-teal-400' : 'text-red-600 dark:text-red-400'}`} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="truncate text-xs text-muted-foreground">
                                                    {t('page.transaction.dialog_modal.detail_dialog.profit_margin_percentage_card', 'Persentase Margin')}
                                                </p>
                                                {loading ? (
                                                    <Skeleton className="mt-1 h-5 w-16" />
                                                ) : (
                                                    <p className={`text-base font-bold tabular-nums ${profitMarginPercentage >= 0 ? 'text-teal-600 dark:text-teal-400' : 'text-red-600 dark:text-red-400'}`}>
                                                        {profitMarginPercentage > 0 ? `+${profitMarginPercentage.toFixed(1)}%` : `${profitMarginPercentage.toFixed(1)}%`}
                                                    </p>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* 5. Total Produk */}
                                    <Card className="gap-2 py-3">
                                        <CardContent className="flex items-center gap-3 px-4">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                                <Package className="h-4.5 w-4.5 text-primary" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="truncate text-xs text-muted-foreground">
                                                    {t('page.transaction.dialog_modal.detail_dialog.total_items', 'Total Produk')}
                                                </p>
                                                {loading ? (
                                                    <Skeleton className="mt-1 h-5 w-10" />
                                                ) : (
                                                    <p className="text-lg font-bold tabular-nums text-primary">
                                                        {totalItems}
                                                    </p>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* 6. Total Kuantitas */}
                                    <Card className="gap-2 py-3">
                                        <CardContent className="flex items-center gap-3 px-4">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
                                                <Hash className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="truncate text-xs text-muted-foreground">
                                                    {t('page.transaction.dialog_modal.detail_dialog.total_quantity', 'Total Kuantitas')}
                                                </p>
                                                {loading ? (
                                                    <Skeleton className="mt-1 h-5 w-10" />
                                                ) : (
                                                    <p className="text-lg font-bold tabular-nums text-blue-600 dark:text-blue-400">
                                                        {totalQuantity}
                                                    </p>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* 4. Total Diskon */}
                                    <Card className="gap-2 py-3">
                                        <CardContent className="flex items-center gap-3 px-4">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-500/10">
                                                <PercentCircle className="h-4.5 w-4.5 text-rose-600 dark:text-rose-400" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="truncate text-xs text-muted-foreground">
                                                    {t('page.transaction.dialog_modal.detail_dialog.total_discount_card', 'Total Diskon')}
                                                </p>
                                                {loading ? (
                                                    <Skeleton className="mt-1 h-5 w-16" />
                                                ) : (
                                                    <p className="text-base font-bold tabular-nums text-rose-600 dark:text-rose-400">
                                                        {formatRupiah(totalAllDiscount)}
                                                    </p>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Total Retur */}
                                    <Card className="gap-2 py-3">
                                        <CardContent className="flex items-center gap-3 px-4">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-500/10">
                                                <RotateCcw className="h-4.5 w-4.5 text-orange-600 dark:text-orange-400" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="truncate text-xs text-muted-foreground">
                                                    {t('page.transaction.dialog_modal.detail_dialog.total_refund_card', 'Total Nominal Retur')}
                                                </p>
                                                {loading ? (
                                                    <Skeleton className="mt-1 h-5 w-16" />
                                                ) : (
                                                    <p className="text-base font-bold tabular-nums text-orange-600 dark:text-orange-400">
                                                        {formatRupiah(totalRefund)}
                                                    </p>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Total Kuantitas Retur */}
                                    <Card className="gap-2 py-3">
                                        <CardContent className="flex items-center gap-3 px-4">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-500/10">
                                                <Hash className="h-4.5 w-4.5 text-orange-600 dark:text-orange-400" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="truncate text-xs text-muted-foreground">
                                                    {t('page.transaction.dialog_modal.detail_dialog.total_refund_qty_card', 'Total Barang Diretur')}
                                                </p>
                                                {loading ? (
                                                    <Skeleton className="mt-1 h-5 w-10" />
                                                ) : (
                                                    <p className="text-lg font-bold tabular-nums text-orange-600 dark:text-orange-400">
                                                        {totalRefundQuantity}
                                                    </p>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>

                            {/* Pie Chart - Cost / Profit / Discount Breakdown */}
                            {!loading && pieData.length > 0 && (
                                <div className="rounded-lg border bg-card p-4 shadow-xs">
                                    <h4 className="mb-3 text-sm text-muted-foreground">
                                        {t(
                                            'page.transaction.dialog_modal.detail_dialog.chart_title',
                                            'Komposisi Transaksi',
                                        )}
                                    </h4>
                                    <div className="flex flex-col items-center gap-4 md:flex-row">
                                        <ChartContainer
                                            config={chartConfig}
                                            className="aspect-square h-50 w-full max-w-50 shrink-0"
                                        >
                                            <PieChart>
                                                <ChartTooltip
                                                    content={
                                                        <ChartTooltipContent
                                                            formatter={(value) => formatRupiah(Number(value))}
                                                            hideLabel
                                                        />
                                                    }
                                                />
                                                <Pie
                                                    data={pieData}
                                                    dataKey="value"
                                                    nameKey="name"
                                                    innerRadius={50}
                                                    outerRadius={80}
                                                    strokeWidth={2}
                                                    stroke="hsl(var(--background))"
                                                >
                                                    {pieData.map((entry, index) => (
                                                        <Cell
                                                            key={`cell-${index}`}
                                                            fill={entry.fill}
                                                        />
                                                    ))}
                                                    <Label
                                                        content={({ viewBox }) => {
                                                            if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                                                                return (
                                                                    <text
                                                                        x={viewBox.cx}
                                                                        y={viewBox.cy}
                                                                        textAnchor="middle"
                                                                        dominantBaseline="middle"
                                                                    >
                                                                        <tspan
                                                                            x={viewBox.cx}
                                                                            y={(viewBox.cy || 0) - 8}
                                                                            className="fill-foreground text-sm font-bold"
                                                                        >
                                                                            {formatRupiah(netSubtotal)}
                                                                        </tspan>
                                                                        <tspan
                                                                            x={viewBox.cx}
                                                                            y={(viewBox.cy || 0) + 10}
                                                                            className="fill-muted-foreground text-xs"
                                                                        >
                                                                            {t('page.transaction.dialog_modal.detail_dialog.chart_center_label', 'Total')}
                                                                        </tspan>
                                                                    </text>
                                                                );
                                                            }
                                                        }}
                                                    />
                                                </Pie>
                                            </PieChart>
                                        </ChartContainer>
                                        <div className="flex-1 space-y-2 overflow-hidden">
                                            {pieData.map((item, index) => {
                                                const grossTotal = totalCost + Math.max(totalProfit, 0) + totalAllDiscount;
                                                const percentage = grossTotal > 0
                                                    ? ((item.value / grossTotal) * 100).toFixed(1)
                                                    : '0';
                                                return (
                                                    <div
                                                        key={index}
                                                        className="flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted/50"
                                                    >
                                                        <div
                                                            className="h-3 w-3 shrink-0 rounded-full"
                                                            style={{ backgroundColor: item.fill }}
                                                        />
                                                        <span className="min-w-0 flex-1 font-medium">
                                                            {item.name}
                                                        </span>
                                                        <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 font-mono text-xs tabular-nums">
                                                            {percentage}%
                                                        </span>
                                                        <span className="shrink-0 font-mono text-xs font-semibold tabular-nums">
                                                            {formatRupiah(item.value)}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Transaction Items Table */}
                            <div>
                                <h4 className="mb-3 text-sm font-semibold">
                                    {t(
                                        'page.transaction.dialog_modal.detail_dialog.items_title',
                                        'Rincian Produk',
                                    )}
                                </h4>
                                <div className="w-full overflow-x-auto overflow-y-auto max-h-80 rounded-md border">
                                    <Table>
                                        <TableHeader className="sticky top-0 z-10 bg-muted">
                                            <TableRow>
                                                <TableHead className="min-w-40">
                                                    {t('page.transaction.dialog_modal.detail_dialog.product_header', 'Produk')}
                                                </TableHead>
                                                <TableHead className="min-w-17.5 text-center">
                                                    {t('page.transaction.dialog_modal.detail_dialog.unit_header', 'Satuan')}
                                                </TableHead>
                                                <TableHead className="min-w-27.5 text-right">
                                                    {t('page.transaction.dialog_modal.detail_dialog.price_header', 'Harga')}
                                                </TableHead>
                                                <TableHead className="min-w-27.5 text-right">
                                                    {t('page.transaction.dialog_modal.detail_dialog.discount_header', 'Diskon / Item')}
                                                </TableHead>
                                                <TableHead className="min-w-15 text-center">
                                                    {t('page.transaction.dialog_modal.detail_dialog.qty_header', 'Jumlah')}
                                                </TableHead>
                                                <TableHead className="min-w-30 text-right">
                                                    {t('page.transaction.dialog_modal.detail_dialog.subtotal_header', 'Subtotal')}
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {loading ? (
                                                Array.from({ length: 3 }).map(
                                                    (_, index) => (
                                                        <TableRow key={index}>
                                                            <TableCell>
                                                                <Skeleton className="h-5 w-full" />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Skeleton className="mx-auto h-5 w-12" />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Skeleton className="ml-auto h-5 w-16" />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Skeleton className="ml-auto h-5 w-14" />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Skeleton className="mx-auto h-5 w-8" />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Skeleton className="ml-auto h-5 w-20" />
                                                            </TableCell>
                                                        </TableRow>
                                                    ),
                                                )
                                            ) : currentTransaction.details &&
                                                currentTransaction.details
                                                    .length > 0 ? (
                                                currentTransaction.details.map(
                                                    (item) => (
                                                        <TableRow key={item.id}>
                                                            <TableCell className="font-medium">
                                                                {item.product_name || t('page.transaction.dialog_modal.detail_dialog.default_product_name', 'Produk #{{id}}', { id: item.product_id })}
                                                            </TableCell>
                                                            <TableCell className="text-center text-xs text-muted-foreground">
                                                                {item.unit_name || '-'}
                                                            </TableCell>
                                                            <TableCell className="text-right text-xs">
                                                                {formatRupiah(item.price)}
                                                            </TableCell>
                                                            <TableCell className="text-right text-xs">
                                                                {item.discount && Number(item.discount) > 0 ? (
                                                                    <span className="font-semibold text-rose-600 dark:text-rose-400">
                                                                        -{formatRupiah(Number(item.discount))}
                                                                    </span>
                                                                ) : (
                                                                    '-'
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="text-center font-semibold">
                                                                {item.quantity}
                                                            </TableCell>
                                                            <TableCell className="text-right font-medium">
                                                                {formatRupiah(
                                                                    item.subtotal ??
                                                                    (Number(item.price) - Number(item.discount || 0)) *
                                                                    item.quantity,
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    ),
                                                )
                                            ) : (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={6}
                                                        className="h-20 text-center text-muted-foreground"
                                                    >
                                                        {t('page.transaction.dialog_modal.detail_dialog.empty_items', 'Detail produk tidak tersedia.')}
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>

                            {/* Financial Summary Breakdown */}
                            <div className="space-y-2 rounded-lg border bg-muted/30 p-4">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">
                                        {t('page.transaction.dialog_modal.detail_dialog.subtotal_header', 'Subtotal')}
                                    </span>
                                    {loading ? (
                                        <Skeleton className="h-5 w-20" />
                                    ) : (
                                        <span className="font-medium">
                                            {formatRupiah(netSubtotal)}
                                        </span>
                                    )}
                                </div>
                                {discountAmount > 0 && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium text-muted-foreground">
                                            {t('page.transaction.dialog_modal.detail_dialog.transaction_discount', 'Diskon Transaksi')}
                                        </span>
                                        {loading ? (
                                            <Skeleton className="h-5 w-20" />
                                        ) : (
                                            <span className="font-bold text-rose-600 dark:text-rose-400">
                                                - {formatRupiah(discountAmount)}
                                            </span>
                                        )}
                                    </div>
                                )}
                                <div className="flex items-center justify-between border-t pt-2 text-sm">
                                    <span className="font-medium text-muted-foreground">
                                        {t('page.transaction.dialog_modal.detail_dialog.total_transaction', 'Total Transaksi')}
                                    </span>
                                    {loading ? (
                                        <Skeleton className="h-6 w-24" />
                                    ) : (
                                        <span className="text-lg font-bold text-primary">
                                            {formatRupiah(
                                                currentTransaction.total_amount,
                                            )}
                                        </span>
                                    )}
                                </div>
                                {totalRefund > 0 && (
                                    <div className="flex items-center justify-between text-sm text-orange-600 dark:text-orange-400">
                                        <span className="font-medium">
                                            {t('page.transaction.dialog_modal.detail_dialog.total_refund', 'Total Nominal Retur')}
                                        </span>
                                        {loading ? (
                                            <Skeleton className="h-5 w-20" />
                                        ) : (
                                            <span className="font-bold">
                                                - {formatRupiah(totalRefund)}
                                            </span>
                                        )}
                                    </div>
                                )}
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">
                                        {t('page.transaction.dialog_modal.detail_dialog.payment_amount', 'Nominal Pembayaran')}
                                    </span>
                                    {loading ? (
                                        <Skeleton className="h-5 w-20" />
                                    ) : (
                                        <span className="font-medium">
                                            {formatRupiah(
                                                currentTransaction.payment_amount,
                                            )}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center justify-between border-t pt-2 text-sm">
                                    <span className="text-muted-foreground">
                                        {t('page.transaction.dialog_modal.detail_dialog.change_amount', 'Kembalian')}
                                    </span>
                                    {loading ? (
                                        <Skeleton className="h-5 w-20" />
                                    ) : (
                                        <span className="font-semibold">
                                            {formatRupiah(
                                                currentTransaction.change_amount,
                                            )}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </TabsContent>
                        <TabsContent
                            value="receipt"
                            className="border-none p-0 pt-4 outline-none"
                        >
                            <div className="flex justify-center rounded-lg bg-muted/20 py-4">
                                <ReceiptCard
                                    storeName={finalStoreSetting.name}
                                    storeAddress={finalStoreSetting.address}
                                    storePhone={finalStoreSetting.phone}
                                    storeEmail={finalStoreSetting.email}
                                    storeReceiptFooter={
                                        finalStoreSetting.receipt_footer
                                    }
                                    transaction={currentTransaction}
                                />
                            </div>
                        </TabsContent>
                        <TabsContent
                            value="returns"
                            className="space-y-4 border-none p-0 pt-4 outline-none"
                        >
                            {totalRefund > 0 && (
                                <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/20">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-full bg-amber-100 p-2 dark:bg-amber-900/30">
                                            <RotateCcw className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                        </div>
                                        <div>
                                            <h5 className="font-semibold text-amber-900 dark:text-amber-200">
                                                {t('page.transaction.dialog_modal.detail_dialog.returns_total_refund_title', 'Total Nominal Retur')}
                                            </h5>
                                            <p className="text-xs text-amber-700 dark:text-amber-400">
                                                {t('page.transaction.dialog_modal.detail_dialog.returns_total_refund_desc', 'Total {{count}} barang dikembalikan untuk transaksi ini', { count: totalRefundQuantity })}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-xl font-bold text-amber-600 dark:text-amber-400 font-mono">
                                        {formatRupiah(totalRefund)}
                                    </span>
                                </div>
                            )}
                            <div className="w-full overflow-x-auto rounded-md border">
                                <Table>
                                    <TableHeader className="bg-muted/50">
                                        <TableRow>
                                            <TableHead>Produk</TableHead>
                                            <TableHead className="text-center">Jumlah</TableHead>
                                            <TableHead className="text-right">Harga Satuan</TableHead>
                                            <TableHead className="text-right">Total Refund</TableHead>
                                            <TableHead>Alasan</TableHead>
                                            <TableHead className="text-right">Waktu Retur</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {currentTransaction.returns && currentTransaction.returns.length > 0 ? (
                                            currentTransaction.returns.flatMap((ret: any) => 
                                                (ret.details || []).map((detail: any) => ({
                                                    ...detail,
                                                    return_number: ret.return_number,
                                                    reason: ret.reason,
                                                    created_at: ret.created_at
                                                }))
                                            ).map((detail: any, idx: number) => (
                                                <TableRow key={`${detail.id}-${idx}`}>
                                                    <TableCell className="font-medium">
                                                        {detail.product_name || 'Produk'}
                                                    </TableCell>
                                                    <TableCell className="text-center font-semibold">
                                                        {detail.quantity}
                                                    </TableCell>
                                                    <TableCell className="text-right text-xs">
                                                        {formatRupiah(detail.price_per_unit)}
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium text-xs text-rose-600 dark:text-rose-400">
                                                        {formatRupiah(detail.subtotal)}
                                                    </TableCell>
                                                    <TableCell className="text-xs text-muted-foreground max-w-40 truncate" title={detail.reason}>
                                                        {detail.reason || '-'}
                                                    </TableCell>
                                                    <TableCell className="text-right text-[10px] text-muted-foreground whitespace-nowrap">
                                                        {detail.created_at ? new Date(detail.created_at * 1000).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }) : '-'}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={6} className="h-16 text-center text-muted-foreground text-xs">
                                                    Belum ada barang yang diretur untuk transaksi ini.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                <div className="hidden print:block">
                    <ReceiptCard
                        storeName={finalStoreSetting.name}
                        storeAddress={finalStoreSetting.address}
                        storePhone={finalStoreSetting.phone}
                        storeEmail={finalStoreSetting.email}
                        storeReceiptFooter={finalStoreSetting.receipt_footer}
                        transaction={currentTransaction}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
