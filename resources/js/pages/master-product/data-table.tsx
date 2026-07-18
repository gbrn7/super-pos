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
import { TableIcon, RotateCcw, X } from 'lucide-react';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { sprintf } from 'sprintf-js';
import { Can } from '@/components/auth/can';
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
import { DEFAULT_FILTER_VALUE } from '@/constants/Index';
import { PERMISSIONENUMS } from '@/support/enums/PermissionEnums';
import type { MasterProductQueryParam } from '@/support/interfaces/request/master-product';
import type { Pagination } from '@/support/interfaces/resource/pagination';
import type { Category } from '@/support/models/category';
import type { MasterProduct } from '@/support/models/masterProduct';
import type { Unit } from '@/support/models/unit';
import { AddProductsDialog } from './dialog-modal/add-products-dialog';
import { BulkAddProductsDialog } from './dialog-modal/bulk-add-products-dialog';
import { BulkDeleteDialog } from './dialog-modal/bulk-delete-dialog';
import { CreateDialog } from './dialog-modal/create-dialog';
import { DeleteDialog } from './dialog-modal/delete-dialog';
import { DetailDialog } from './dialog-modal/detail-dialog';
import { EditDialog } from './dialog-modal/edit-dialog';
import { ImportExcelDialog } from './dialog-modal/import-excel-dialog';
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
    onAddProductsClick: (data: TData) => void;
    addProductsOpen: boolean;
    setAddProductsOpen: (open: boolean) => void;
    onBulkDeleteClick?: (data: TData[]) => void;
    isBulkDeleteDialogOpen: boolean;
    setOpenBulkDeleteDialogOpen: (open: boolean) => void;
    onBulkAddProductsClick?: (data: TData[]) => void;
    isBulkAddProductsDialogOpen?: boolean;
    setOpenBulkAddProductsDialogOpen: (open: boolean) => void;
    selectedMasterProductsMap?: Record<string | number, MasterProduct>;
    selectedMasterProduct: MasterProduct | null;
    queryParam: MasterProductQueryParam;
    pagination: Pagination;
    onResetFilter?: () => void;
    onChangePaginationPage: (page: number) => void;
    onChangePaginationLimit: (limit: number) => void;
    onChangeField: (field: string) => void;
    onChangeKeyword: (keyword: string) => void;
    setQueryParam: React.Dispatch<React.SetStateAction<MasterProductQueryParam>>;
    units: Unit[];
    categories: Category[];
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
    onAddProductsClick,
    addProductsOpen,
    setAddProductsOpen,
    onBulkDeleteClick,
    isBulkDeleteDialogOpen,
    setOpenBulkDeleteDialogOpen,
    onBulkAddProductsClick,
    isBulkAddProductsDialogOpen = false,
    setOpenBulkAddProductsDialogOpen,
    selectedMasterProductsMap = {},
    selectedMasterProduct,
    queryParam,
    pagination,
    onResetFilter,
    onChangePaginationPage,
    onChangePaginationLimit,
    onChangeField,
    onChangeKeyword,
    setQueryParam,
    categories,
    units,
    rowSelection,
    setRowSelection,
}: DataTableProps<TData, TValue>) {
    const { t } = useTranslation();

    const columns =
        typeof columnsOrFn === 'function'
            ? columnsOrFn({
                onDetailClick,
                onEditClick,
                onDeleteClick,
                onAddProductsClick,
                onSortChange: (
                    orderBy: string | null,
                    order: string | null,
                ) => {
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


    const handleBulkAddClick = React.useCallback(() => {
        onBulkAddProductsClick?.(Object.values(selectedMasterProductsMap) as TData[]);
    }, [onBulkAddProductsClick, selectedMasterProductsMap]);

    const handleBulkDeleteClickAction = React.useCallback(() => {
        onBulkDeleteClick?.(Object.values(selectedMasterProductsMap) as TData[]);
    }, [onBulkDeleteClick, selectedMasterProductsMap]);

    const isFilterActive = React.useMemo(() => {
        return Boolean(
            queryParam.keyword ||
            (queryParam.field && queryParam.field !== DEFAULT_FILTER_VALUE) ||
            queryParam.category_name ||
            queryParam.unit_name ||
            queryParam.barcode
        );
    }, [queryParam]);

    return (
        <div className="rounded-2xl border p-3">
            <div className="flex flex-col justify-between gap-3 pb-4 bulk-action-btn">
                <div className="flex justify-start items-center gap-2 overflow-auto sm:justify-end lg:mt-0">
                    {isFilterActive && onResetFilter && (
                        <Button
                            variant="outline"
                            onClick={onResetFilter}
                        >
                            <RotateCcw className="h-4 w-4 mr-1.5" />
                            {t('component.data_table.reset_filter', 'Reset Filter')}
                        </Button>
                    )}
                    <Can permission={PERMISSIONENUMS.CATEGORY.CREATE}>
                        <ImportExcelDialog onSuccess={onRefresh} />
                    </Can>
                    <Can permission={PERMISSIONENUMS.MASTER_PRODUCT.READ}>
                        <ExportDropdownMenu data={data} />
                    </Can>
                    <Can permission={PERMISSIONENUMS.PRODUCT.CREATE}>
                        <BulkAddProductsDialog
                            isDisabled={
                                !(Object.keys(rowSelection).length > 0)
                            }
                            selectedLength={
                                Object.keys(rowSelection).length
                            }
                            isOpen={isBulkAddProductsDialogOpen}
                            onSuccess={() => {
                                onRefresh();
                                setRowSelection({});
                            }}
                            setOpen={setOpenBulkAddProductsDialogOpen}
                            masterProducts={Object.values(selectedMasterProductsMap)}
                            categories={categories}
                            units={units}
                            onBulkAddClick={handleBulkAddClick}
                        />
                    </Can>
                    <Can permission={PERMISSIONENUMS.MASTER_PRODUCT.DELETE}>
                        <BulkDeleteDialog
                            isDisabled={
                                !(Object.keys(rowSelection).length > 0)
                            }
                            selectedLength={
                                Object.keys(rowSelection).length
                            }
                            isOpen={isBulkDeleteDialogOpen}
                            onSuccess={() => {
                                onRefresh();
                                setRowSelection({});
                            }}
                            setOpen={setOpenBulkDeleteDialogOpen}
                            masterProducts={Object.values(selectedMasterProductsMap)}
                            onBulkDeleteClick={handleBulkDeleteClickAction}
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
                    <Can permission={PERMISSIONENUMS.MASTER_PRODUCT.CREATE}>
                        <CreateDialog
                            onSuccess={onRefresh}
                        />
                    </Can>
                </div>
                <div className="second-row grid grid-cols-1 gap-2 gap-y-3 md:grid-cols-2 lg:grid-cols-3 border p-3 rounded-md">
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
                                        <SelectItem value="name">
                                            {t(
                                                'component.data_table.search_component.name',
                                                'Nama',
                                            )}
                                        </SelectItem>
                                        <SelectItem value="barcode">
                                            {t(
                                                'component.data_table.search_component.barcode',
                                                'Barcode',
                                            )}
                                        </SelectItem>
                                        <SelectItem value="category_name">
                                            {t(
                                                'component.data_table.search_component.category',
                                                'Kategori',
                                            )}
                                        </SelectItem>
                                        <SelectItem value="unit_name">
                                            {t(
                                                'component.data_table.search_component.unit',
                                                'Satuan',
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
                                value={queryParam.keyword}
                                onChange={(event) =>
                                    onChangeKeyword(event.target.value)
                                }
                                className="w-full"
                            />
                        </div>
                    </div>

                    {/* Active Filter Badges */}
                    {isFilterActive && (
                        <div className="col-span-full flex flex-wrap items-center gap-1.5 pt-2 border-t text-xs">
                            <span className="font-medium text-muted-foreground mr-1">
                                {t('component.data_table.active_filters', 'Filter Aktif:')}
                            </span>

                            {queryParam.keyword && (
                                <Badge variant="secondary" className="gap-1.5 py-0.5 px-2 font-normal text-xs bg-muted/50 hover:bg-muted">
                                    <span>{t('component.data_table.search_component.search_label', 'Pencarian')}: "{queryParam.keyword}"</span>
                                    <button
                                        type="button"
                                        onClick={() => onChangeKeyword('')}
                                        className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        <X className="h-3 w-3" />
                                        <span className="sr-only">Hapus filter pencarian</span>
                                    </button>
                                </Badge>
                            )}

                            {queryParam.category_name && (
                                <Badge variant="secondary" className="gap-1.5 py-0.5 px-2 font-normal text-xs bg-muted/50 hover:bg-muted">
                                    <span>{t('component.data_table.filter.category_label', 'Kategori')}: {queryParam.category_name}</span>
                                    <button
                                        type="button"
                                        onClick={() => setQueryParam((prev) => ({ ...prev, category_name: null, page: 1 }))}
                                        className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        <X className="h-3 w-3" />
                                        <span className="sr-only">Hapus filter kategori</span>
                                    </button>
                                </Badge>
                            )}

                            {queryParam.unit_name && (
                                <Badge variant="secondary" className="gap-1.5 py-0.5 px-2 font-normal text-xs bg-muted/50 hover:bg-muted">
                                    <span>{t('component.data_table.filter.unit_label', 'Satuan')}: {queryParam.unit_name}</span>
                                    <button
                                        type="button"
                                        onClick={() => setQueryParam((prev) => ({ ...prev, unit_name: null, page: 1 }))}
                                        className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        <X className="h-3 w-3" />
                                        <span className="sr-only">Hapus filter satuan</span>
                                    </button>
                                </Badge>
                            )}

                            {queryParam.barcode && (
                                <Badge variant="secondary" className="gap-1.5 py-0.5 px-2 font-normal text-xs bg-muted/50 hover:bg-muted">
                                    <span>Barcode: {queryParam.barcode}</span>
                                    <button
                                        type="button"
                                        onClick={() => setQueryParam((prev) => ({ ...prev, barcode: null, page: 1 }))}
                                        className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        <X className="h-3 w-3" />
                                        <span className="sr-only">Hapus filter barcode</span>
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
                    masterProduct={selectedMasterProduct}
                    onOpenChange={setDetailOpen}
                />

                <AddProductsDialog
                    open={addProductsOpen}
                    onOpenChange={setAddProductsOpen}
                    masterProduct={selectedMasterProduct}
                    onSuccess={onRefresh}
                    categories={categories}
                    units={units}
                />

                <EditDialog
                    isOpen={editOpen}
                    onSuccess={onRefresh}
                    setOpen={setEditOpen}
                    masterProduct={selectedMasterProduct}
                    key={selectedMasterProduct?.id}
                />

                <DeleteDialog
                    isOpen={deleteOpen}
                    onSuccess={onRefresh}
                    setOpen={setDeleteOpen}
                    masterProduct={selectedMasterProduct}
                />
            </div>
            <div className="flex items-center justify-end space-x-4 overflow-auto py-4">
                <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
                    {sprintf(
                        t(
                            'component.data_table.selected_row',
                            '%d dari %d baris terpilih',
                        ),
                        table.getFilteredSelectedRowModel().rows.length,
                        pagination.total,
                    )}
                </div>
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
                    <div className="text-sm text-muted-foreground">
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
                            disabled={
                                pagination.current_page == 1 || processing
                            }
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
                                    onChangePaginationPage(
                                        pagination.current_page - 1,
                                    );
                                }
                            }}
                            disabled={
                                pagination.current_page == 1 || processing
                            }
                        >
                            <span className="sr-only">Go to previous page</span>
                            <IconChevronLeft />
                        </Button>
                        <Button
                            variant="outline"
                            className="size-8"
                            size="icon"
                            onClick={() => {
                                if (
                                    pagination.current_page !=
                                    pagination.last_page
                                ) {
                                    onChangePaginationPage(
                                        pagination.current_page + 1,
                                    );
                                }
                            }}
                            disabled={
                                pagination.current_page ==
                                pagination.last_page || processing
                            }
                        >
                            <span className="sr-only">Go to next page</span>
                            <IconChevronRight />
                        </Button>
                        <Button
                            variant="outline"
                            className="hidden size-8 lg:flex"
                            size="icon"
                            onClick={() =>
                                onChangePaginationPage(pagination.last_page)
                            }
                            disabled={
                                pagination.current_page ==
                                pagination.last_page || processing
                            }
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
