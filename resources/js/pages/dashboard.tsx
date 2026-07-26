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
    IconLoader
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Area, AreaChart, CartesianGrid, XAxis, Bar, BarChart, YAxis } from 'recharts';
import { useHttp } from '@inertiajs/react';

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
        label: 'Pendapatan Kotor',
        color: 'var(--primary)',
    },
    profit: {
        label: 'Keuntungan Bersih',
        color: 'var(--primary)',
    },
} satisfies ChartConfig;

const topProductsConfig = {
    quantity: {
        label: 'Jumlah Terjual',
        color: 'var(--primary)',
    }
} satisfies ChartConfig;

export default function Dashboard() {
    const [preset, setPreset] = React.useState('this_month');
    const [customRange, setCustomRange] = React.useState({
        start_date: '',
        end_date: '',
    });
    
    const [dashboardData, setDashboardData] = React.useState<any>(null);
    const [isLoading, setIsLoading] = React.useState(true);

    const http = useHttp();

    // Helper to calculate pre-defined date ranges
    const getRangeDates = (type: string) => {
        const today = new Date();
        let start = new Date();
        let end = new Date();

        switch (type) {
            case 'today':
                break;
            case 'yesterday':
                start.setDate(today.getDate() - 1);
                end.setDate(today.getDate() - 1);
                break;
            case 'this_week':
                const day = today.getDay();
                const diff = today.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
                start = new Date(today.setDate(diff));
                end = new Date();
                break;
            case 'this_month':
                start = new Date(today.getFullYear(), today.getMonth(), 1);
                end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                break;
            case 'last_month':
                start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                end = new Date(today.getFullYear(), today.getMonth(), 0);
                break;
            default:
                break;
        }

        const formatDate = (d: Date) => d.toISOString().split('T')[0];
        return {
            start_date: formatDate(start),
            end_date: formatDate(end),
        };
    };

    const fetchDashboardData = async (start: string, end: string) => {
        setIsLoading(true);
        try {
            const response = (await http.get(`/api/dashboard?start_date=${start}&end_date=${end}`)) as any;
            if (response && response.success) {
                setDashboardData(response.data);
            }
        } catch (error) {
            console.error('Failed fetching dashboard metrics:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Trigger API call when preset changes
    React.useEffect(() => {
        if (preset !== 'custom') {
            const range = getRangeDates(preset);
            fetchDashboardData(range.start_date, range.end_date);
        }
    }, [preset]);

    // Handle manual apply for custom range
    const handleCustomRangeSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (customRange.start_date && customRange.end_date) {
            fetchDashboardData(customRange.start_date, customRange.end_date);
        }
    };

    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                
                {/* Header Filter Panel */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b pb-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Dasbor Penjualan</h1>
                        <p className="text-sm text-muted-foreground">Monitor performa keuangan, profitabilitas toko, dan statistik penjualan.</p>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3">
                        <Select value={preset} onValueChange={setPreset}>
                            <SelectTrigger className="w-[180px]">
                                <IconCalendar className="mr-2 h-4 w-4 text-muted-foreground" />
                                <SelectValue placeholder="Pilih Filter Tanggal" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="today">Hari Ini</SelectItem>
                                <SelectItem value="yesterday">Kemarin</SelectItem>
                                <SelectItem value="this_week">Minggu Ini</SelectItem>
                                <SelectItem value="this_month">Bulan Ini</SelectItem>
                                <SelectItem value="last_month">Bulan Lalu</SelectItem>
                                <SelectItem value="custom">Kustom Tanggal</SelectItem>
                            </SelectContent>
                        </Select>

                        {preset === 'custom' && (
                            <form onSubmit={handleCustomRangeSubmit} className="flex items-center gap-2">
                                <Input 
                                    type="date" 
                                    value={customRange.start_date}
                                    onChange={e => setCustomRange(prev => ({ ...prev, start_date: e.target.value }))}
                                    required 
                                    className="w-36 h-9"
                                />
                                <span className="text-muted-foreground text-sm">s/d</span>
                                <Input 
                                    type="date" 
                                    value={customRange.end_date}
                                    onChange={e => setCustomRange(prev => ({ ...prev, end_date: e.target.value }))}
                                    required 
                                    className="w-36 h-9"
                                />
                                <button type="submit" className="px-3 py-1.5 bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-semibold rounded-lg transition-colors">
                                    Terapkan
                                </button>
                            </form>
                        )}

                        {isLoading && <IconLoader className="animate-spin text-primary size-5" />}
                    </div>
                </div>

                {/* Key Metrics Cards */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {/* Revenue Card */}
                    <Card className="bg-gradient-to-br from-primary/10 via-card to-card">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <span className="text-sm font-medium text-muted-foreground">Pendapatan Kotor</span>
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
                            <p className="text-xs text-muted-foreground mt-1">Total seluruh invoice masuk</p>
                        </CardContent>
                    </Card>

                    {/* Net Profit Card */}
                    <Card className="bg-gradient-to-br from-emerald-500/10 via-card to-card">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <span className="text-sm font-medium text-muted-foreground">Keuntungan Bersih</span>
                            <IconTrendingUp className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold tracking-tight">
                                {isLoading || !dashboardData ? (
                                    <div className="h-7 w-32 bg-muted animate-pulse rounded" />
                                ) : (
                                    formatCurrency(dashboardData.metrics.total_net_profit)
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Selisih harga jual dengan modal</p>
                        </CardContent>
                    </Card>

                    {/* Transactions Count Card */}
                    <Card className="bg-gradient-to-br from-indigo-500/10 via-card to-card">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <span className="text-sm font-medium text-muted-foreground">Jumlah Transaksi</span>
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
                            <p className="text-xs text-muted-foreground mt-1">Total nota checkout lunas</p>
                        </CardContent>
                    </Card>

                    {/* Total Products Sold Card */}
                    <Card className="bg-gradient-to-br from-amber-500/10 via-card to-card">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <span className="text-sm font-medium text-muted-foreground">Produk Terjual</span>
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
                            <p className="text-xs text-muted-foreground mt-1">Item barang keluar toko</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Area */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    
                    {/* Area Chart: Sales Trend (Revenue & profit) */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Tren Keuangan Harian</CardTitle>
                            <CardDescription>Visualisasi perbandingan pendapatan kotor dan laba bersih</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading || !dashboardData ? (
                                <div className="h-[250px] w-full bg-muted animate-pulse rounded-lg" />
                            ) : dashboardData.trend_chart.length === 0 ? (
                                <div className="h-[250px] w-full flex items-center justify-center border border-dashed rounded-lg text-muted-foreground">
                                    Tidak ada data untuk periode ini
                                </div>
                            ) : (
                                <ChartContainer config={chartConfig} className="aspect-auto h-62.5 w-full">
                                    <AreaChart data={dashboardData.trend_chart}>
                                        <defs>
                                            <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.8}/>
                                                <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.1}/>
                                            </linearGradient>
                                            <linearGradient id="fillProfit" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="var(--color-profit)" stopOpacity={0.8}/>
                                                <stop offset="95%" stopColor="var(--color-profit)" stopOpacity={0.1}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid vertical={false} />
                                        <XAxis 
                                            dataKey="date" 
                                            tickLine={false} 
                                            axisLine={false}
                                            tickFormatter={(value) => {
                                                const parts = value.split('-');
                                                return `${parts[2]}/${parts[1]}`;
                                            }}
                                        />
                                        <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                                        <Area dataKey="revenue" type="monotone" fill="url(#fillRevenue)" stroke="var(--color-revenue)" name="revenue" />
                                        <Area dataKey="profit" type="monotone" fill="url(#fillProfit)" stroke="var(--color-profit)" name="profit" />
                                    </AreaChart>
                                </ChartContainer>
                            )}
                        </CardContent>
                    </Card>

                    {/* Bar Chart: Best Selling Products */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Produk Terlaris</CardTitle>
                            <CardDescription>Top 5 produk dengan penjualan terbanyak</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading || !dashboardData ? (
                                <div className="h-[250px] w-full bg-muted animate-pulse rounded-lg" />
                            ) : dashboardData.top_products.length === 0 ? (
                                <div className="h-[250px] w-full flex items-center justify-center border border-dashed rounded-lg text-muted-foreground">
                                    Tidak ada data produk
                                </div>
                            ) : (
                                <ChartContainer config={topProductsConfig} className="aspect-auto h-62.5 w-full">
                                    <BarChart data={dashboardData.top_products} layout="vertical" margin={{ left: 10, right: 10 }}>
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={100} style={{ fontSize: '10px' }} />
                                        <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                                        <Bar dataKey="quantity" fill="var(--color-quantity)" radius={4} name="quantity" />
                                    </BarChart>
                                </ChartContainer>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Transactions & Low Stock Products Side-by-Side */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Recent Transactions Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Transaksi Terbaru</CardTitle>
                            <CardDescription>Daftar nota penjualan lunas di rentang filter terpilih</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading || !dashboardData ? (
                                <div className="space-y-2">
                                    <div className="h-6 w-full bg-muted animate-pulse rounded" />
                                    <div className="h-6 w-full bg-muted animate-pulse rounded" />
                                    <div className="h-6 w-full bg-muted animate-pulse rounded" />
                                </div>
                            ) : dashboardData.recent_transactions.length === 0 ? (
                                <div className="py-6 text-center border border-dashed rounded-lg text-muted-foreground text-sm">
                                    Tidak ada transaksi di rentang tanggal ini.
                                </div>
                            ) : (
                                <div className="overflow-x-auto rounded-lg border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Waktu</TableHead>
                                                <TableHead>No. Invoice</TableHead>
                                                <TableHead>Kasir</TableHead>
                                                <TableHead>Pembayaran</TableHead>
                                                <TableHead className="text-right">Total</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {dashboardData.recent_transactions.map((tx: any) => (
                                                <TableRow key={tx.id}>
                                                    <TableCell className="text-xs">{tx.created_at}</TableCell>
                                                    <TableCell className="font-semibold text-xs text-primary">{tx.invoice_number}</TableCell>
                                                    <TableCell className="text-xs">{tx.user_name}</TableCell>
                                                    <TableCell className="text-xs">
                                                        <Badge variant="secondary">{tx.payment_method_name}</Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium text-xs">
                                                        {formatCurrency(tx.total_amount)}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Low Stock Products */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Stok Menipis</CardTitle>
                            <CardDescription>Daftar produk dengan jumlah stok paling sedikit (non-unlimited)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading || !dashboardData ? (
                                <div className="space-y-2">
                                    <div className="h-6 w-full bg-muted animate-pulse rounded" />
                                    <div className="h-6 w-full bg-muted animate-pulse rounded" />
                                    <div className="h-6 w-full bg-muted animate-pulse rounded" />
                                </div>
                            ) : dashboardData.low_stock_products.length === 0 ? (
                                <div className="py-6 text-center border border-dashed rounded-lg text-muted-foreground text-sm">
                                    Semua stok produk mencukupi.
                                </div>
                            ) : (
                                <div className="overflow-x-auto rounded-lg border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>SKU</TableHead>
                                                <TableHead>Nama Produk</TableHead>
                                                <TableHead className="text-right">Harga</TableHead>
                                                <TableHead className="text-right">Sisa Stok</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {dashboardData.low_stock_products.map((product: any) => (
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
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

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
