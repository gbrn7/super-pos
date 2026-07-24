import {
    IconChevronLeft,
    IconChevronRight,
    IconChevronsLeft,
    IconChevronsRight,
} from '@tabler/icons-react';
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    type ColumnDef,
    type SortingState,
} from '@tanstack/react-table';
import { RotateCcw, Search, Calendar, CreditCard, User as UserIcon, X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import type { PaymentMethod } from '@/support/models/paymentMethod';
import type { User } from '@/support/models/user';

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    users: User[];
    paymentMethods: PaymentMethod[];
    processing: boolean;
    queryParam: any;
    pagination: any;
    onQueryParamChange: (key: string, value: any) => void;
    onResetFilter: () => void;
    onChangePaginationPage: (page: number) => void;
    onChangePaginationLimit: (limit: number) => void;
    limitOptions: number[];
}

export function DataTable<TData, TValue>({
    columns,
    data,
    users,
    paymentMethods,
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
    const [sorting, setSorting] = useState<SortingState>([]);

    const isFilterActive = Boolean(
        queryParam.keyword ||
        queryParam.user_id ||
        queryParam.payment_method_id ||
        queryParam.start_date ||
        queryParam.end_date
    );

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        state: {
            sorting,
        },
        onSortingChange: setSorting,
        manualSorting: true,
    });

    return (
        <div className="space-y-4">
            {/* Top Reset Action Bar */}
            {isFilterActive && (
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={onResetFilter} size="sm" className="h-8">
                        <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                        {t('component.data_table.reset_filter', 'Reset Filter')}
                    </Button>
                </div>
            )}

            {/* Filter and Search Section */}
            <div className="second-row grid grid-cols-1 gap-2 gap-y-3 rounded-md border p-3 md:grid-cols-2 lg:grid-cols-3">
                {/* Keyword Filter */}
                <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">
                        {t('component.data_table.search_component.search_label', 'Pencarian')}
                    </Label>
                    <div className="keyword-filter flex w-full gap-1">
                        <div className="relative w-full">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder={t('page.profit.filters.search_invoice', 'Cari Invoice...')}
                                value={queryParam.keyword || ''}
                                onChange={(e) => onQueryParamChange('keyword', e.target.value)}
                                className="pl-8 w-full"
                            />
                        </div>
                    </div>
                </div>

                {/* Cashier / User Filter */}
                <div className="space-y-1.5">
                    <Label className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                        <UserIcon className="h-3.5 w-3.5" />
                        {t('page.transaction.dialog_modal.detail_dialog.cashier_label', 'Kasir / Petugas')}
                    </Label>
                    <Select
                        value={queryParam.user_id ? String(queryParam.user_id) : 'all'}
                        onValueChange={(val) => onQueryParamChange('user_id', val === 'all' ? null : Number(val))}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder={t('page.profit.filters.all_cashiers', 'Semua Kasir')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('page.profit.filters.all_cashiers', 'Semua Kasir')}</SelectItem>
                            {users.map((u) => (
                                <SelectItem key={u.id} value={String(u.id)}>{u.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Payment Method Filter */}
                <div className="space-y-1.5">
                    <Label className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                        <CreditCard className="h-3.5 w-3.5" />
                        {t('page.transaction.dialog_modal.detail_dialog.payment_method_label', 'Metode Pembayaran')}
                    </Label>
                    <Select
                        value={queryParam.payment_method_id ? String(queryParam.payment_method_id) : 'all'}
                        onValueChange={(val) => onQueryParamChange('payment_method_id', val === 'all' ? null : Number(val))}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder={t('page.profit.filters.all_payments', 'Semua Metode')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('page.profit.filters.all_payments', 'Semua Metode')}</SelectItem>
                            {paymentMethods.map((pm) => (
                                <SelectItem key={pm.id} value={String(pm.id)}>{pm.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Start Date Filter */}
                <div className="space-y-1.5">
                    <Label className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        Tanggal Mulai
                    </Label>
                    <Input
                        type="date"
                        value={queryParam.start_date || ''}
                        onChange={(e) => onQueryParamChange('start_date', e.target.value)}
                        className="w-full"
                    />
                </div>

                {/* End Date Filter */}
                <div className="space-y-1.5">
                    <Label className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        Tanggal Akhir
                    </Label>
                    <Input
                        type="date"
                        value={queryParam.end_date || ''}
                        onChange={(e) => onQueryParamChange('end_date', e.target.value)}
                        className="w-full"
                    />
                </div>

            </div>

            {/* Active Filter Badges */}
            {isFilterActive && (
                <div className="col-span-full flex flex-wrap items-center gap-1.5 pt-2 text-xs">
                    <span className="mr-1 font-medium text-muted-foreground">
                        {t('component.data_table.active_filters', 'Filter Aktif:')}
                    </span>

                    {queryParam.keyword && (
                        <Badge
                            variant="secondary"
                            className="gap-1.5 bg-muted/50 px-2 py-0.5 text-xs font-normal hover:bg-muted"
                        >
                            <span>
                                {t('component.data_table.search_component.search_label', 'Pencarian')}: "{queryParam.keyword}"
                            </span>
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

                    {queryParam.user_id && (
                        <Badge
                            variant="secondary"
                            className="gap-1.5 bg-muted/50 px-2 py-0.5 text-xs font-normal hover:bg-muted"
                        >
                            <span>
                                {t('page.transaction.dialog_modal.detail_dialog.cashier_label', 'Kasir')}:{' '}
                                {users.find((u) => u.id === queryParam.user_id)?.name || queryParam.user_id}
                            </span>
                            <button
                                type="button"
                                onClick={() => onQueryParamChange('user_id', null)}
                                className="ml-0.5 rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-muted-foreground/20 hover:text-foreground"
                            >
                                <X className="h-3 w-3" />
                                <span className="sr-only">Hapus filter kasir</span>
                            </button>
                        </Badge>
                    )}

                    {queryParam.payment_method_id && (
                        <Badge
                            variant="secondary"
                            className="gap-1.5 bg-muted/50 px-2 py-0.5 text-xs font-normal hover:bg-muted"
                        >
                            <span>
                                {t('page.transaction.dialog_modal.detail_dialog.payment_method_label', 'Metode Bayar')}:{' '}
                                {paymentMethods.find((pm) => pm.id === queryParam.payment_method_id)?.name || queryParam.payment_method_id}
                            </span>
                            <button
                                type="button"
                                onClick={() => onQueryParamChange('payment_method_id', null)}
                                className="ml-0.5 rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-muted-foreground/20 hover:text-foreground"
                            >
                                <X className="h-3 w-3" />
                                <span className="sr-only">Hapus filter metode pembayaran</span>
                            </button>
                        </Badge>
                    )}

                    {queryParam.start_date && (
                        <Badge
                            variant="secondary"
                            className="gap-1.5 bg-muted/50 px-2 py-0.5 text-xs font-normal hover:bg-muted"
                        >
                            <span>Mulai: {queryParam.start_date}</span>
                            <button
                                type="button"
                                onClick={() => onQueryParamChange('start_date', '')}
                                className="ml-0.5 rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-muted-foreground/20 hover:text-foreground"
                            >
                                <X className="h-3 w-3" />
                                <span className="sr-only">Hapus filter tanggal mulai</span>
                            </button>
                        </Badge>
                    )}

                    {queryParam.end_date && (
                        <Badge
                            variant="secondary"
                            className="gap-1.5 bg-muted/50 px-2 py-0.5 text-xs font-normal hover:bg-muted"
                        >
                            <span>Akhir: {queryParam.end_date}</span>
                            <button
                                type="button"
                                onClick={() => onQueryParamChange('end_date', '')}
                                className="ml-0.5 rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-muted-foreground/20 hover:text-foreground"
                            >
                                <X className="h-3 w-3" />
                                <span className="sr-only">Hapus filter tanggal akhir</span>
                            </button>
                        </Badge>
                    )}
                </div>
            )}

            {/* Table */}
            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                  header.column.columnDef.header,
                                                  header.getContext(),
                                              )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {processing ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    {t('component.data_table.loading', 'Memuat...')}
                                </TableCell>
                            </TableRow>
                        ) : data.length > 0 ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext(),
                                            )}
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
                    {table.getFilteredSelectedRowModel().rows.length} dari {pagination.total} baris terpilih
                </div>
                <div className="flex w-full items-center gap-8 lg:w-fit">
                    <Select
                        value={queryParam.limit.toString()}
                        onValueChange={(value) => onChangePaginationLimit(Number(value))}
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
                    <div className="text-sm text-muted-foreground">
                        Halaman {pagination.current_page} dari {pagination.last_page}
                    </div>
                    <div className="ml-auto flex items-center gap-2 lg:ml-0">
                        <Button
                            variant="outline"
                            className="hidden h-8 w-8 p-0 lg:flex"
                            onClick={() => onChangePaginationPage(1)}
                            disabled={pagination.current_page == 1 || processing}
                        >
                            <span className="sr-only">Go to first page</span>
                            <IconChevronsLeft />
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
                            disabled={pagination.current_page == 1 || processing}
                        >
                            <span className="sr-only">Go to previous page</span>
                            <IconChevronLeft />
                        </Button>
                        <Button
                            variant="outline"
                            className="size-8"
                            size="icon"
                            onClick={() => {
                                if (pagination.current_page != pagination.last_page) {
                                    onChangePaginationPage(pagination.current_page + 1);
                                }
                            }}
                            disabled={pagination.current_page == pagination.last_page || processing}
                        >
                            <span className="sr-only">Go to next page</span>
                            <IconChevronRight />
                        </Button>
                        <Button
                            variant="outline"
                            className="hidden size-8 lg:flex"
                            size="icon"
                            onClick={() => onChangePaginationPage(pagination.last_page)}
                            disabled={pagination.current_page == pagination.last_page || processing}
                        >
                            <span className="sr-only">Go to last page</span>
                            <IconChevronsRight />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
