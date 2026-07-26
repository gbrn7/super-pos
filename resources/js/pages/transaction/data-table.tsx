import {
    IconChevronLeft,
    IconChevronRight,
    IconChevronsLeft,
    IconChevronsRight,
} from '@tabler/icons-react';
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import type {
    ColumnDef,
    SortingState,
    ColumnFiltersState,
    VisibilityState,
    RowSelectionState,
} from '@tanstack/react-table';
import {
    TableIcon,
    Calendar,
    CreditCard,
    User as UserIcon,
    RotateCcw,
    X,
} from 'lucide-react';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { sprintf } from 'sprintf-js';
import type { StoreSetting } from '@/components/receipt-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Skeleton } from '@/components/ui/skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import type { TransactionQueryParam } from '@/support/interfaces/request/transaction';
import type { Pagination } from '@/support/interfaces/resource/pagination';
import type { PaymentMethod } from '@/support/models/paymentMethod';
import type { Transaction } from '@/support/models/transaction';
import type { User } from '@/support/models/user';
import { DetailDialog } from './dialog-modal/detail-dialog';

interface DataTableProps<TData, TValue> {
    columns:
        | ColumnDef<TData, TValue>[]
        | ((props: any) => ColumnDef<TData, TValue>[]);
    data: TData[];
    paymentMethods?: PaymentMethod[];
    users?: User[];
    processing?: boolean;
    limitOptions?: number[];
    onRefresh: () => void;
    detailDataOpen: boolean;
    setDetailOpen: (open: boolean) => void;
    onDetailClick: (data: TData) => void;
    selectedTransaction: Transaction | null;
    queryParam: TransactionQueryParam;
    pagination: Pagination;
    onQueryParamChange?: <K extends keyof TransactionQueryParam>(
        key: K,
        value: TransactionQueryParam[K],
    ) => void;
    onResetFilter?: () => void;
    onChangePaginationPage: (page: number) => void;
    onChangePaginationLimit: (limit: number) => void;
    onChangeField: (field: string) => void;
    onChangeUser?: (userId: number | null) => void;
    onChangePaymentMethod?: (paymentMethodId: number | null) => void;
    onChangeKeyword: (keyword: string) => void;
    onChangeStartDate: (date: string) => void;
    onChangeEndDate: (date: string) => void;
    setQueryParam: React.Dispatch<React.SetStateAction<TransactionQueryParam>>;
    rowSelection: RowSelectionState;
    setRowSelection: React.Dispatch<React.SetStateAction<RowSelectionState>>;
    storeSetting?: StoreSetting | null;
}

export function DataTable<TData, TValue>({
    columns: columnsOrFn,
    data,
    paymentMethods = [],
    users = [],
    processing,
    limitOptions = [10, 20, 50, 100],
    detailDataOpen,
    setDetailOpen,
    onDetailClick,
    selectedTransaction,
    queryParam,
    pagination,
    onResetFilter,
    onChangePaginationPage,
    onChangePaginationLimit,
    onChangeField,
    onChangeUser,
    onChangePaymentMethod,
    onChangeKeyword,
    onChangeStartDate,
    onChangeEndDate,
    setQueryParam,
    rowSelection,
    setRowSelection,
    storeSetting,
}: DataTableProps<TData, TValue>) {
    const { t } = useTranslation();

    const columns =
        typeof columnsOrFn === 'function'
            ? columnsOrFn({
                  onDetailClick,
                  onSortChange: (
                      orderBy: string | null,
                      order: string | null,
                  ) => {
                      setQueryParam((prev) => ({
                          ...prev,
                          order_by: orderBy,
                          order: order as 'asc' | 'desc' | null,
                          page: 1,
                      }));
                  },
                  order: queryParam.order,
                  orderBy: queryParam.order_by,
              })
            : columnsOrFn;

    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] =
        React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({});

    const table = useReactTable({
        data,
        columns,
        getRowId: (row: any) => row.id,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        columnResizeMode: 'onChange',
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    });

    const isFilterActive = Boolean(
        queryParam.keyword ||
        queryParam.user_id ||
        queryParam.payment_method_id ||
        queryParam.start_date ||
        queryParam.end_date ||
        (queryParam.field && queryParam.field !== 'default'),
    );

    return (
        <div className="rounded-2xl border bg-card p-3">
            <div className="flex flex-col justify-between gap-3 pb-4">
                <div className="flex items-center justify-end gap-2 overflow-auto">
                    {isFilterActive && onResetFilter && (
                        <Button variant="outline" onClick={onResetFilter}>
                            <RotateCcw className="mr-1.5 h-4 w-4" />
                            {t(
                                'component.data_table.reset_filter',
                                'Reset Filter',
                            )}
                        </Button>
                    )}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                                <TableIcon className="mr-1.5 h-4 w-4" />
                                {t(
                                    'component.data_table.columns.label',
                                    'Kolom',
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {table
                                .getAllColumns()
                                .filter((column) => column.getCanHide())
                                .map((column) => {
                                    return (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            className="capitalize"
                                            checked={column.getIsVisible()}
                                            onCheckedChange={(value) =>
                                                column.toggleVisibility(!!value)
                                            }
                                        >
                                            {column.id}
                                        </DropdownMenuCheckboxItem>
                                    );
                                })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Filter and Search Section */}
                <div className="second-row grid grid-cols-1 gap-2 gap-y-3 rounded-md border p-3 md:grid-cols-2 lg:grid-cols-3">
                    {/* Keyword Filter */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-muted-foreground">
                            {t(
                                'component.data_table.search_component.search_label',
                                'Pencarian',
                            )}
                        </Label>
                        <div className="keyword-filter flex w-full gap-1">
                            <Select
                                value={queryParam.field}
                                onValueChange={(value) => onChangeField(value)}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>
                                            {t(
                                                'component.data_table.search_component.search_by',
                                                'Pencarian berdasarkan',
                                            )}
                                        </SelectLabel>
                                        <SelectItem value="default">
                                            {t(
                                                'component.data_table.search_component.default',
                                                'Bawaan',
                                            )}
                                        </SelectItem>
                                        <SelectItem value="invoice_number">
                                            {t('component.data_table.search_component.invoice_number', 'No. Invoice')}
                                        </SelectItem>
                                        <SelectItem value="payment_method_name">
                                            {t('component.data_table.search_component.payment_method_name', 'Metode Pembayaran')}
                                        </SelectItem>
                                        <SelectItem value="user_name">
                                            {t('component.data_table.search_component.user_name', 'Kasir / Petugas')}
                                        </SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            <Input
                                placeholder={t(
                                    'component.data_table.search_component.placeholder',
                                    'Telusuri...',
                                )}
                                value={queryParam.keyword}
                                onChange={(event) =>
                                    onChangeKeyword(event.target.value)
                                }
                                className="w-full"
                            />
                        </div>
                    </div>

                    {/* Cashier / User Filter */}
                    <div className="space-y-1.5">
                        <Label className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                            <UserIcon className="h-3.5 w-3.5" />
                            {t(
                                'page.transaction.dialog_modal.detail_dialog.cashier_label',
                                'Kasir / Petugas',
                            )}
                        </Label>
                        <Select
                            value={
                                queryParam.user_id
                                    ? String(queryParam.user_id)
                                    : 'all'
                            }
                            onValueChange={(value) => {
                                if (onChangeUser) {
                                    onChangeUser(
                                        value === 'all' ? null : Number(value),
                                    );
                                }
                            }}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue
                                    placeholder={t(
                                        'component.data_table.all_cashiers',
                                        'Semua Kasir',
                                    )}
                                />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    {t(
                                        'component.data_table.all_cashiers',
                                        'Semua Kasir',
                                    )}
                                </SelectItem>
                                {users?.map((u) => (
                                    <SelectItem key={u.id} value={String(u.id)}>
                                        {u.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Payment Method Filter */}
                    <div className="space-y-1.5">
                        <Label className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                            <CreditCard className="h-3.5 w-3.5" />
                            {t(
                                'page.transaction.dialog_modal.detail_dialog.payment_method_label',
                                'Metode Pembayaran',
                            )}
                        </Label>
                        <Select
                            value={
                                queryParam.payment_method_id
                                    ? String(queryParam.payment_method_id)
                                    : 'all'
                            }
                            onValueChange={(value) => {
                                if (onChangePaymentMethod) {
                                    onChangePaymentMethod(
                                        value === 'all' ? null : Number(value),
                                    );
                                }
                            }}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue
                                    placeholder={t(
                                        'component.data_table.all_payment_methods',
                                        'Semua Metode Pembayaran',
                                    )}
                                />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    {t(
                                        'component.data_table.all_payment_methods',
                                        'Semua Metode Pembayaran',
                                    )}
                                </SelectItem>
                                {paymentMethods?.map((pm) => (
                                    <SelectItem
                                        key={pm.id}
                                        value={String(pm.id)}
                                    >
                                        {pm.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Start Date Filter */}
                    <div className="space-y-1.5">
                        <Label className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            {t('component.data_table.filter.start_date_label', 'Tanggal Mulai')}
                        </Label>
                        <Input
                            type="date"
                            value={queryParam.start_date || ''}
                            onChange={(e) => onChangeStartDate(e.target.value)}
                            className="w-full"
                        />
                    </div>

                    {/* End Date Filter */}
                    <div className="space-y-1.5">
                        <Label className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            {t('component.data_table.filter.end_date_label', 'Tanggal Akhir')}
                        </Label>
                        <Input
                            type="date"
                            value={queryParam.end_date || ''}
                            onChange={(e) => onChangeEndDate(e.target.value)}
                            className="w-full"
                        />
                    </div>

                    {/* Active Filter Badges */}
                    {isFilterActive && (
                        <div className="col-span-full flex flex-wrap items-center gap-1.5 border-t pt-2 text-xs">
                            <span className="mr-1 font-medium text-muted-foreground">
                                {t(
                                    'component.data_table.active_filters',
                                    'Filter Aktif:',
                                )}
                            </span>

                            {queryParam.keyword && (
                                <Badge
                                    variant="secondary"
                                    className="gap-1.5 bg-muted/50 px-2 py-0.5 text-xs font-normal hover:bg-muted"
                                >
                                    <span>
                                        {t(
                                            'component.data_table.search_component.search_label',
                                            'Pencarian',
                                        )}
                                        : "{queryParam.keyword}"
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => onChangeKeyword('')}
                                        className="ml-0.5 rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-muted-foreground/20 hover:text-foreground"
                                    >
                                        <X className="h-3 w-3" />
                                        <span className="sr-only">
                                            Hapus filter pencarian
                                        </span>
                                    </button>
                                </Badge>
                            )}

                            {queryParam.user_id && (
                                <Badge
                                    variant="secondary"
                                    className="gap-1.5 bg-muted/50 px-2 py-0.5 text-xs font-normal hover:bg-muted"
                                >
                                    <span>
                                        {t(
                                            'page.transaction.dialog_modal.detail_dialog.cashier_label',
                                            'Kasir',
                                        )}
                                        :{' '}
                                        {users?.find(
                                            (u) => u.id === queryParam.user_id,
                                        )?.name || queryParam.user_id}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            onChangeUser && onChangeUser(null)
                                        }
                                        className="ml-0.5 rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-muted-foreground/20 hover:text-foreground"
                                    >
                                        <X className="h-3 w-3" />
                                        <span className="sr-only">
                                            Hapus filter kasir
                                        </span>
                                    </button>
                                </Badge>
                            )}

                            {queryParam.payment_method_id && (
                                <Badge
                                    variant="secondary"
                                    className="gap-1.5 bg-muted/50 px-2 py-0.5 text-xs font-normal hover:bg-muted"
                                >
                                    <span>
                                        {t(
                                            'page.transaction.dialog_modal.detail_dialog.payment_method_label',
                                            'Metode Pembayaran',
                                        )}
                                        :{' '}
                                        {paymentMethods?.find(
                                            (pm) =>
                                                pm.id ===
                                                queryParam.payment_method_id,
                                        )?.name || queryParam.payment_method_id}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            onChangePaymentMethod &&
                                            onChangePaymentMethod(null)
                                        }
                                        className="ml-0.5 rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-muted-foreground/20 hover:text-foreground"
                                    >
                                        <X className="h-3 w-3" />
                                        <span className="sr-only">
                                            Hapus filter metode pembayaran
                                        </span>
                                    </button>
                                </Badge>
                            )}

                            {queryParam.start_date && (
                                <Badge
                                    variant="secondary"
                                    className="gap-1.5 bg-muted/50 px-2 py-0.5 text-xs font-normal hover:bg-muted"
                                >
                                    <span>
                                        {t('component.data_table.filter.start_date_label', 'Tanggal Mulai')}: {queryParam.start_date}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => onChangeStartDate('')}
                                        className="ml-0.5 rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-muted-foreground/20 hover:text-foreground"
                                    >
                                        <X className="h-3 w-3" />
                                        <span className="sr-only">
                                            {t('component.data_table.remove_start_date_filter', 'Hapus filter tanggal mulai')}
                                        </span>
                                    </button>
                                </Badge>
                            )}

                            {queryParam.end_date && (
                                <Badge
                                    variant="secondary"
                                    className="gap-1.5 bg-muted/50 px-2 py-0.5 text-xs font-normal hover:bg-muted"
                                >
                                    <span>
                                        {t('component.data_table.filter.end_date_label', 'Tanggal Akhir')}: {queryParam.end_date}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => onChangeEndDate('')}
                                        className="ml-0.5 rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-muted-foreground/20 hover:text-foreground"
                                    >
                                        <X className="h-3 w-3" />
                                        <span className="sr-only">
                                            {t('component.data_table.remove_end_date_filter', 'Hapus filter tanggal akhir')}
                                        </span>
                                    </button>
                                </Badge>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Main Table */}
            <div className="overflow-x-auto rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead
                                            key={header.id}
                                            style={{
                                                width: `${header.getSize()}px`,
                                            }}
                                        >
                                            {header.isPlaceholder ? null : (
                                                <div className="flex cursor-pointer items-center gap-2 select-none hover:text-foreground">
                                                    {flexRender(
                                                        header.column.columnDef
                                                            .header,
                                                        header.getContext(),
                                                    )}
                                                </div>
                                            )}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {processing ? (
                            Array.from({ length: queryParam.limit || 10 }).map(
                                (_, index) => (
                                    <TableRow key={index}>
                                        {table.getAllColumns().map((column) => (
                                            <TableCell key={column.id}>
                                                <Skeleton className="h-6 w-full" />
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ),
                            )
                        ) : table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={
                                        row.getIsSelected() && 'selected'
                                    }
                                >
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
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-28 text-center text-muted-foreground"
                                >
                                    {t(
                                        'component.data_table.no_result',
                                        'Tidak ada data transaksi.',
                                    )}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

                {/* Detail Modal */}
                <DetailDialog
                    isOpen={detailDataOpen}
                    transaction={selectedTransaction}
                    onOpenChange={setDetailOpen}
                    storeSetting={storeSetting}
                />
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-end space-x-4 overflow-auto py-4">
                <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
                    {sprintf(
                        t(
                            'component.data_table.selected_row',
                            '%d dari %d baris terpilih',
                        ),
                        table.getFilteredSelectedRowModel().rows.length,
                        pagination.total || 0,
                    )}
                </div>
                <div className="flex w-full items-center gap-6 lg:w-fit">
                    <Select
                        value={queryParam.limit.toString()}
                        onValueChange={(value) =>
                            onChangePaginationLimit(Number(value))
                        }
                    >
                        <SelectTrigger className="w-20">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>
                                    {t(
                                        'component.data_table.row_per_page',
                                        'Baris per halaman',
                                    )}
                                </SelectLabel>
                                {limitOptions.map((option) => (
                                    <SelectItem
                                        key={option}
                                        value={option.toString()}
                                    >
                                        {option}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    <div className="text-sm whitespace-nowrap text-muted-foreground">
                        {sprintf(
                            t(
                                'component.data_table.pagination_info',
                                'Halaman %d dari %d',
                            ),
                            pagination.current_page || 1,
                            pagination.last_page || 1,
                        )}
                    </div>
                    <div className="ml-auto flex items-center gap-2 lg:ml-0">
                        <Button
                            variant="outline"
                            className="hidden h-8 w-8 p-0 lg:flex"
                            onClick={() => {
                                setQueryParam((prev) => ({
                                    ...prev,
                                    page: 1,
                                }));
                                onChangePaginationPage(1);
                            }}
                            disabled={
                                (pagination.current_page || 1) <= 1 || processing
                            }
                        >
                            <span className="sr-only">{t('component.data_table.pagination.first_page', 'Halaman Pertama')}</span>
                            <IconChevronsLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="size-8"
                            size="icon"
                            onClick={() => {
                                const prevPage = (pagination.current_page || 1) - 1;
                                if (prevPage > 0) {
                                    setQueryParam((prev) => ({
                                        ...prev,
                                        page: prevPage,
                                    }));
                                    onChangePaginationPage(prevPage);
                                }
                            }}
                            disabled={
                                (pagination.current_page || 1) <= 1 || processing
                            }
                        >
                            <span className="sr-only">{t('component.data_table.pagination.prev_page', 'Halaman Sebelumnya')}</span>
                            <IconChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="size-8"
                            size="icon"
                            onClick={() => {
                                const nextPage = (pagination.current_page || 1) + 1;
                                const lastPage = pagination.last_page || 1;
                                if (nextPage <= lastPage) {
                                    setQueryParam((prev) => ({
                                        ...prev,
                                        page: nextPage,
                                    }));
                                    onChangePaginationPage(nextPage);
                                }
                            }}
                            disabled={
                                (pagination.current_page || 1) >=
                                    (pagination.last_page || 1) || processing
                            }
                        >
                            <span className="sr-only">{t('component.data_table.pagination.next_page', 'Halaman Selanjutnya')}</span>
                            <IconChevronRight className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="hidden size-8 lg:flex"
                            size="icon"
                            onClick={() => {
                                const lastPage = pagination.last_page || 1;
                                setQueryParam((prev) => ({
                                    ...prev,
                                    page: lastPage,
                                }));
                                onChangePaginationPage(lastPage);
                            }}
                            disabled={
                                (pagination.current_page || 1) >=
                                    (pagination.last_page || 1) || processing
                            }
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
