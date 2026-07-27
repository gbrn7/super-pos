import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    type ColumnDef,
} from '@tanstack/react-table';
import {
    IconChevronLeft,
    IconChevronRight,
    IconChevronsLeft,
    IconChevronsRight,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { sprintf } from 'sprintf-js';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, Search, Calendar, CreditCard, ArrowUpDown, X, Table as TableIcon } from 'lucide-react';

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    processing: boolean;
    queryParam: {
        page: number;
        limit: number;
        keyword: string;
        type: string;
        transaction_type: string;
        start_date: number | null;
        end_date: number | null;
    };
    pagination: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    onQueryParamChange: (key: string, value: any) => void;
    onResetFilter: () => void;
    onChangePaginationPage: (page: number) => void;
    onChangePaginationLimit: (limit: number) => void;
    limitOptions: number[];
}

export function DataTable<TData, TValue>({
    columns,
    data,
    processing,
    queryParam,
    pagination,
    onQueryParamChange,
    onResetFilter,
    onChangePaginationPage,
    onChangePaginationLimit,
    limitOptions,
}: DataTableProps<TData, TValue>) {
    const { t } = useTranslation();

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    const isFilterActive =
        queryParam.keyword !== '' ||
        queryParam.type !== '' ||
        queryParam.transaction_type !== '' ||
        queryParam.start_date !== null ||
        queryParam.end_date !== null;

    return (
        <div className="rounded-2xl border bg-card p-3 space-y-4">
            {/* Top Action Bar */}
            <div className="flex justify-end gap-2 items-center">
                {isFilterActive && (
                    <Button variant="outline" onClick={onResetFilter} size="sm" className="h-8" disabled={processing}>
                        <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                        {t('component.data_table.reset_filter', 'Reset Filter')}
                    </Button>
                )}

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8">
                            <TableIcon className="mr-1.5 h-4 w-4" />
                            {t('component.data_table.columns.label', 'Kolom')}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {table
                            .getAllColumns()
                            .filter((column) => column.getCanHide())
                            .map((column) => (
                                <DropdownMenuCheckboxItem
                                    key={column.id}
                                    className="capitalize"
                                    checked={column.getIsVisible()}
                                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                                >
                                    {column.id}
                                </DropdownMenuCheckboxItem>
                            ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Filter and Search Section */}
            <div className="second-row grid grid-cols-1 gap-2 gap-y-3 rounded-md border p-3 md:grid-cols-2 lg:grid-cols-3">
                {/* Keyword Search */}
                <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">
                        {t('component.data_table.search_component.search_label', 'Pencarian')}
                    </Label>
                    <div className="relative w-full">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder={t('page.profit.filters.keyword_placeholder', 'Cari Catatan / Rujukan...')}
                            value={queryParam.keyword || ''}
                            onChange={(e) => onQueryParamChange('keyword', e.target.value)}
                            disabled={processing}
                            className="pl-8 w-full"
                        />
                    </div>
                </div>

                {/* Arah Aliran (Type) */}
                <div className="space-y-1.5">
                    <Label className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                        <ArrowUpDown className="h-3.5 w-3.5" />
                        {t('page.profit_wallet.data_table.filters.type_label', 'Arah Aliran')}
                    </Label>
                    <Select
                        value={queryParam.type || 'all'}
                        onValueChange={(val) => onQueryParamChange('type', val === 'all' ? '' : val)}
                        disabled={processing}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder={t('page.profit_wallet.data_table.filters.type_placeholder', 'Semua Arah')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('page.profit_wallet.data_table.filters.type_placeholder', 'Semua Arah')}</SelectItem>
                            <SelectItem value="in">{t('page.profit_wallet.data_table.filters.direction_in', 'Uang Masuk')}</SelectItem>
                            <SelectItem value="out">{t('page.profit_wallet.data_table.filters.direction_out', 'Uang Keluar')}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Jenis Transaksi */}
                <div className="space-y-1.5">
                    <Label className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                        <CreditCard className="h-3.5 w-3.5" />
                        {t('page.profit_wallet.data_table.filters.tx_type_label', 'Jenis Transaksi')}
                    </Label>
                    <Select
                        value={queryParam.transaction_type || 'all'}
                        onValueChange={(val) => onQueryParamChange('transaction_type', val === 'all' ? '' : val)}
                        disabled={processing}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder={t('page.profit_wallet.data_table.filters.tx_type_placeholder', 'Semua Jenis')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('page.profit_wallet.data_table.filters.tx_type_placeholder', 'Semua Jenis')}</SelectItem>
                            <SelectItem value="sales_profit">{t('page.profit_wallet.data_table.filters.tx_sales_profit', 'Keuntungan Penjualan')}</SelectItem>
                            <SelectItem value="disbursement">{t('page.profit_wallet.data_table.filters.tx_disbursement', 'Pencairan Profit')}</SelectItem>
                            <SelectItem value="capital_withdrawal">{t('page.profit_wallet.data_table.filters.tx_capital_withdrawal', 'Penarikan Modal')}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Tanggal Mulai */}
                <div className="space-y-1.5">
                    <Label className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        {t('page.profit_wallet.data_table.filters.start_date_label', 'Mulai')}
                    </Label>
                    <Input
                        type="date"
                        value={
                            queryParam.start_date
                                ? new Date(queryParam.start_date * 1000)
                                      .toISOString()
                                      .slice(0, 10)
                                : ''
                        }
                        onChange={(e) => {
                            if (e.target.value) {
                                const [year, month, day] = e.target.value.split('-').map(Number);
                                const startDate = new Date(year, month - 1, day, 0, 0, 0, 0);
                                onQueryParamChange('start_date', Math.floor(startDate.getTime() / 1000));
                            } else {
                                onQueryParamChange('start_date', null);
                            }
                        }}
                        disabled={processing}
                        className="w-full"
                    />
                </div>

                {/* Tanggal Akhir */}
                <div className="space-y-1.5">
                    <Label className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        {t('page.profit_wallet.data_table.filters.end_date_label', 'Hingga')}
                    </Label>
                    <Input
                        type="date"
                        value={
                            queryParam.end_date
                                ? new Date(queryParam.end_date * 1000)
                                      .toISOString()
                                      .slice(0, 10)
                                : ''
                        }
                        onChange={(e) => {
                            if (e.target.value) {
                                const [year, month, day] = e.target.value.split('-').map(Number);
                                const endDate = new Date(year, month - 1, day, 23, 59, 59, 999);
                                onQueryParamChange('end_date', Math.floor(endDate.getTime() / 1000));
                            } else {
                                onQueryParamChange('end_date', null);
                            }
                        }}
                        disabled={processing}
                        className="w-full"
                    />
                </div>
            </div>

            {/* Active Filter Badges */}
            {isFilterActive && (
                <div className="col-span-full flex flex-wrap items-center gap-1.5 pt-2 text-xs">
                    <span className="text-muted-foreground">{t('page.profit.filters.active_filters', 'Filter Aktif:')}</span>
                    {queryParam.keyword && (
                        <Badge variant="secondary" className="gap-1 font-normal py-0.5 px-2 bg-muted/50 hover:bg-muted">
                            "{queryParam.keyword}"
                            <button
                                type="button"
                                onClick={() => onQueryParamChange('keyword', '')}
                                className="ml-0.5 rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-muted-foreground/20 hover:text-foreground"
                            >
                                <X className="h-3 w-3" />
                                <span className="sr-only">Hapus filter pencarian</span>
                            </button>
                        </Badge>
                    )}
                    {queryParam.type && (
                        <Badge variant="secondary" className="gap-1 font-normal py-0.5 px-2 bg-muted/50 hover:bg-muted">
                            {queryParam.type === 'in' ? t('page.profit_wallet.data_table.filters.direction_in', 'Uang Masuk') : t('page.profit_wallet.data_table.filters.direction_out', 'Uang Keluar')}
                            <button
                                type="button"
                                onClick={() => onQueryParamChange('type', '')}
                                className="ml-0.5 rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-muted-foreground/20 hover:text-foreground"
                            >
                                <X className="h-3 w-3" />
                                <span className="sr-only">Hapus filter arah aliran</span>
                            </button>
                        </Badge>
                    )}
                    {queryParam.transaction_type && (
                        <Badge variant="secondary" className="gap-1 font-normal py-0.5 px-2 bg-muted/50 hover:bg-muted">
                            {queryParam.transaction_type === 'sales_profit' ? t('page.profit_wallet.data_table.filters.tx_sales_profit', 'Keuntungan') : queryParam.transaction_type === 'disbursement' ? t('page.profit_wallet.data_table.filters.tx_disbursement', 'Pencairan') : t('page.profit_wallet.data_table.filters.tx_capital_withdrawal', 'Modal')}
                            <button
                                type="button"
                                onClick={() => onQueryParamChange('transaction_type', '')}
                                className="ml-0.5 rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-muted-foreground/20 hover:text-foreground"
                            >
                                <X className="h-3 w-3" />
                                <span className="sr-only">Hapus filter jenis transaksi</span>
                            </button>
                        </Badge>
                    )}
                    {queryParam.start_date && (
                        <Badge variant="secondary" className="gap-1 font-normal py-0.5 px-2 bg-muted/50 hover:bg-muted">
                            {t('page.profit_wallet.data_table.filters.start_date_label', 'Mulai')}: {new Date(queryParam.start_date * 1000).toISOString().slice(0, 10)}
                            <button
                                type="button"
                                onClick={() => onQueryParamChange('start_date', null)}
                                className="ml-0.5 rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-muted-foreground/20 hover:text-foreground"
                            >
                                <X className="h-3 w-3" />
                                <span className="sr-only">{t('component.data_table.remove_start_date_filter', 'Hapus filter tanggal mulai')}</span>
                            </button>
                        </Badge>
                    )}
                    {queryParam.end_date && (
                        <Badge variant="secondary" className="gap-1 font-normal py-0.5 px-2 bg-muted/50 hover:bg-muted">
                            {t('page.profit_wallet.data_table.filters.end_date_badge_label', 'Akhir')}: {new Date(queryParam.end_date * 1000).toISOString().slice(0, 10)}
                            <button
                                type="button"
                                onClick={() => onQueryParamChange('end_date', null)}
                                className="ml-0.5 rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-muted-foreground/20 hover:text-foreground"
                            >
                                <X className="h-3 w-3" />
                                <span className="sr-only">{t('component.data_table.remove_end_date_filter', 'Hapus filter tanggal akhir')}</span>
                            </button>
                        </Badge>
                    )}
                </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {processing ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                                    {t('component.data_table.loading', 'Memuat...')}
                                </TableCell>
                            </TableRow>
                        ) : data.length > 0 ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                                    {t('component.data_table.no_data', 'Tidak ada data.')}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Footer */}
            <div className="flex flex-col items-center justify-between gap-4 border-t px-2 py-4 lg:flex-row">
                <div className="text-sm text-muted-foreground">
                    {sprintf(
                        t(
                            'component.data_table.pagination_info_total',
                            'Halaman %d dari %d (%d total data)',
                        ),
                        pagination.current_page,
                        pagination.last_page,
                        pagination.total,
                    )}
                </div>
                <div className="flex w-full items-center gap-8 lg:w-fit">
                    <Select
                        value={queryParam.limit.toString()}
                        onValueChange={(value) => onChangePaginationLimit(Number(value))}
                        disabled={processing}
                    >
                        <SelectTrigger className="w-20">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>
                                    {t('component.data_table.row_per_page', 'Baris per halaman')}
                                </SelectLabel>
                                {limitOptions.map((option) => (
                                    <SelectItem key={option} value={option.toString()}>
                                        {option}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    <div className="ml-auto flex items-center gap-2 lg:ml-0">
                        <Button
                            variant="outline"
                            className="hidden h-8 w-8 p-0 lg:flex"
                            onClick={() => onChangePaginationPage(1)}
                            disabled={pagination.current_page === 1 || processing}
                        >
                            <span className="sr-only">{t('component.data_table.pagination.first_page', 'Halaman Pertama')}</span>
                            <IconChevronsLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="size-8"
                            size="icon"
                            onClick={() => {
                                if (pagination.current_page - 1 > 0) {
                                    onChangePaginationPage(pagination.current_page - 1);
                                }
                            }}
                            disabled={pagination.current_page === 1 || processing}
                        >
                            <span className="sr-only">{t('component.data_table.pagination.prev_page', 'Halaman Sebelumnya')}</span>
                            <IconChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="size-8"
                            size="icon"
                            onClick={() => {
                                if (pagination.current_page !== pagination.last_page) {
                                    onChangePaginationPage(pagination.current_page + 1);
                                }
                            }}
                            disabled={pagination.current_page === pagination.last_page || processing}
                        >
                            <span className="sr-only">{t('component.data_table.pagination.next_page', 'Halaman Selanjutnya')}</span>
                            <IconChevronRight className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="hidden size-8 lg:flex"
                            size="icon"
                            onClick={() => onChangePaginationPage(pagination.last_page)}
                            disabled={pagination.current_page === pagination.last_page || processing}
                        >
                            <span className="sr-only">{t('component.data_table.pagination.last_page', 'Halaman Terakhir')}</span>
                            <IconChevronsRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
