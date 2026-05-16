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
import { useTranslation } from 'react-i18next';
import { sprintf } from 'sprintf-js';
import { DetailDialog } from './dialog-modal/detail-dialog';
import { EditDialog } from './dialog-modal/edit-dialog';
import { DeleteDialog } from './dialog-modal/delete-dialog';
import { IconChevronLeft, IconChevronRight, IconChevronsLeft, IconChevronsRight } from '@tabler/icons-react';
import { ExportDropdownMenu } from './export-data-menu/export-dropdown-menu';
import { TableIcon } from 'lucide-react';
import { Can } from '@/components/auth/can';
import { CategoryPermissionEnums } from '@/support/enums/PermissionEnums';

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
    selectedBulkCategories: Category[]
    selectedCategory: Category | null
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
    selectedCategory
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

    const [rowSelection, setRowSelection] = React.useState({});

    const [pagination, setPagination] = React.useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });

    const [searchColumn, setSearchColumn] = React.useState<string>('name');



    const table = useReactTable({
        data,
        columns,
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
        <div>
            <div className="flex:col lg:flex justify-between items-center pb-4">
                <div className="first-row flex gap-2">
                    <Select
                        value={searchColumn}
                        onValueChange={setSearchColumn}
                    >
                        <SelectTrigger className="w-full lg:w-24 xl:w-56">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>{t("component.data_table.search_component.search_by", "Pencarian berdasarkan")}</SelectLabel>
                                <SelectItem value="name">{t("component.data_table.search_component.name", "Nama")}</SelectItem>
                                <SelectItem value="desc">{t("component.data_table.search_component.description", "Deskripsi")}</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    <Input
                        placeholder={t("component.data_table.search_component.placeholder", "Telusuri")}
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
                        className="max-w-sm"
                    />
                </div>

                <div className="second-row overflow-auto flex justify-start sm:justify-end gap-2 mt-2 lg:mt-0">
                    <Can permission={CategoryPermissionEnums.CREATE_CATEGORY}>
                        <ImportExcelDialog onSuccess={onRefresh} />
                    </Can>
                    <ExportDropdownMenu data={data} />
                    <Can
                        permission={CategoryPermissionEnums.DELETE_CATEGORY}
                    >
                        <BulkDeleteDialog isDisabled={!(Object.keys(rowSelection).length > 0) && true}
                            selectedLength={table.getSelectedRowModel().rows.length}
                            isOpen={isBulkDeleteDialogOpen}
                            onSuccess={() => {
                                onRefresh()
                                table.resetRowSelection()
                            }}
                            setOpen={setOpenBulkDeleteDialogOpen}
                            categories={selectedBulkCategories}
                            onBulkDeleteClick={() => {
                                const selectedRows = table.getSelectedRowModel().rows.map((row) => row.original);
                                onBulkDeleteClick?.(selectedRows);
                            }}
                        />
                    </Can>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                                <TableIcon className='h-4' />
                                {t("component.data_table.columns.label", "Kolom")}
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
                    <Can
                        permission={CategoryPermissionEnums.CREATE_CATEGORY}
                    >
                        <CreateDialog onSuccess={onRefresh} />
                    </Can>
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
                                    {t("component.data_table.no_result", "Tidak ada hasil")}
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
                        t("component.data_table.selected_row", "%d dari %d baris terpilih."),
                        table.getFilteredSelectedRowModel().rows.length,
                        table.getFilteredRowModel().rows.length
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
                                <SelectLabel>{t("component.data_table.row_per_page", "Baris per halaman")}</SelectLabel>
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
                        {sprintf
                            (
                                t("component.data_table.pagination_info", "Halaman %d dari %d"), (table.getState().pagination.pageIndex + 1), table.getPageCount())
                        }
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
                            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
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
