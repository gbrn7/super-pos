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
} from '@tanstack/react-table';
import type { ColumnDef, VisibilityState } from '@tanstack/react-table';
import {
    RotateCcw,
    X,
    TableIcon,
    Calendar as CalendarIcon,
} from 'lucide-react';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { sprintf } from 'sprintf-js';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
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
import { PAGINATIONLIMITOPTIONDEFAULT } from '@/constants/Index';
import type { Pagination } from '@/support/interfaces/resource/pagination';
import { DetailDialog as TransactionDetailDialog } from '../transaction/dialog-modal/detail-dialog';
import type { ReturnItem } from './columns';
import { DetailDialog } from './dialog-modal/detail-dialog';

export interface ReturnQueryParam {
    limit: number;
    page: number;
    field: string;
    keyword: string;
    start_date: string | null;
    end_date: string | null;
}

interface DataTableProps {
    columns:
        | ColumnDef<ReturnItem>[]
        | ((props: {
              onDetailClick: (item: ReturnItem) => void;
              onInvoiceClick: (transactionId: number) => void;
          }) => ColumnDef<ReturnItem>[]);
    data: ReturnItem[];
    loading?: boolean;
    pagination: Pagination;
    queryParam: ReturnQueryParam;
    onResetFilter: () => void;
    onChangePaginationLimit: (limit: number) => void;
    onChangePaginationPage: (page: number) => void;
    onChangeField: (field: string) => void;
    onChangeKeyword: (keyword: string) => void;
    onChangeStartDate: (date: string | null) => void;
    onChangeEndDate: (date: string | null) => void;
    onDetailClick: (item: ReturnItem) => void;
    onInvoiceClick: (transactionId: number) => void;
    detailOpen: boolean;
    setDetailOpen: (open: boolean) => void;
    selectedReturn: ReturnItem | null;
    txDetailOpen: boolean;
    setTxDetailOpen: (open: boolean) => void;
    selectedTxId: number | null;
    limitOptions?: number[];
}

export function DataTable({
    columns,
    data,
    loading = false,
    pagination,
    queryParam,
    onResetFilter,
    onChangePaginationLimit,
    onChangePaginationPage,
    onChangeField,
    onChangeKeyword,
    onChangeStartDate,
    onChangeEndDate,
    onDetailClick,
    onInvoiceClick,
    detailOpen,
    setDetailOpen,
    selectedReturn,
    txDetailOpen,
    setTxDetailOpen,
    selectedTxId,
    limitOptions = PAGINATIONLIMITOPTIONDEFAULT,
}: DataTableProps) {
    const { t } = useTranslation();
    const [openStartDate, setOpenStartDate] = React.useState(false);
    const [openEndDate, setOpenEndDate] = React.useState(false);
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({});

    const tableColumns = React.useMemo(() => {
        return typeof columns === 'function'
            ? columns({
                  onDetailClick,
                  onInvoiceClick,
              })
            : columns;
    }, [columns, onDetailClick, onInvoiceClick]);

    const table = useReactTable({
        data,
        columns: tableColumns,
        getCoreRowModel: getCoreRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        state: {
            columnVisibility,
        },
    });

    const isFilterActive = Boolean(
        queryParam.keyword ||
        queryParam.start_date ||
        queryParam.end_date ||
        (queryParam.field && queryParam.field !== 'default'),
    );

    return (
        <div className="mt-4 rounded-2xl border bg-card p-3">
            {/* Header Filter Actions */}
            <div className="flex flex-col justify-between gap-3 pb-4">
                <div className="flex items-center justify-end gap-2">
                    {isFilterActive && (
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
                                <TableIcon className="h-4" />
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

                {/* Search and Filters grid */}
                <div className="second-row grid grid-cols-1 gap-2 gap-y-3 rounded-md border p-3 md:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-muted-foreground">
                            {t(
                                'component.data_table.search_component.search_label',
                                'Pencarian',
                            )}
                        </Label>
                        <div className="keyword-filter flex w-full gap-1">
                            <Select
                                value={queryParam.field}
                                onValueChange={onChangeField}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel className="text-sm">
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
                                        <SelectItem value="return_number">
                                            {t(
                                                'component.data_table.search_component.return_number',
                                                'No. Retur',
                                            )}
                                        </SelectItem>
                                        <SelectItem value="invoice_number">
                                            {t(
                                                'component.data_table.search_component.invoice_number',
                                                'No. Invoice',
                                            )}
                                        </SelectItem>
                                        <SelectItem value="user_name">
                                            {t(
                                                'component.data_table.search_component.user_name',
                                                'Kasir / Petugas',
                                            )}
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

                    {/* Start Date Filter */}
                    <div className="space-y-1.5">
                        <Label className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
                            <CalendarIcon className="h-4 w-4" />
                            {t(
                                'component.data_table.filter.start_date_label',
                                'Tanggal Mulai',
                            )}
                        </Label>
                        <Popover
                            open={openStartDate}
                            onOpenChange={setOpenStartDate}
                        >
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    disabled={loading}
                                    className="h-9 w-full justify-start text-left text-sm font-normal"
                                >
                                    {queryParam.start_date ? (
                                        new Date(
                                            queryParam.start_date,
                                        ).toLocaleDateString('id-ID')
                                    ) : (
                                        <span className="text-muted-foreground">
                                            {t(
                                                'component.data_table.filter.start_date_label',
                                                'Pilih Tanggal Mulai',
                                            )}
                                        </span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                className="w-auto p-0"
                                align="start"
                            >
                                <CalendarPicker
                                    mode="single"
                                    selected={
                                        queryParam.start_date
                                            ? new Date(queryParam.start_date)
                                            : undefined
                                    }
                                    onSelect={(date) => {
                                        if (date) {
                                            const year = date.getFullYear();
                                            const month = String(
                                                date.getMonth() + 1,
                                            ).padStart(2, '0');
                                            const day = String(
                                                date.getDate(),
                                            ).padStart(2, '0');
                                            onChangeStartDate(
                                                `${year}-${month}-${day}`,
                                            );
                                            setOpenStartDate(false);
                                        } else {
                                            onChangeStartDate(null);
                                        }
                                    }}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* End Date Filter */}
                    <div className="space-y-1.5">
                        <Label className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
                            <CalendarIcon className="h-4 w-4" />
                            {t(
                                'component.data_table.filter.end_date_label',
                                'Tanggal Akhir',
                            )}
                        </Label>
                        <Popover
                            open={openEndDate}
                            onOpenChange={setOpenEndDate}
                        >
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    disabled={loading}
                                    className="h-9 w-full justify-start text-left text-sm font-normal"
                                >
                                    {queryParam.end_date ? (
                                        new Date(
                                            queryParam.end_date,
                                        ).toLocaleDateString('id-ID')
                                    ) : (
                                        <span className="text-muted-foreground">
                                            {t(
                                                'component.data_table.filter.end_date_label',
                                                'Pilih Tanggal Akhir',
                                            )}
                                        </span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                className="w-auto p-0"
                                align="start"
                            >
                                <CalendarPicker
                                    mode="single"
                                    selected={
                                        queryParam.end_date
                                            ? new Date(queryParam.end_date)
                                            : undefined
                                    }
                                    onSelect={(date) => {
                                        if (date) {
                                            const year = date.getFullYear();
                                            const month = String(
                                                date.getMonth() + 1,
                                            ).padStart(2, '0');
                                            const day = String(
                                                date.getDate(),
                                            ).padStart(2, '0');
                                            onChangeEndDate(
                                                `${year}-${month}-${day}`,
                                            );
                                            setOpenEndDate(false);
                                        } else {
                                            onChangeEndDate(null);
                                        }
                                    }}
                                />
                            </PopoverContent>
                        </Popover>
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

                            {queryParam.start_date && (
                                <Badge
                                    variant="secondary"
                                    className="gap-1.5 bg-muted/50 px-2 py-0.5 text-xs font-normal hover:bg-muted"
                                >
                                    <span>
                                        {t(
                                            'component.data_table.filter.start_date_label',
                                            'Tanggal Mulai',
                                        )}
                                        : {queryParam.start_date}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => onChangeStartDate(null)}
                                        className="ml-0.5 rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-muted-foreground/20 hover:text-foreground"
                                    >
                                        <X className="h-3 w-3" />
                                        <span className="sr-only">
                                            {t(
                                                'component.data_table.remove_start_date_filter',
                                                'Hapus filter tanggal mulai',
                                            )}
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
                                        {t(
                                            'component.data_table.filter.end_date_label',
                                            'Tanggal Akhir',
                                        )}
                                        : {queryParam.end_date}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => onChangeEndDate(null)}
                                        className="ml-0.5 rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-muted-foreground/20 hover:text-foreground"
                                    >
                                        <X className="h-3 w-3" />
                                        <span className="sr-only">
                                            {t(
                                                'component.data_table.remove_end_date_filter',
                                                'Hapus filter tanggal akhir',
                                            )}
                                        </span>
                                    </button>
                                </Badge>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <div className="overflow-x-auto rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                  header.column.columnDef
                                                      .header,
                                                  header.getContext(),
                                              )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            Array.from({
                                length: queryParam.limit,
                            }).map((_, idx) => (
                                <TableRow key={idx}>
                                    <TableCell>
                                        <Skeleton className="h-5 w-24" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-5 w-32" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-5 w-24" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-5 w-28" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-5 w-36" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-5 w-16" />
                                    </TableCell>
                                </TableRow>
                            ))
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
                                    colSpan={tableColumns.length}
                                    className="h-28 text-center text-muted-foreground"
                                >
                                    {t(
                                        'page.return.no_data',
                                        'Belum ada riwayat retur barang.',
                                    )}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-end space-x-4 overflow-auto py-4">
                <div className="flex w-full items-center gap-8 lg:w-fit">
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
                            pagination.current_page,
                            pagination.last_page,
                        )}
                    </div>
                    <div className="ml-auto flex items-center gap-2 lg:ml-0">
                        <Button
                            variant="outline"
                            className="hidden h-8 w-8 p-0 lg:flex"
                            onClick={() => onChangePaginationPage(1)}
                            disabled={pagination.current_page === 1 || loading}
                        >
                            <span className="sr-only">Go to first page</span>
                            <IconChevronsLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => {
                                if (pagination.current_page - 1 > 0) {
                                    onChangePaginationPage(
                                        pagination.current_page - 1,
                                    );
                                }
                            }}
                            disabled={pagination.current_page === 1 || loading}
                        >
                            <span className="sr-only">Go to previous page</span>
                            <IconChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => {
                                if (
                                    pagination.current_page !==
                                    pagination.last_page
                                ) {
                                    onChangePaginationPage(
                                        pagination.current_page + 1,
                                    );
                                }
                            }}
                            disabled={
                                pagination.current_page ===
                                    pagination.last_page || loading
                            }
                        >
                            <span className="sr-only">Go to next page</span>
                            <IconChevronRight className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="hidden h-8 w-8 p-0 lg:flex"
                            onClick={() =>
                                onChangePaginationPage(pagination.last_page)
                            }
                            disabled={
                                pagination.current_page ===
                                    pagination.last_page || loading
                            }
                        >
                            <span className="sr-only">Go to last page</span>
                            <IconChevronsRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Detail Modal */}
            <DetailDialog
                isOpen={detailOpen}
                returnItem={selectedReturn}
                onOpenChange={setDetailOpen}
            />

            <TransactionDetailDialog
                isOpen={txDetailOpen}
                transaction={
                    selectedTxId ? ({ id: selectedTxId } as any) : null
                }
                onOpenChange={setTxDetailOpen}
            />
        </div>
    );
}
