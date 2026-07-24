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
import { RefreshCw, Search } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    onRefresh: () => void;
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
    onRefresh,
    onChangePaginationPage,
    onChangePaginationLimit,
    limitOptions,
}: DataTableProps<TData, TValue>) {
    const { t } = useTranslation();
    const [sorting, setSorting] = useState<SortingState>([]);

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
            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-end">
                <div className="flex-1 min-w-[200px] relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={t('page.profit.filters.search_invoice', 'Cari Invoice...')}
                        value={queryParam.keyword || ''}
                        onChange={(e) => onQueryParamChange('keyword', e.target.value)}
                        className="pl-8"
                    />
                </div>

                <div className="w-[180px]">
                    <Select
                        value={queryParam.user_id ? String(queryParam.user_id) : 'all'}
                        onValueChange={(val) => onQueryParamChange('user_id', val === 'all' ? null : Number(val))}
                    >
                        <SelectTrigger>
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

                <div className="w-[180px]">
                    <Select
                        value={queryParam.payment_method_id ? String(queryParam.payment_method_id) : 'all'}
                        onValueChange={(val) => onQueryParamChange('payment_method_id', val === 'all' ? null : Number(val))}
                    >
                        <SelectTrigger>
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

                <div className="flex gap-2">
                    <Input
                        type="date"
                        value={queryParam.start_date || ''}
                        onChange={(e) => onQueryParamChange('start_date', e.target.value)}
                        className="w-[140px]"
                    />
                    <span className="self-center text-muted-foreground">-</span>
                    <Input
                        type="date"
                        value={queryParam.end_date || ''}
                        onChange={(e) => onQueryParamChange('end_date', e.target.value)}
                        className="w-[140px]"
                    />
                </div>

                <Button variant="outline" onClick={onResetFilter}>
                    {t('page.profit.filters.reset_btn', 'Reset')}
                </Button>
                <Button variant="outline" size="icon" onClick={onRefresh} disabled={processing}>
                    <RefreshCw className={`h-4 w-4 ${processing ? 'animate-spin' : ''}`} />
                </Button>
            </div>

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
