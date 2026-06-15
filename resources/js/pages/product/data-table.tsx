import { IconChevronLeft, IconChevronRight, IconChevronsLeft, IconChevronsRight } from '@tabler/icons-react';
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
import { TableIcon } from 'lucide-react';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { sprintf } from 'sprintf-js';
import { Can } from '@/components/auth/can';
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
import { FILTER_DEFAULT_VALUE } from '@/constants/Index';
import { getNullableNumberFilterValue, getNumberFilterValue } from '@/lib/utils';
import { PERMISSIONENUMS } from '@/support/enums/PermissionEnums';
import type { ProductQueryParam } from '@/support/interfaces/request/product';
import type { Pagination } from '@/support/interfaces/resource/pagination';
import type { Category } from '@/support/models/category';
import type { Product } from '@/support/models/product';
import type { Unit } from '@/support/models/unit';
import { BulkDeleteDialog } from './dialog-modal/bulk-delete-dialog';
import { CreateDialog } from './dialog-modal/create-dialog';
import { DeleteDialog } from './dialog-modal/delete-dialog';
import { DetailDialog } from './dialog-modal/detail-dialog';
import { EditDialog } from './dialog-modal/edit-dialog';
import { ExportDropdownMenu } from './export-data-menu/export-dropdown-menu';


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
    onChangeField: (field: string) => void,
    onChangeKeyword: (keyword: string) => void,
    setQueryParam: React.Dispatch<React.SetStateAction<ProductQueryParam>>;
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
    onChangeKeyword,
    setQueryParam
}: DataTableProps<TData, TValue>) {
    const { t } = useTranslation();


    const columns =
        typeof columnsOrFn === 'function'
            ? columnsOrFn({
                onDetailClick,
                onEditClick,
                onDeleteClick,
                onSortChange: (orderBy: string | null, order: string | null) => {
                    setQueryParam((prev) => ({
                        ...prev,
                        order_by: orderBy,
                        order,
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

    const [rowSelection, setRowSelection] = React.useState({});

    const updateQueryParam = <TField extends keyof ProductQueryParam>(
        field: TField,
        value: ProductQueryParam[TField],
    ) => {
        setQueryParam((prev) => ({
            ...prev,
            [field]: value,
            page: 1,
        }));
    };




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
            <div className="flex flex-col gap-3 justify-between pb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    <div className="keyword-filter flex gap-1">
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
                    <Select
                        value={getNumberFilterValue(queryParam.category_id)}
                        onValueChange={(value) => updateQueryParam('category_id', getNullableNumberFilterValue(value))}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder={t("component.data_table.filter.category_placeholder", "Pilih Kategori")} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel> {t("component.data_table.filter.category_label", "Kategori")}</SelectLabel>
                                <SelectItem value={FILTER_DEFAULT_VALUE}>
                                    {t("component.data_table.filter.all_categories", "Semua Kategori")}
                                </SelectItem>
                                {categories.map((item) => (
                                    <SelectItem key={item.id} value={item.id.toString()}>{item.name}</SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    <Select
                        value={getNumberFilterValue(queryParam.unit_id)}
                        onValueChange={(value) => updateQueryParam('unit_id', getNullableNumberFilterValue(value))}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder={t("component.data_table.filter.unit_placeholder", "Pilih Satuan")} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel> {t("component.data_table.filter.unit_label", "Satuan")}</SelectLabel>
                                <SelectItem value={FILTER_DEFAULT_VALUE}>
                                    {t("component.data_table.filter.all_units", "Semua Satuan")}
                                </SelectItem>
                                {units.map((item) => (
                                    <SelectItem key={item.id} value={item.id.toString()}>{item.name}</SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    <Select
                        value={getNumberFilterValue(queryParam.is_stock_available)}
                        onValueChange={(value) => updateQueryParam('is_stock_available', getNullableNumberFilterValue(value))}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder={t("component.data_table.filter.is_available_stock_placholder", "Pilih Status Stok")} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>
                                    {t("component.data_table.filter.is_available_stock_label", "Status Stok")}
                                </SelectLabel>
                                <SelectItem value={FILTER_DEFAULT_VALUE}>
                                    {t("component.data_table.filter.all_stock_availability", "Semua Status Stok")}
                                </SelectItem>
                                <SelectItem
                                    value={"0"}
                                >
                                    {t("component.data_table.filter.unavailable_stock_label", "Tidak Tersedia")}
                                </SelectItem>
                                <SelectItem
                                    value={"1"}
                                >
                                    {t("component.data_table.filter.available_stock_label", "Tersedia")}
                                </SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    <Select
                        value={getNumberFilterValue(queryParam.is_active)}
                        onValueChange={(value) => updateQueryParam('is_active', getNullableNumberFilterValue(value))}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder={t("component.data_table.filter.status_placeholder", "Pilih Status")} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>
                                    {t("component.data_table.filter.status_label", "Status")}
                                </SelectLabel>
                                <SelectItem value={FILTER_DEFAULT_VALUE}>
                                    {t("component.data_table.filter.all_statuses", "Semua Status")}
                                </SelectItem>
                                <SelectItem
                                    value={"0"}
                                >
                                    {t("component.data_table.filter.status_inactive_label", "Tidak Aktif")}
                                </SelectItem>
                                <SelectItem
                                    value={"1"}
                                >
                                    {t("component.data_table.filter.status_active_label", "Aktif")}
                                </SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    <Select
                        value={getNumberFilterValue(queryParam.is_unlimited)}
                        onValueChange={(value) => updateQueryParam('is_unlimited', getNullableNumberFilterValue(value))}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder={t("component.data_table.filter.stock_type_placeholder", "Pilih Tipe Stok")} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>
                                    {t("component.data_table.filter.stock_label", "Tipe Stok")}
                                </SelectLabel>
                                <SelectItem value={FILTER_DEFAULT_VALUE}>
                                    {t("component.data_table.filter.all_stock_types", "Semua Tipe Stok")}
                                </SelectItem>
                                <SelectItem
                                    value={"1"}
                                >
                                    {t("component.data_table.filter.unlimited_stock_label", "Tidak Terbatas")}
                                </SelectItem>
                                <SelectItem
                                    value={"0"}
                                >
                                    {t("component.data_table.filter.limitted_stock_label", "Terbatas")}
                                </SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
                <div className="second-row overflow-auto flex justify-start sm:justify-end gap-2 lg:mt-0">
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
                                    );
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
                                if ((pagination.current_page - 1) > 0) {
                                    onChangePaginationPage((pagination.current_page - 1))
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
                                    onChangePaginationPage((pagination.current_page + 1))
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
