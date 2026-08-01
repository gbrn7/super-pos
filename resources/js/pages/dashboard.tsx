import * as React from 'react';
import { Head } from '@inertiajs/react';
import { dashboard } from '@/routes';
import i18next from 'i18next';
import {
    IconTrendingUp,
    IconReceipt,
    IconBox,
    IconCoin,
    IconCalendar,
    IconLoader,
    IconPackage,
    IconAlertTriangle
} from '@tabler/icons-react';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from '@/components/ui/chart';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import type { DateRange } from 'react-day-picker';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { useHttp } from '@inertiajs/react';
import { DetailDialog } from '@/pages/transaction/dialog-modal/detail-dialog';
import axiosInstance from '@/lib/axios';
import { handleApiError } from '@/lib/utils';

// Reusable formatters
const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0
    }).format(val);
};

const chartConfig = {
    revenue: {
        label: i18next.t('page.dashboard.charts.revenue_label', 'Pendapatan Kotor'),
        color: 'var(--primary)',
    },
    profit: {
        label: i18next.t('page.dashboard.charts.profit_label', 'Keuntungan Bersih'),
        color: 'color-mix(in oklch, var(--primary) 40%, transparent)',
    },
} satisfies ChartConfig;

const revenueBreakdownConfig = {
    profit: {
        label: i18next.t('page.dashboard.charts.breakdown_profit', 'Profit'),
        color: 'var(--primary)',
    },
    cost: {
        label: i18next.t('page.dashboard.charts.breakdown_cost', 'Modal'),
        color: 'color-mix(in oklch, var(--primary) 55%, transparent)',
    },
    discount: {
        label: i18next.t('page.dashboard.charts.breakdown_discount', 'Diskon'),
        color: 'color-mix(in oklch, var(--primary) 25%, transparent)',
    },
} satisfies ChartConfig;

const topProductsConfig = {
    quantity: {
        label: i18next.t('page.dashboard.charts.quantity_label', 'Jumlah Terjual'),
        color: 'var(--primary)',
    }
} satisfies ChartConfig;

const paymentConfig = {
    transactions_count: {
        label: i18next.t('page.dashboard.charts.transactions_label', 'Transaksi'),
    },
} satisfies ChartConfig;

const categoryConfig = {
    products_count: {
        label: i18next.t('page.dashboard.charts.products_sold_label', 'Jumlah Terjual'),
    },
} satisfies ChartConfig;

const dailyQuantityConfig = {
    quantity: {
        label: i18next.t('page.dashboard.charts.daily_quantity_label', 'Banyak'),
        color: 'var(--primary)',
    },
} satisfies ChartConfig;

const paymentChartShades = [
    'color-mix(in oklch, var(--primary) 100%, transparent)',
    'color-mix(in oklch, var(--primary) 75%, transparent)',
    'color-mix(in oklch, var(--primary) 50%, transparent)',
    'color-mix(in oklch, var(--primary) 30%, transparent)',
    'color-mix(in oklch, var(--primary) 15%, transparent)',
];

export default function Dashboard() {
    const [preset, setPreset] = React.useState('this_month');
    const [dateRange, setDateRange] = React.useState<DateRange | undefined>(undefined);
    const [customRange, setCustomRange] = React.useState({
        start_date: '',
        end_date: '',
    });

    const [dashboardData, setDashboardData] = React.useState<any>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isTableLoading, setIsTableLoading] = React.useState(false);

    const [selectedTransaction, setSelectedTransaction] = React.useState<any>(null);
    const [detailOpen, setDetailOpen] = React.useState(false);

    const handleInvoiceClick = async (invoiceNumber: string) => {
        try {
            const res = await axiosInstance.get(`/api/transactions/invoice/${invoiceNumber}`);
            if (res.data.success) {
                setSelectedTransaction(res.data.data);
                setDetailOpen(true);
            }
        } catch (error) {
            handleApiError(error);
        }
    };

    const paymentChartData = React.useMemo(() => {
        if (!dashboardData || !dashboardData.transactions_by_payment_method) return [];

        // Urutkan berdasarkan nominal terbesar agar gradasi warna konsisten dari tebal ke tipis
        const sortedData = [...dashboardData.transactions_by_payment_method].sort(
            (a: any, b: any) => b.total_amount - a.total_amount
        );

        return sortedData.map((item: any, index: number) => {
            const fill = paymentChartShades[index % paymentChartShades.length];
            return {
                name: item.payment_method_name,
                value: item.total_amount,
                count: item.transactions_count,
                fill: fill,
            };
        });
    }, [dashboardData]);

    const categoryChartData = React.useMemo(() => {
        if (!dashboardData || !dashboardData.transactions_by_category) return [];

        // Urutkan berdasarkan nominal terbesar agar gradasi warna konsisten dari tebal ke tipis
        const sortedData = [...dashboardData.transactions_by_category].sort(
            (a: any, b: any) => b.total_amount - a.total_amount
        );

        let result = [];
        if (sortedData.length <= 5) {
            result = sortedData.map((item: any) => ({
                name: item.category_name,
                value: item.total_amount,
                count: item.products_count,
            }));
        } else {
            // Ambil 5 teratas
            const top5 = sortedData.slice(0, 5);
            result = top5.map((item: any) => ({
                name: item.category_name,
                value: item.total_amount,
                count: item.products_count,
            }));

            // Jumlahkan sisanya ke kelompok "Lainnya"
            const others = sortedData.slice(5);
            const othersValue = others.reduce((sum: number, item: any) => sum + item.total_amount, 0);
            const othersCount = others.reduce((sum: number, item: any) => sum + item.products_count, 0);

            if (othersValue > 0) {
                result.push({
                    name: i18next.t('page.dashboard.charts.others_label', 'Lainnya'),
                    value: othersValue,
                    count: othersCount,
                });
            }
        }

        return result.map((item: any, index: number) => {
            const fill = paymentChartShades[index % paymentChartShades.length];
            return {
                ...item,
                fill: fill,
            };
        });
    }, [dashboardData]);

    const http = useHttp();

    const [activeTab, setActiveTab] = React.useState<'transactions' | 'low_stock' | 'best_sellers'>('transactions');
    const [page, setPage] = React.useState(1);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const [currentRange, setCurrentRange] = React.useState<{ start_date: number | null; end_date: number | null }>({
        start_date: null,
        end_date: null,
    });

    const totalRows = React.useMemo(() => {
        if (!dashboardData) return 0;
        if (activeTab === 'transactions') {
            return dashboardData.recent_transactions?.total || 0;
        } else if (activeTab === 'low_stock') {
            return dashboardData.low_stock_products?.length || 0;
        } else {
            return dashboardData.best_sellers?.length || 0;
        }
    }, [dashboardData, activeTab]);

    const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));

    const paginatedData = React.useMemo(() => {
        if (!dashboardData) return [];
        if (activeTab === 'transactions') {
            return dashboardData.recent_transactions?.data || [];
        } else if (activeTab === 'low_stock') {
            const dataList = dashboardData.low_stock_products || [];
            const start = (page - 1) * rowsPerPage;
            const end = start + rowsPerPage;
            return dataList.slice(start, end);
        } else {
            const dataList = dashboardData.best_sellers || [];
            const start = (page - 1) * rowsPerPage;
            const end = start + rowsPerPage;
            return dataList.slice(start, end);
        }
    }, [dashboardData, activeTab, page, rowsPerPage]);

    // Helper to calculate pre-defined date ranges in Unix timestamps (seconds)
    const getRangeDates = (type: string) => {
        const today = new Date();
        let start = new Date();
        let end = new Date();

        const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
        const endOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

        switch (type) {
            case 'today':
                start = startOfDay(today);
                end = endOfDay(today);
                break;
            case 'yesterday': {
                const prev = new Date(today);
                prev.setDate(today.getDate() - 1);
                start = startOfDay(prev);
                end = endOfDay(prev);
                break;
            }
            case 'this_week': {
                const day = today.getDay();
                const diff = today.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
                const monday = new Date(today);
                monday.setDate(diff);
                start = startOfDay(monday);
                end = endOfDay(today);
                break;
            }
            case 'this_month':
                start = startOfDay(new Date(today.getFullYear(), today.getMonth(), 1));
                end = endOfDay(new Date(today.getFullYear(), today.getMonth() + 1, 0));
                break;
            case 'last_month':
                start = startOfDay(new Date(today.getFullYear(), today.getMonth() - 1, 1));
                end = endOfDay(new Date(today.getFullYear(), today.getMonth(), 0));
                break;
            case 'this_year':
                start = startOfDay(new Date(today.getFullYear(), 0, 1));
                end = endOfDay(new Date(today.getFullYear(), 11, 31));
                break;
            default:
                start = startOfDay(today);
                end = endOfDay(today);
                break;
        }

        return {
            start_date: Math.floor(start.getTime() / 1000),
            end_date: Math.floor(end.getTime() / 1000),
        };
    };

    const lastLoadedPage = React.useRef(1);
    const lastLoadedLimit = React.useRef(10);
    const lastLoadedRange = React.useRef('');

    const fetchDashboardData = async (start: number, end: number, txPageNum = 1, txLimitNum = 10, onlyTransactions = false) => {
        if (onlyTransactions) {
            setIsTableLoading(true);
        } else {
            setIsLoading(true);
        }
        try {
            const response = (await http.get(`/api/dashboard?start_date=${start}&end_date=${end}&tx_page=${txPageNum}&tx_limit=${txLimitNum}${onlyTransactions ? '&only_transactions=true' : ''}`)) as any;
            if (response && response.success) {
                if (onlyTransactions) {
                    setDashboardData((prev: any) => ({
                        ...prev,
                        recent_transactions: response.data.recent_transactions
                    }));
                } else {
                    setDashboardData(response.data);
                }
            }
        } catch (error) {
            console.error('Failed fetching dashboard metrics:', error);
        } finally {
            setIsLoading(false);
            setIsTableLoading(false);
        }
    };

    // Trigger API call when preset changes
    React.useEffect(() => {
        if (preset !== 'custom') {
            const range = getRangeDates(preset);
            setCurrentRange(range);
            setPage(1);
        }
    }, [preset]);

    // Fetch dashboard data when range, active page, or rows per page changes
    React.useEffect(() => {
        if (!currentRange.start_date || !currentRange.end_date) return;

        const rangeKey = `${currentRange.start_date}_${currentRange.end_date}`;
        const rangeChanged = lastLoadedRange.current !== rangeKey;
        const pageChanged = lastLoadedPage.current !== page;
        const limitChanged = lastLoadedLimit.current !== rowsPerPage;

        if (rangeChanged) {
            // Full fetch on date range change
            fetchDashboardData(currentRange.start_date, currentRange.end_date, 1, rowsPerPage, false);
            lastLoadedRange.current = rangeKey;
            lastLoadedPage.current = 1;
            lastLoadedLimit.current = rowsPerPage;
            setPage(1);
        } else if (activeTab === 'transactions' && (pageChanged || limitChanged)) {
            // Partial fetch for transactions pagination
            fetchDashboardData(currentRange.start_date, currentRange.end_date, page, rowsPerPage, true);
            lastLoadedPage.current = page;
            lastLoadedLimit.current = rowsPerPage;
        }
    }, [currentRange, activeTab, page, rowsPerPage]);

    // Handle manual apply for custom range via Shadcn Calendar
    const handleDateRangeSelect = (range: DateRange | undefined) => {
        setDateRange(range);
        if (range?.from && range?.to) {
            const startTs = Math.floor(new Date(range.from.getFullYear(), range.from.getMonth(), range.from.getDate(), 0, 0, 0, 0).getTime() / 1000);
            const endTs = Math.floor(new Date(range.to.getFullYear(), range.to.getMonth(), range.to.getDate(), 23, 59, 59, 999).getTime() / 1000);
            setCurrentRange({ start_date: startTs, end_date: endTs });
            setPage(1);
        }
    };

    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">

                {/* Header Filter Panel */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b pb-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{i18next.t('page.dashboard.header_title', 'Dasbor Penjualan')}</h1>
                        <p className="text-sm text-muted-foreground">{i18next.t('page.dashboard.header_subtitle', 'Monitor performa keuangan, profitabilitas toko, dan statistik penjualan.')}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <Select value={preset} onValueChange={setPreset}>
                            <SelectTrigger className="w-[180px]">
                                <IconCalendar className="mr-2 h-4 w-4 text-muted-foreground" />
                                <SelectValue placeholder={i18next.t('page.dashboard.filter_placeholder', 'Pilih Filter Tanggal')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="today">{i18next.t('page.dashboard.presets.today', 'Hari Ini')}</SelectItem>
                                <SelectItem value="yesterday">{i18next.t('page.dashboard.presets.yesterday', 'Kemarin')}</SelectItem>
                                <SelectItem value="this_week">{i18next.t('page.dashboard.presets.this_week', 'Minggu Ini')}</SelectItem>
                                <SelectItem value="this_month">{i18next.t('page.dashboard.presets.this_month', 'Bulan Ini')}</SelectItem>
                                <SelectItem value="last_month">{i18next.t('page.dashboard.presets.last_month', 'Bulan Lalu')}</SelectItem>
                                <SelectItem value="custom">{i18next.t('page.dashboard.presets.custom', 'Kustom Tanggal')}</SelectItem>
                            </SelectContent>
                        </Select>

                        {preset === 'custom' && (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="h-9 min-w-[240px] justify-start text-left font-normal">
                                        {dateRange?.from ? (
                                            dateRange.to ? (
                                                <span>
                                                    {dateRange.from.toLocaleDateString('id-ID')} - {dateRange.to.toLocaleDateString('id-ID')}
                                                </span>
                                            ) : (
                                                <span>{dateRange.from.toLocaleDateString('id-ID')}</span>
                                            )
                                        ) : (
                                            <span className="text-muted-foreground">{i18next.t('page.dashboard.presets.custom', 'Pilih Rentang Tanggal')}</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="end">
                                    <Calendar
                                        initialFocus
                                        mode="range"
                                        defaultMonth={dateRange?.from}
                                        selected={dateRange}
                                        onSelect={handleDateRangeSelect}
                                        numberOfMonths={2}
                                    />
                                </PopoverContent>
                            </Popover>
                        )}

                        {isLoading && <IconLoader className="animate-spin text-primary size-5" />}
                    </div>
                </div>

                {/* Key Metrics Cards */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {/* Revenue Card */}
                    <Card className="bg-gradient-to-br from-primary/10 via-card to-card">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <span className="text-base font-bold text-muted-foreground">{i18next.t('page.dashboard.metrics.gross_revenue', 'Pendapatan Kotor')}</span>
                            <IconCoin className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold tracking-tight">
                                {isLoading || !dashboardData ? (
                                    <div className="h-7 w-32 bg-muted animate-pulse rounded" />
                                ) : (
                                    formatCurrency(dashboardData.metrics.total_revenue)
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{i18next.t('page.dashboard.metrics.gross_revenue_desc', 'Total seluruh invoice masuk')}</p>
                        </CardContent>
                    </Card>

                    {/* Margin / Net Profit Card */}
                    <Card className={`bg-gradient-to-br ${dashboardData?.metrics?.total_net_profit < 0 ? 'from-rose-500/10' : 'from-emerald-500/10'} via-card to-card`}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <span className="text-base font-bold text-muted-foreground">{i18next.t('page.dashboard.metrics.net_profit', 'Margin')}</span>
                            <IconTrendingUp className={`h-4 w-4 ${dashboardData?.metrics?.total_net_profit < 0 ? 'text-rose-500' : 'text-emerald-500'}`} />
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold tracking-tight ${dashboardData?.metrics?.total_net_profit < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                {isLoading || !dashboardData ? (
                                    <div className="h-7 w-32 bg-muted animate-pulse rounded" />
                                ) : dashboardData.metrics.total_net_profit < 0 ? (
                                    `-${formatCurrency(Math.abs(dashboardData.metrics.total_net_profit))}`
                                ) : (
                                    formatCurrency(dashboardData.metrics.total_net_profit)
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{i18next.t('page.dashboard.metrics.net_profit_desc', 'Selisih harga jual dengan modal')}</p>
                        </CardContent>
                    </Card>

                    {/* Transactions Count Card */}
                    <Card className="bg-gradient-to-br from-indigo-500/10 via-card to-card">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <span className="text-base font-bold text-muted-foreground">{i18next.t('page.dashboard.metrics.transactions_count', 'Jumlah Transaksi')}</span>
                            <IconReceipt className="h-4 w-4 text-indigo-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold tracking-tight">
                                {isLoading || !dashboardData ? (
                                    <div className="h-7 w-20 bg-muted animate-pulse rounded" />
                                ) : (
                                    dashboardData.metrics.transactions_count.toLocaleString()
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{i18next.t('page.dashboard.metrics.transactions_count_desc', 'Total nota checkout lunas')}</p>
                        </CardContent>
                    </Card>

                    {/* Total Products Sold Card */}
                    <Card className="bg-gradient-to-br from-amber-500/10 via-card to-card">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <span className="text-base font-bold text-muted-foreground">{i18next.t('page.dashboard.metrics.products_sold', 'Produk Terjual')}</span>
                            <IconBox className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold tracking-tight">
                                {isLoading || !dashboardData ? (
                                    <div className="h-7 w-20 bg-muted animate-pulse rounded" />
                                ) : (
                                    dashboardData.metrics.products_sold.toLocaleString()
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{i18next.t('page.dashboard.metrics.products_sold_desc', 'Item barang keluar toko')}</p>
                        </CardContent>
                    </Card>

                    {/* Total Products Card */}
                    <Card className="bg-gradient-to-br from-blue-500/10 via-card to-card">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <span className="text-base font-bold text-muted-foreground">{i18next.t('page.dashboard.metrics.total_products', 'Total Produk')}</span>
                            <IconPackage className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold tracking-tight">
                                {isLoading || !dashboardData ? (
                                    <div className="h-7 w-20 bg-muted animate-pulse rounded" />
                                ) : (
                                    dashboardData.metrics.total_products.toLocaleString()
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{i18next.t('page.dashboard.metrics.total_products_desc', 'Total inventori produk aktif')}</p>
                        </CardContent>
                    </Card>

                    {/* Out of Stock Card */}
                    <Card className="bg-gradient-to-br from-red-500/10 via-card to-card">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <span className="text-base font-bold text-muted-foreground">{i18next.t('page.dashboard.metrics.out_of_stock_products', 'Stok Habis')}</span>
                            <IconAlertTriangle className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold tracking-tight text-red-600 dark:text-red-400">
                                {isLoading || !dashboardData ? (
                                    <div className="h-7 w-20 bg-muted animate-pulse rounded" />
                                ) : (
                                    dashboardData.metrics.out_of_stock_products.toLocaleString()
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{i18next.t('page.dashboard.metrics.out_of_stock_products_desc', 'Produk perlu segera diisi')}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Area */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">

                    {/* Area Chart: Sales Trend (Revenue & profit) */}
                    <Card className="lg:col-span-3">
                        <CardHeader>
                            <CardTitle>{i18next.t('page.dashboard.charts.sales_trend_title', 'Tren Keuangan Harian')}</CardTitle>
                            <CardDescription>{i18next.t('page.dashboard.charts.sales_trend_desc', 'Visualisasi perbandingan pendapatan kotor dan laba bersih')}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading || !dashboardData ? (
                                <div className="h-[250px] w-full bg-muted animate-pulse rounded-lg" />
                            ) : dashboardData.trend_chart.length === 0 ? (
                                <div className="h-[250px] w-full flex items-center justify-center border border-dashed rounded-lg text-muted-foreground">
                                    {i18next.t('page.dashboard.charts.no_data', 'Tidak ada data untuk periode ini')}
                                </div>
                            ) : (
                                <ChartContainer config={chartConfig} className="aspect-auto h-62.5 w-full">
                                    <Line
                                        data={{
                                            labels: dashboardData.trend_chart.map((item: any) => {
                                                const parts = item.date.split('-');
                                                return `${parts[2]}/${parts[1]}`;
                                            }),
                                            datasets: [
                                                {
                                                    label: i18next.t('page.dashboard.charts.revenue_label', 'Pendapatan Kotor'),
                                                    data: dashboardData.trend_chart.map((item: any) => item.revenue),
                                                    borderColor: 'var(--color-revenue, #4f46e5)',
                                                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                                                    fill: true,
                                                    tension: 0.4,
                                                },
                                                {
                                                    label: i18next.t('page.dashboard.charts.profit_label', 'Keuntungan Bersih'),
                                                    data: dashboardData.trend_chart.map((item: any) => item.profit),
                                                    borderColor: 'var(--color-profit, #10b981)',
                                                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                                    fill: true,
                                                    tension: 0.4,
                                                },
                                            ],
                                        }}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: {
                                                legend: { position: 'top' },
                                                tooltip: {
                                                    callbacks: {
                                                        label: (context) => `${context.dataset.label}: ${formatCurrency(context.raw as number)}`,
                                                    },
                                                },
                                            },
                                            scales: {
                                                x: { grid: { display: false } },
                                                y: { grid: { color: 'rgba(150, 150, 150, 0.1)' } },
                                            },
                                        }}
                                    />
                                </ChartContainer>
                            )}
                        </CardContent>
                    </Card>

                    {/* Pie Chart: Revenue Breakdown (Profit vs Modal) */}
                    <Card className="lg:col-span-1 flex flex-col justify-between">
                        <CardHeader>
                            <CardTitle>{i18next.t('page.dashboard.charts.revenue_breakdown_title', 'Pembagian Uang Masuk')}</CardTitle>
                            <CardDescription>{i18next.t('page.dashboard.charts.revenue_breakdown_desc', 'Alokasi pendapatan kotor untuk modal & laba')}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col justify-center">
                            {isLoading || !dashboardData ? (
                                <div className="h-[200px] w-full bg-muted animate-pulse rounded-lg" />
                            ) : !dashboardData.metrics?.revenue_breakdown || (dashboardData.metrics.revenue_breakdown.profit === 0 && dashboardData.metrics.revenue_breakdown.cost === 0) ? (
                                <div className="h-[200px] w-full flex items-center justify-center border border-dashed rounded-lg text-muted-foreground text-xs">
                                    {i18next.t('page.dashboard.charts.no_data', 'Tidak ada data untuk periode ini')}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <ChartContainer config={revenueBreakdownConfig} className="mx-auto aspect-square h-[170px]">
                                        <Doughnut
                                            data={{
                                                labels: [
                                                    i18next.t('page.dashboard.charts.breakdown_profit', 'Profit Bersih'),
                                                    i18next.t('page.dashboard.charts.breakdown_cost', 'Modal Produk'),
                                                ],
                                                datasets: [
                                                    {
                                                        data: [
                                                            dashboardData.metrics.revenue_breakdown.profit,
                                                            dashboardData.metrics.revenue_breakdown.cost,
                                                        ],
                                                        backgroundColor: [
                                                            'var(--primary)',
                                                            'color-mix(in oklch, var(--primary) 40%, transparent)',
                                                        ],
                                                    },
                                                ],
                                            }}
                                            options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                plugins: {
                                                    legend: { display: false },
                                                    tooltip: {
                                                        callbacks: {
                                                            label: (context) => `${context.label}: ${formatCurrency(context.raw as number)}`,
                                                        },
                                                    },
                                                },
                                                cutout: '65%',
                                            }}
                                        />
                                    </ChartContainer>

                                    {/* Legend & Summary */}
                                    <div className="grid grid-cols-1 gap-2 text-xs pt-1 border-t">
                                        <div className="flex items-center justify-between">
                                            <span className="flex items-center gap-1.5 font-medium">
                                                <span className="size-2.5 rounded-full bg-primary" />
                                                {i18next.t('page.dashboard.charts.breakdown_profit', 'Profit Bersih')}
                                            </span>
                                            <span className="font-semibold text-primary">
                                                {formatCurrency(dashboardData.metrics.revenue_breakdown.profit)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="flex items-center gap-1.5 font-medium">
                                                <span className="size-2.5 rounded-full bg-primary/40" />
                                                {i18next.t('page.dashboard.charts.breakdown_cost', 'Modal Produk')}
                                            </span>
                                            <span className="font-semibold text-foreground/80">
                                                {formatCurrency(dashboardData.metrics.revenue_breakdown.cost)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between pt-1 mt-1 border-t border-dashed">
                                            <span className="text-muted-foreground font-medium">
                                                {i18next.t('page.dashboard.charts.breakdown_discount', 'Total Diskon Diberikan')}
                                            </span>
                                            <span className="font-medium text-muted-foreground">
                                                {formatCurrency(dashboardData.metrics.revenue_breakdown.discount)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Bar Chart: Daily Quantity Sold Trend */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>{i18next.t('page.dashboard.charts.daily_quantity_title', 'Tren Harian banyak produk terjual')}</CardTitle>
                            <CardDescription>{i18next.t('page.dashboard.charts.daily_quantity_desc', 'Jumlah item produk yang terjual setiap hari pada periode terpilih')}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading || !dashboardData ? (
                                <div className="h-[250px] w-full bg-muted animate-pulse rounded-lg" />
                            ) : dashboardData.trend_chart.length === 0 ? (
                                <div className="h-[250px] w-full flex items-center justify-center border border-dashed rounded-lg text-muted-foreground">
                                    {i18next.t('page.dashboard.charts.no_data', 'Tidak ada data untuk periode ini')}
                                </div>
                            ) : (
                                <ChartContainer config={dailyQuantityConfig} className="aspect-auto h-62.5 w-full">
                                    <Bar
                                        data={{
                                            labels: dashboardData.trend_chart.map((item: any) => {
                                                const parts = item.date.split('-');
                                                return `${parts[2]}/${parts[1]}`;
                                            }),
                                            datasets: [
                                                {
                                                    label: i18next.t('page.dashboard.charts.daily_quantity_label', 'Banyak Produk'),
                                                    data: dashboardData.trend_chart.map((item: any) => item.quantity),
                                                    backgroundColor: dashboardData.trend_chart.map((_: any, index: number) =>
                                                        `color-mix(in oklch, var(--primary) ${Math.max(40, 100 - index * 3)}%, transparent)`
                                                    ),
                                                    borderRadius: 4,
                                                },
                                            ],
                                        }}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: {
                                                legend: { display: false },
                                            },
                                            scales: {
                                                x: { grid: { display: false } },
                                                y: { grid: { color: 'rgba(150, 150, 150, 0.1)' } },
                                            },
                                        }}
                                    />
                                </ChartContainer>
                            )}
                        </CardContent>
                    </Card>

                    {/* Pie Chart: Transactions per Payment Method */}
                    <Card className="flex flex-col lg:col-span-2">
                        <CardHeader className="pb-2">
                            <CardTitle>{i18next.t('page.dashboard.charts.payment_methods_title', 'Metode Pembayaran')}</CardTitle>
                            <CardDescription>{i18next.t('page.dashboard.charts.payment_methods_desc', 'Persentase nominal transaksi per metode pembayaran')}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col justify-between pb-4">
                            {isLoading || !dashboardData ? (
                                <div className="h-[250px] w-full bg-muted animate-pulse rounded-lg" />
                            ) : paymentChartData.length === 0 ? (
                                <div className="h-[250px] w-full flex items-center justify-center border border-dashed rounded-lg text-muted-foreground">
                                    {i18next.t('page.dashboard.charts.no_transaction_data', 'Tidak ada data transaksi')}
                                </div>
                            ) : (
                                <>
                                    <div className="mx-auto aspect-square max-h-[170px] w-full">
                                        <ChartContainer config={paymentConfig} className="mx-auto aspect-square max-h-[170px]">
                                            <Doughnut
                                                data={{
                                                    labels: paymentChartData.map((item: any) => item.name),
                                                    datasets: [
                                                        {
                                                            data: paymentChartData.map((item: any) => item.value),
                                                            backgroundColor: paymentChartData.map((item: any) => item.fill),
                                                        },
                                                    ],
                                                }}
                                                options={{
                                                    responsive: true,
                                                    maintainAspectRatio: false,
                                                    plugins: {
                                                        legend: { display: false },
                                                        tooltip: {
                                                            callbacks: {
                                                                label: (context) => `${context.label}: ${formatCurrency(context.raw as number)}`,
                                                            },
                                                        },
                                                    },
                                                    cutout: '60%',
                                                }}
                                            />
                                        </ChartContainer>
                                    </div>
                                    <div className="flex flex-col gap-1.5 mt-2">
                                        {paymentChartData.map((item: any, index: number) => {
                                            const total = paymentChartData.reduce((acc: number, curr: any) => acc + curr.value, 0);
                                            const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0';
                                            return (
                                                <div key={index} className="flex items-center justify-between text-[11px] border-b border-muted pb-1 last:border-0 last:pb-0">
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                                                        <span className="font-medium text-muted-foreground">{item.name}</span>
                                                    </div>
                                                    <span className="font-semibold text-foreground">{formatCurrency(item.value)} ({percentage}%)</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Pie Chart: Transactions per Category */}
                    <Card className="flex flex-col lg:col-span-2">
                        <CardHeader className="pb-2">
                            <CardTitle>{i18next.t('page.dashboard.charts.categories_title', 'Nominal Transaksi per Kategori')}</CardTitle>
                            <CardDescription>{i18next.t('page.dashboard.charts.categories_desc', 'Persentase nominal transaksi berdasarkan kategori produk')}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col justify-between pb-4">
                            {isLoading || !dashboardData ? (
                                <div className="h-[250px] w-full bg-muted animate-pulse rounded-lg" />
                            ) : categoryChartData.length === 0 ? (
                                <div className="h-[250px] w-full flex items-center justify-center border border-dashed rounded-lg text-muted-foreground">
                                    {i18next.t('page.dashboard.charts.no_category_data', 'Tidak ada data kategori')}
                                </div>
                            ) : (
                                <>
                                    <div className="mx-auto aspect-square max-h-[170px] w-full">
                                        <ChartContainer config={categoryConfig} className="mx-auto aspect-square max-h-[170px]">
                                            <Doughnut
                                                data={{
                                                    labels: categoryChartData.map((item: any) => item.name),
                                                    datasets: [
                                                        {
                                                            data: categoryChartData.map((item: any) => item.value),
                                                            backgroundColor: categoryChartData.map((item: any) => item.fill),
                                                        },
                                                    ],
                                                }}
                                                options={{
                                                    responsive: true,
                                                    maintainAspectRatio: false,
                                                    plugins: {
                                                        legend: { display: false },
                                                        tooltip: {
                                                            callbacks: {
                                                                label: (context) => `${context.label}: ${formatCurrency(context.raw as number)}`,
                                                            },
                                                        },
                                                    },
                                                    cutout: '60%',
                                                }}
                                            />
                                        </ChartContainer>
                                    </div>
                                    <div className="flex flex-col gap-1.5 mt-2">
                                        {categoryChartData.map((item: any, index: number) => {
                                            const total = categoryChartData.reduce((acc: number, curr: any) => acc + curr.value, 0);
                                            const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0';
                                            return (
                                                <div key={index} className="flex items-center justify-between text-[11px] border-b border-muted pb-1 last:border-0 last:pb-0">
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                                                        <span className="font-medium text-muted-foreground">{item.name}</span>
                                                    </div>
                                                    <span className="font-semibold text-foreground">{formatCurrency(item.value)} ({percentage}%)</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Bar Chart: Best Selling Products */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>{i18next.t('page.dashboard.charts.top_products_title', 'Produk Terlaris')}</CardTitle>
                            <CardDescription>{i18next.t('page.dashboard.charts.top_products_desc', 'Top 5 produk terjual terbanyak')}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading || !dashboardData ? (
                                <div className="h-[250px] w-full bg-muted animate-pulse rounded-lg" />
                            ) : dashboardData.top_products.length === 0 ? (
                                <div className="h-[250px] w-full flex items-center justify-center border border-dashed rounded-lg text-muted-foreground">
                                    {i18next.t('page.dashboard.charts.no_product_data', 'Tidak ada data produk')}
                                </div>
                            ) : (
                                <ChartContainer config={topProductsConfig} className="aspect-auto h-62.5 w-full">
                                    <Bar
                                        data={{
                                            labels: dashboardData.top_products.map((item: any) => item.name),
                                            datasets: [
                                                {
                                                    label: i18next.t('page.dashboard.charts.quantity_label', 'Jumlah Terjual'),
                                                    data: dashboardData.top_products.map((item: any) => item.quantity),
                                                    backgroundColor: dashboardData.top_products.map((_: any, index: number) => paymentChartShades[index % paymentChartShades.length]),
                                                    borderRadius: 4,
                                                },
                                            ],
                                        }}
                                        options={{
                                            indexAxis: 'y',
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: {
                                                legend: { display: false },
                                            },
                                            scales: {
                                                x: { grid: { color: 'rgba(150, 150, 150, 0.1)' } },
                                                y: { grid: { display: false } },
                                            },
                                        }}
                                    />
                                </ChartContainer>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Transactions & Low Stock Products Tabbed Card */}
                <Card>
                    <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-3">
                        <div className="flex flex-col gap-1">
                            <CardTitle>
                                {activeTab === 'transactions'
                                    ? i18next.t('page.dashboard.tables.recent_transactions_title', 'Transaksi Terbaru')
                                    : activeTab === 'low_stock'
                                        ? i18next.t('page.dashboard.tables.low_stock_title', 'Stok Menipis')
                                        : i18next.t('page.dashboard.tables.best_sellers_title', 'Produk Terlaris')}
                            </CardTitle>
                            <CardDescription>
                                {activeTab === 'transactions'
                                    ? i18next.t('page.dashboard.tables.recent_transactions_desc', 'Daftar nota penjualan lunas di rentang filter terpilih')
                                    : activeTab === 'low_stock'
                                        ? i18next.t('page.dashboard.tables.low_stock_desc', 'Daftar produk dengan jumlah stok paling sedikit (non-unlimited)')
                                        : i18next.t('page.dashboard.tables.best_sellers_desc', 'Produk dengan total penjualan terbanyak sepanjang masa')}
                            </CardDescription>
                        </div>

                        <div className="flex gap-1.5 bg-muted/60 p-1 rounded-lg self-start sm:self-center">
                            <button
                                onClick={() => { setActiveTab('transactions'); setPage(1); }}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${activeTab === 'transactions'
                                    ? 'bg-background text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                {i18next.t('page.dashboard.tables.recent_transactions_title', 'Transaksi Terbaru')}
                            </button>
                            <button
                                onClick={() => { setActiveTab('low_stock'); setPage(1); }}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${activeTab === 'low_stock'
                                    ? 'bg-background text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                {i18next.t('page.dashboard.tables.low_stock_title', 'Stok Menipis')}
                            </button>
                            <button
                                onClick={() => { setActiveTab('best_sellers'); setPage(1); }}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${activeTab === 'best_sellers'
                                    ? 'bg-background text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                {i18next.t('page.dashboard.tables.best_sellers_title', 'Produk Terlaris')}
                            </button>
                        </div>
                    </CardHeader>

                    <CardContent>
                        {isLoading || isTableLoading || !dashboardData ? (
                            <div className="space-y-2 py-4">
                                <div className="h-6 w-full bg-muted animate-pulse rounded" />
                                <div className="h-6 w-full bg-muted animate-pulse rounded" />
                                <div className="h-6 w-full bg-muted animate-pulse rounded" />
                            </div>
                        ) : paginatedData.length === 0 ? (
                            <div className="py-12 text-center border border-dashed rounded-lg text-muted-foreground text-sm">
                                {activeTab === 'transactions'
                                    ? i18next.t('page.dashboard.tables.no_transactions', 'Tidak ada transaksi di rentang tanggal ini.')
                                    : activeTab === 'low_stock'
                                        ? i18next.t('page.dashboard.tables.sufficient_stock', 'Semua stok produk mencukupi.')
                                        : i18next.t('page.dashboard.tables.no_best_sellers', 'Belum ada data penjualan produk.')}
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto rounded-lg border">
                                    <Table>
                                        <TableHeader>
                                            {activeTab === 'transactions' ? (
                                                <TableRow>
                                                    <TableHead>{i18next.t('page.dashboard.tables.columns.time', 'Waktu')}</TableHead>
                                                    <TableHead>{i18next.t('page.dashboard.tables.columns.invoice_no', 'No. Invoice')}</TableHead>
                                                    <TableHead>{i18next.t('page.dashboard.tables.columns.cashier', 'Kasir')}</TableHead>
                                                    <TableHead>{i18next.t('page.dashboard.tables.columns.payment', 'Pembayaran')}</TableHead>
                                                    <TableHead className="text-right">{i18next.t('page.dashboard.tables.columns.total', 'Total')}</TableHead>
                                                </TableRow>
                                            ) : activeTab === 'low_stock' ? (
                                                <TableRow>
                                                    <TableHead>{i18next.t('page.dashboard.tables.columns.sku', 'SKU')}</TableHead>
                                                    <TableHead>{i18next.t('page.dashboard.tables.columns.product_name', 'Nama Produk')}</TableHead>
                                                    <TableHead className="text-right">{i18next.t('page.dashboard.tables.columns.price', 'Harga')}</TableHead>
                                                    <TableHead className="text-right">{i18next.t('page.dashboard.tables.columns.remaining_stock', 'Sisa Stok')}</TableHead>
                                                </TableRow>
                                            ) : (
                                                <TableRow>
                                                    <TableHead>{i18next.t('page.dashboard.tables.columns.rank', '#')}</TableHead>
                                                    <TableHead>{i18next.t('page.dashboard.tables.columns.sku', 'SKU')}</TableHead>
                                                    <TableHead>{i18next.t('page.dashboard.tables.columns.product_name', 'Nama Produk')}</TableHead>
                                                    <TableHead className="text-right">{i18next.t('page.dashboard.tables.columns.price', 'Harga')}</TableHead>
                                                    <TableHead className="text-right">{i18next.t('page.dashboard.tables.columns.sold_qty', 'Terjual')}</TableHead>
                                                </TableRow>
                                            )}
                                        </TableHeader>
                                        <TableBody>
                                            {activeTab === 'transactions' ? (
                                                paginatedData.map((tx: any) => (
                                                    <TableRow key={tx.id}>
                                                        <TableCell className="text-xs">{tx.created_at}</TableCell>
                                                        <TableCell
                                                            className="font-semibold text-xs text-primary cursor-pointer hover:underline"
                                                            onClick={() => handleInvoiceClick(tx.invoice_number)}
                                                        >
                                                            {tx.invoice_number}
                                                        </TableCell>
                                                        <TableCell className="text-xs">{tx.user_name}</TableCell>
                                                        <TableCell className="text-xs">
                                                            <Badge variant="secondary">{tx.payment_method_name}</Badge>
                                                        </TableCell>
                                                        <TableCell className="text-right font-medium text-xs">
                                                            {formatCurrency(tx.total_amount)}
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : activeTab === 'low_stock' ? (
                                                paginatedData.map((product: any) => (
                                                    <TableRow key={product.id}>
                                                        <TableCell className="text-xs font-mono">{product.sku}</TableCell>
                                                        <TableCell className="text-xs font-semibold">{product.name}</TableCell>
                                                        <TableCell className="text-right text-xs">
                                                            {formatCurrency(product.price)}
                                                        </TableCell>
                                                        <TableCell className="text-right text-xs">
                                                            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${product.stock <= 5 ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                                                {product.stock}
                                                            </span>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                paginatedData.map((product: any, index: number) => (
                                                    <TableRow key={product.id}>
                                                        <TableCell className="text-xs font-bold text-muted-foreground w-8">
                                                            #{(page - 1) * rowsPerPage + index + 1}
                                                        </TableCell>
                                                        <TableCell className="text-xs font-mono">{product.sku}</TableCell>
                                                        <TableCell className="text-xs font-semibold">{product.name}</TableCell>
                                                        <TableCell className="text-right text-xs">
                                                            {formatCurrency(product.price)}
                                                        </TableCell>
                                                        <TableCell className="text-right text-xs">
                                                            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-primary/10 text-primary">
                                                                {product.sold_quantity.toLocaleString()}
                                                            </span>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Pagination Footer */}
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mt-4 pt-2 border-t text-muted-foreground">
                                    <div className="text-xs">
                                        {i18next.t('page.dashboard.pagination.showing', 'Menampilkan {{start}} s/d {{end}} dari {{total}} data', {
                                            start: Math.min(totalRows, (page - 1) * rowsPerPage + 1),
                                            end: Math.min(totalRows, page * rowsPerPage),
                                            total: totalRows
                                        })}
                                    </div>

                                    <div className="flex flex-wrap items-center gap-4 sm:gap-6 self-end sm:self-auto">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs">{i18next.t('page.dashboard.pagination.rows_per_page', 'Baris per halaman')}</span>
                                            <select
                                                value={rowsPerPage}
                                                onChange={(e) => {
                                                    setRowsPerPage(Number(e.target.value));
                                                    setPage(1);
                                                }}
                                                className="h-8 rounded-md border border-input bg-background px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-ring cursor-pointer"
                                            >
                                                <option value="5" className="bg-card text-foreground">5</option>
                                                <option value="10" className="bg-card text-foreground">10</option>
                                                <option value="20" className="bg-card text-foreground">20</option>
                                            </select>
                                        </div>

                                        <span className="text-xs font-medium">
                                            {i18next.t('page.dashboard.pagination.page_of', 'Halaman {{page}} dari {{totalPages}}', { page, totalPages })}
                                        </span>

                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => setPage(1)}
                                                disabled={page === 1}
                                                className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-muted disabled:opacity-50 text-xs font-bold transition-colors cursor-pointer disabled:cursor-not-allowed"
                                                title={i18next.t('page.dashboard.pagination.first_page', 'Halaman Pertama')}
                                            >
                                                &laquo;
                                            </button>
                                            <button
                                                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                                                disabled={page === 1}
                                                className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-muted disabled:opacity-50 text-xs font-bold transition-colors cursor-pointer disabled:cursor-not-allowed"
                                                title={i18next.t('page.dashboard.pagination.prev_page', 'Halaman Sebelumnya')}
                                            >
                                                &lsaquo;
                                            </button>
                                            <button
                                                onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                                                disabled={page === totalPages}
                                                className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-muted disabled:opacity-50 text-xs font-bold transition-colors cursor-pointer disabled:cursor-not-allowed"
                                                title={i18next.t('page.dashboard.pagination.next_page', 'Halaman Selanjutnya')}
                                            >
                                                &rsaquo;
                                            </button>
                                            <button
                                                onClick={() => setPage(totalPages)}
                                                disabled={page === totalPages}
                                                className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-muted disabled:opacity-50 text-xs font-bold transition-colors cursor-pointer disabled:cursor-not-allowed"
                                                title={i18next.t('page.dashboard.pagination.last_page', 'Halaman Terakhir')}
                                            >
                                                &raquo;
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {selectedTransaction && (
                    <DetailDialog
                        isOpen={detailOpen}
                        transaction={selectedTransaction}
                        onOpenChange={setDetailOpen}
                    />
                )}
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: i18next.t('page.dashboard.title', 'Dasbor'),
            href: dashboard(),
        },
    ],
};
