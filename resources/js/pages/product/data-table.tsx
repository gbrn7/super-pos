import { Dispatch, SetStateAction } from 'react';
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
import type { Product } from '@/support/models/product';
import { useTranslation } from 'react-i18next';
import { sprintf } from 'sprintf-js';
import { DetailDialog } from './dialog-modal/detail-dialog';
import { EditDialog } from './dialog-modal/edit-dialog';
import { DeleteDialog } from './dialog-modal/delete-dialog';
import { IconChevronLeft, IconChevronRight, IconChevronsLeft, IconChevronsRight } from '@tabler/icons-react';
import { ExportDropdownMenu } from './export-data-menu/export-dropdown-menu';
import { TableIcon } from 'lucide-react';
import { Can } from '@/components/auth/can';
import { PERMISSIONENUMS } from '@/support/enums/PermissionEnums';
import { Unit } from '@/support/models/unit';
import { Category } from '@/support/models/category';
import { ProductQueryParam } from '@/support/interfaces/request/product';
import { Pagination } from '@/support/interfaces/resource/pagination';

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
    selectedBulkProducts: Product[];
    selectedProduct: Product | null;
    units: Unit[],
    categories: Category[],
    queryParam: ProductQueryParam,
    pagination: Pagination,
    onChangePaginationPage: (page: number) => void,
    onChangePaginationLimit: (limit: number) => void,
    onChangeField: (field: string) => void
    onChangeKeyword: (keyword: string) => void
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
    selectedBulkProducts,
    selectedProduct,
    units,
    categories,
    queryParam,
    pagination,
    onChangePaginationPage,
    onChangePaginationLimit,
    onChangeField,
    onChangeKeyword
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




    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        columnResizeMode: "onChange",
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    });

    return (
        <div className='p-3 border rounded-2xl'>
            <div className="flex:col lg:flex justify-between items-center pb-4">
                <div className="first-row flex gap-2">
                    <Select
                        value={queryParam.field}
                        onValueChange={(value) => onChangeField(value)}
                    >
                        <SelectTrigger className="w-full lg:w-24 xl:w-56">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>{t("component.data_table.search_component.search_by", "Pencarian berdasarkan")}</SelectLabel>
                                <SelectItem value="default">
                                    {t("component.data_table.search_component.default", "Bawaan")}
                                </SelectItem>
                                <SelectItem value="name">
                                    {t("component.data_table.search_component.name", "Nama")}
                                </SelectItem>
                                <SelectItem value="sku">
                                    {t("component.data_table.search_component.sku", "SKU")}
                                </SelectItem>
                                <SelectItem value="desc">
                                    {t("component.data_table.search_component.desc", "Deskripsi")}
                                </SelectItem>
                                <SelectItem value="category">
                                    {t("component.data_table.search_component.category", "Kategori")}
                                </SelectItem>
                                <SelectItem value="unit">
                                    {t("component.data_table.search_component.unit", "Satuan")}
                                </SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    <Input
                        placeholder={t("component.data_table.search_component.placeholder", "Telusuri")}
                        value={queryParam.keyword}
                        onChange={(event) => onChangeKeyword(event.target.value)}
                        className="max-w-sm"
                    />
                </div>

                <div className="second-row overflow-auto flex justify-start sm:justify-end gap-2 mt-2 lg:mt-0">
                    <Can permission={PERMISSIONENUMS.PRODUCT.READ}>
                        <ExportDropdownMenu data={data} />
                    </Can>
                    <Can
                        permission={PERMISSIONENUMS.PRODUCT.DELETE}
                    >
                        <BulkDeleteDialog isDisabled={!(Object.keys(rowSelection).length > 0) && true}
                            selectedLength={table.getSelectedRowModel().rows.length}
                            isOpen={isBulkDeleteDialogOpen}
                            onSuccess={() => {
                                onRefresh()
                                table.resetRowSelection()
                            }}
                            setOpen={setOpenBulkDeleteDialogOpen}
                            products={selectedBulkProducts}
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
                                    ); 0
                                })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Can
                        permission={PERMISSIONENUMS.PRODUCT.CREATE}
                    >
                        <CreateDialog onSuccess={onRefresh} categories={categories} units={units} />
                    </Can>
                </div>

            </div>
            <div className="overflow-x-auto rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}
                                            style={{
                                                width: `${header.getSize()}px`,
                                            }}
                                        >
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
                            Array.from({ length: queryParam.limit }).map(
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
                    product={selectedProduct}
                    onOpenChange={setDetailOpen}
                />

                <EditDialog
                    categories={categories}
                    units={units}
                    isOpen={editOpen}
                    onSuccess={onRefresh}
                    setOpen={setEditOpen}
                    product={selectedProduct}
                    key={selectedProduct?.id}
                />

                <DeleteDialog
                    isOpen={deleteOpen}
                    onSuccess={onRefresh}
                    setOpen={setDeleteOpen}
                    product={selectedProduct}
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
                        value={queryParam.limit.toString()}
                        onValueChange={(value) => onChangePaginationLimit(Number(value))}
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
                                t("component.data_table.pagination_info", "Halaman %d dari %d"), pagination.current_page, pagination.last_page)
                        }
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
                                (pagination.current_page - 1) > 0 && onChangePaginationPage((pagination.current_page - 1))
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
                                pagination.current_page != pagination.last_page && onChangePaginationPage((pagination.current_page + 1))
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
