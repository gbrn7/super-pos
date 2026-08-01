import {
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import type {
    ColumnDef,
    SortingState,
    ColumnFiltersState,
    VisibilityState,
    PaginationState,
    RowSelectionState,
} from '@tanstack/react-table';
import * as React from 'react';
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
import { CreateDialog } from './dialog-modal/create-dialog';
import { BulkDeleteDialog } from './dialog-modal/bulk-delete-dialog';
import type { Category } from '@/support/models/category';
import { ImportExcelDialog } from './dialog-modal/import-excel-dialog';
import { ExportDropdownMenu } from './export-data-menu/export-dropdown-menu';
import { useTranslation } from 'react-i18next';
import { sprintf } from 'sprintf-js';
import { DetailDialog } from './dialog-modal/detail-dialog';
import { EditDialog } from './dialog-modal/edit-dialog';
import { DeleteDialog } from './dialog-modal/delete-dialog';
import {
    IconChevronLeft,
    IconChevronRight,
    IconChevronsLeft,
    IconChevronsRight,
} from '@tabler/icons-react';
import { TableIcon, RotateCcw, X } from 'lucide-react';
import { Can } from '@/components/auth/can';
import { Badge } from '@/components/ui/badge';
import { PERMISSIONENUMS } from '@/support/enums/PermissionEnums';

interface DataTableProps<TData, TValue> {
    columns:
        | ColumnDef<TData, TValue>[]
        | ((props: any) => ColumnDef<TData, TValue>[]);
    data: TData[];
    processing?: boolean;
    limitOptions?: number[];
    onRefresh: () => void;
    detailDataOpen: boolean;
    editOpen: boolean;
    deleteOpen: boolean;
    setDetailOpen: (open: boolean) => void;
    setEditOpen: (open: boolean) => void;
    setDeleteOpen: (open: boolean) => void;
    onDetailClick: (data: TData) => void;
    onEditClick: (data: TData) => void;
    onDeleteClick: (data: TData) => void;
    onBulkDeleteClick?: (data: TData[]) => void;
    isBulkDeleteDialogOpen: boolean;
    setOpenBulkDeleteDialogOpen: (open: boolean) => void;
    selectedBulkCategories: Category[];
    selectedCategory: Category | null;
    rowSelection: RowSelectionState;
    setRowSelection: React.Dispatch<React.SetStateAction<RowSelectionState>>;
}
export function DataTable<TData, TValue>({
    columns: columnsOrFn,
    data,
    processing,
    limitOptions = [10, 20, 50, 100],
    onRefresh,
    detailDataOpen,
    editOpen,
    deleteOpen,
    setDetailOpen,
    setEditOpen,
    setDeleteOpen,
    onDetailClick,
    onEditClick,
    onDeleteClick,
    onBulkDeleteClick,
    isBulkDeleteDialogOpen,
    setOpenBulkDeleteDialogOpen,
    selectedBulkCategories,
    selectedCategory,
    rowSelection,
    setRowSelection,
}: DataTableProps<TData, TValue>) {
    const { t } = useTranslation();

    const columns =
        typeof columnsOrFn === 'function'
            ? columnsOrFn({ onDetailClick, onEditClick, onDeleteClick })
            : columnsOrFn;

    const [sorting, setSorting] = React.useState<SortingState>([]);

    const [columnFilters, setColumnFilters] =
        React.useState<ColumnFiltersState>([]);

    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({});

    const [pagination, setPagination] = React.useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });

    const [searchColumn, setSearchColumn] = React.useState<string>(
        t('page.category.data_table.columns.name_column_label', 'Nama'),
    );

    const table = useReactTable({
        data,
        columns,
        getRowId: (row: any) => row.id,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        onPaginationChange: setPagination,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            pagination,
        },
    });

    return (
        <div className="rounded-2xl border p-3">
            <div className="flex flex-col justify-between gap-3 pb-4">
                <div className="flex items-center justify-start gap-2 overflow-auto sm:justify-end lg:mt-0">
                    {table.getState().columnFilters.length > 0 && (
                        <Button
                            variant="outline"
                            onClick={() => table.setColumnFilters([])}
                        >
                            <RotateCcw className="mr-1.5 h-4 w-4" />
                            {t(
                                'component.data_table.reset_filter',
                                'Reset Filter',
                            )}
                        </Button>
                    )}
                    <Can permission={PERMISSIONENUMS.CATEGORY.CREATE}>
                        <ImportExcelDialog onSuccess={onRefresh} />
                    </Can>
                    <Can permission={PERMISSIONENUMS.CATEGORY.READ}>
                        <ExportDropdownMenu data={data} />
                    </Can>
                    <Can permission={PERMISSIONENUMS.CATEGORY.DELETE}>
                        <BulkDeleteDialog
                            isDisabled={!(Object.keys(rowSelection).length > 0)}
                            selectedLength={Object.keys(rowSelection).length}
                            isOpen={isBulkDeleteDialogOpen}
                            onSuccess={() => {
                                onRefresh();
                                setRowSelection({});
                            }}
                            setOpen={setOpenBulkDeleteDialogOpen}
                            categories={Object.keys(rowSelection).map(
                                (id) => ({ id: Number(id) }) as Category,
                            )}
                            onBulkDeleteClick={() => {
                                const selectedRows = Object.keys(
                                    rowSelection,
                                ).map((id) => ({ id: Number(id) }) as Category);
                                onBulkDeleteClick?.(selectedRows as any);
                            }}
                        />
                    </Can>
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
                    <Can permission={PERMISSIONENUMS.CATEGORY.CREATE}>
                        <CreateDialog onSuccess={onRefresh} />
                    </Can>
                </div>

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
                                value={searchColumn}
                                onValueChange={setSearchColumn}
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
                                        <SelectItem
                                            value={t(
                                                'page.category.data_table.columns.name_column_label',
                                                'Nama',
                                            )}
                                        >
                                            {t(
                                                'component.data_table.search_component.name',
                                                'Nama',
                                            )}
                                        </SelectItem>
                                        <SelectItem
                                            value={t(
                                                'page.category.data_table.columns.description_column_label',
                                                'Deskripsi',
                                            )}
                                        >
                                            {t(
                                                'component.data_table.search_component.description',
                                                'Deskripsi',
                                            )}
                                        </SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            <Input
                                placeholder={t(
                                    'component.data_table.search_component.placeholder',
                                    'Telusuri',
                                )}
                                value={
                                    (table
                                        .getColumn(searchColumn)
                                        ?.getFilterValue() as string) ?? ''
                                }
                                onChange={(event) => {
                                    table
                                        .getColumn(searchColumn)
                                        ?.setFilterValue(event.target.value);
                                }}
                                className="w-full"
                            />
                        </div>
                    </div>

                    {/* Active Filter Badges */}
                    {table.getState().columnFilters.length > 0 && (
                        <div className="col-span-full flex flex-wrap items-center gap-1.5 border-t pt-2 text-xs">
                            <span className="mr-1 font-medium text-muted-foreground">
                                {t(
                                    'component.data_table.active_filters',
                                    'Filter Aktif:',
                                )}
                            </span>
                            {table.getState().columnFilters.map((filter) => (
                                <Badge
                                    key={filter.id}
                                    variant="secondary"
                                    className="gap-1.5 bg-muted/50 px-2 py-0.5 text-xs font-normal hover:bg-muted"
                                >
                                    <span>
                                        {filter.id}: "{String(filter.value)}"
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            table.setColumnFilters(
                                                table
                                                    .getState()
                                                    .columnFilters.filter(
                                                        (f) =>
                                                            f.id !== filter.id,
                                                    ),
                                            )
                                        }
                                        className="ml-0.5 rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-muted-foreground/20 hover:text-foreground"
                                    >
                                        <X className="h-3 w-3" />
                                        <span className="sr-only">
                                            Hapus filter {filter.id}
                                        </span>
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <div className="overflow-hidden rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder ? null : (
                                                <div
                                                    onClick={header.column.getToggleSortingHandler()}
                                                    className="flex cursor-pointer items-center gap-2 select-none hover:text-foreground"
                                                >
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
                            Array.from({ length: pagination.pageSize }).map(
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
                                    className="h-24 text-center"
                                >
                                    {t(
                                        'component.data_table.no_result',
                                        'Tidak ada hasil',
                                    )}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                <DetailDialog
                    isOpen={detailDataOpen}
                    category={selectedCategory}
                    onOpenChange={setDetailOpen}
                />

                <EditDialog
                    isOpen={editOpen}
                    onSuccess={onRefresh}
                    setOpen={setEditOpen}
                    category={selectedCategory}
                    key={selectedCategory?.id}
                />

                <DeleteDialog
                    isOpen={deleteOpen}
                    onSuccess={onRefresh}
                    setOpen={setDeleteOpen}
                    category={selectedCategory}
                />
            </div>
            <div className="flex items-center justify-end space-x-4 overflow-auto py-4">
                <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
                    {sprintf(
                        t(
                            'component.data_table.selected_row',
                            '%d dari %d baris terpilih.',
                        ),
                        table.getFilteredSelectedRowModel().rows.length,
                        table.getFilteredRowModel().rows.length,
                    )}
                </div>
                <div className="flex w-full items-center gap-8 lg:w-fit">
                    <Select
                        value={pagination.pageSize.toString()}
                        onValueChange={(value) => {
                            table.setPageSize(Number(value));
                        }}
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
                    <div className="text-sm text-muted-foreground">
                        {sprintf(
                            t(
                                'component.data_table.pagination_info',
                                'Halaman %d dari %d',
                            ),
                            table.getState().pagination.pageIndex + 1,
                            table.getPageCount(),
                        )}
                    </div>
                    <div className="ml-auto flex items-center gap-2 lg:ml-0">
                        <Button
                            variant="outline"
                            className="hidden h-8 w-8 p-0 lg:flex"
                            onClick={() => table.setPageIndex(0)}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <span className="sr-only">Go to first page</span>
                            <IconChevronsLeft />
                        </Button>
                        <Button
                            variant="outline"
                            className="size-8"
                            size="icon"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <span className="sr-only">Go to previous page</span>
                            <IconChevronLeft />
                        </Button>
                        <Button
                            variant="outline"
                            className="size-8"
                            size="icon"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            <span className="sr-only">Go to next page</span>
                            <IconChevronRight />
                        </Button>
                        <Button
                            variant="outline"
                            className="hidden size-8 lg:flex"
                            size="icon"
                            onClick={() =>
                                table.setPageIndex(table.getPageCount() - 1)
                            }
                            disabled={!table.getCanNextPage()}
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
