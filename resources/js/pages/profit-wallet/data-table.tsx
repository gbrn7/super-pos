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
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

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
        start_date: string;
        end_date: string;
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
        queryParam.start_date !== '' ||
        queryParam.end_date !== '';

    return (
        <div className="space-y-4">
            <div className="rounded-2xl border p-3 bg-card">
                <div className="flex justify-between items-center gap-2 overflow-auto mb-3">
                    <h3 className="font-semibold text-lg">{t('page.profit_wallet.data_table.table_title', 'Mutasi Dompet')}</h3>
                    <Button variant="outline" size="sm" onClick={onResetFilter} disabled={processing}>
                        {t('page.profit.filters.reset', 'Reset Filter')}
                    </Button>
                </div>
                <div className="second-row grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4 border p-3 rounded-md mb-3">
                    <div>
                        <Label className="text-xs font-medium text-muted-foreground">
                            {t('page.profit_wallet.data_table.filters.keyword', 'Kata Kunci')}
                        </Label>
                        <Input
                            placeholder={t('page.profit.filters.keyword_placeholder', 'Cari Catatan / Invoice...')}
                            value={queryParam.keyword}
                            onChange={(e) => onQueryParamChange('keyword', e.target.value)}
                            disabled={processing}
                            className="mt-1"
                        />
                    </div>
                    <div>
                        <Label className="text-xs font-medium text-muted-foreground">
                            {t('page.profit_wallet.data_table.filters.type_label', 'Arah Aliran')}
                        </Label>
                        <Select
                            value={queryParam.type || 'all'}
                            onValueChange={(val) => onQueryParamChange('type', val === 'all' ? '' : val)}
                            disabled={processing}
                        >
                            <SelectTrigger className="mt-1">
                                <SelectValue placeholder={t('page.profit_wallet.data_table.filters.type_placeholder', 'Semua Arah')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t('page.profit_wallet.data_table.filters.type_placeholder', 'Semua Arah')}</SelectItem>
                                <SelectItem value="in">{t('page.profit_wallet.data_table.filters.direction_in', 'Uang Masuk')}</SelectItem>
                                <SelectItem value="out">{t('page.profit_wallet.data_table.filters.direction_out', 'Uang Keluar')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label className="text-xs font-medium text-muted-foreground">
                            {t('page.profit_wallet.data_table.filters.tx_type_label', 'Jenis Transaksi')}
                        </Label>
                        <Select
                            value={queryParam.transaction_type || 'all'}
                            onValueChange={(val) => onQueryParamChange('transaction_type', val === 'all' ? '' : val)}
                            disabled={processing}
                        >
                            <SelectTrigger className="mt-1">
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
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <Label className="text-xs font-medium text-muted-foreground">{t('page.profit.filters.start_date', 'Mulai')}</Label>
                            <Input
                                type="date"
                                value={queryParam.start_date}
                                onChange={(e) => onQueryParamChange('start_date', e.target.value)}
                                disabled={processing}
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label className="text-xs font-medium text-muted-foreground">{t('page.profit.filters.end_date', 'Hingga')}</Label>
                            <Input
                                type="date"
                                value={queryParam.end_date}
                                onChange={(e) => onQueryParamChange('end_date', e.target.value)}
                                disabled={processing}
                                className="mt-1"
                            />
                        </div>
                    </div>

                    {isFilterActive && (
                        <div className="col-span-full flex flex-wrap items-center gap-1.5 pt-2 border-t text-xs">
                            <span className="text-muted-foreground">{t('page.profit.filters.active_filters', 'Filter Aktif:')}</span>
                            {queryParam.keyword && (
                                <Badge variant="secondary" className="gap-1 font-normal py-0.5 px-2 bg-muted/50 hover:bg-muted">
                                    "{queryParam.keyword}"
                                    <X className="h-3 w-3 cursor-pointer" onClick={() => onQueryParamChange('keyword', '')} />
                                </Badge>
                            )}
                            {queryParam.type && (
                                <Badge variant="secondary" className="gap-1 font-normal py-0.5 px-2 bg-muted/50 hover:bg-muted">
                                    {queryParam.type === 'in' ? t('page.profit_wallet.data_table.filters.direction_in', 'Uang Masuk') : t('page.profit_wallet.data_table.filters.direction_out', 'Uang Keluar')}
                                    <X className="h-3 w-3 cursor-pointer" onClick={() => onQueryParamChange('type', '')} />
                                </Badge>
                            )}
                            {queryParam.transaction_type && (
                                <Badge variant="secondary" className="gap-1 font-normal py-0.5 px-2 bg-muted/50 hover:bg-muted">
                                    {queryParam.transaction_type === 'sales_profit' ? t('page.profit_wallet.data_table.filters.tx_sales_profit', 'Keuntungan') : queryParam.transaction_type === 'disbursement' ? t('page.profit_wallet.data_table.filters.tx_disbursement', 'Pencairan') : t('page.profit_wallet.data_table.filters.tx_capital_withdrawal', 'Modal')}
                                    <X className="h-3 w-3 cursor-pointer" onClick={() => onQueryParamChange('transaction_type', '')} />
                                </Badge>
                            )}
                            {(queryParam.start_date || queryParam.end_date) && (
                                <Badge variant="secondary" className="gap-1 font-normal py-0.5 px-2 bg-muted/50 hover:bg-muted">
                                    {queryParam.start_date || '*'} s/d {queryParam.end_date || '*'}
                                    <X className="h-3 w-3 cursor-pointer" onClick={() => {
                                        onQueryParamChange('start_date', '');
                                        onQueryParamChange('end_date', '');
                                    }} />
                                </Badge>
                            )}
                        </div>
                    )}
                </div>

                <div className="rounded-md border bg-card">
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
            </div>

            {/* Pagination Footer */}
            <div className="flex flex-col items-center justify-between gap-4 border-t px-2 py-4 lg:flex-row">
                <div className="text-sm text-muted-foreground">
                    Halaman {pagination.current_page} dari {pagination.last_page} ({pagination.total} total data)
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
                            <span className="sr-only">Go to first page</span>
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
                            <span className="sr-only">Go to previous page</span>
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
                            <span className="sr-only">Go to next page</span>
                            <IconChevronRight className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="hidden size-8 lg:flex"
                            size="icon"
                            onClick={() => onChangePaginationPage(pagination.last_page)}
                            disabled={pagination.current_page === pagination.last_page || processing}
                        >
                            <span className="sr-only">Go to last page</span>
                            <IconChevronsRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
