import { Head } from '@inertiajs/react';
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import HeaderContent from '@/components/header-content';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { columns, type ReturnItem } from './columns';
import { DetailDialog } from './dialog-modal/detail-dialog';
import axiosInstance from '@/lib/axios';
import type { ResponseApi } from '@/support/interfaces/response/Response';
import { handleApiError, showWarningToast } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
    IconChevronLeft,
    IconChevronRight,
    IconChevronsLeft,
    IconChevronsRight,
} from '@tabler/icons-react';
import { RotateCcw, X, TableIcon } from 'lucide-react';
import { sprintf } from 'sprintf-js';
import type { Pagination } from '@/support/interfaces/resource/pagination';
import { PAGINATIONLIMITDEFAULT, PAGINATIONLIMITOPTIONDEFAULT, DEBOUNCEDEFAULTDURATION } from '@/constants/Index';

export default function Index() {
    const { t } = useTranslation();
    const [returnsData, setReturnsData] = useState<ReturnItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedReturn, setSelectedReturn] = useState<ReturnItem | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);

    const [pagination, setPagination] = useState<Pagination>({
        current_page: 1,
        last_page: 1,
        per_page: PAGINATIONLIMITDEFAULT,
        total: 0,
        from: 0,
        to: 0,
        links: [],
        prev_page_url: '',
        next_page_url: '',
    });

    const [queryParam, setQueryParam] = useState({
        limit: PAGINATIONLIMITDEFAULT,
        page: 1,
        field: 'default',
        keyword: '',
    });

    const fetchReturns = async (paramsToSend = queryParam) => {
        try {
            setLoading(true);
            const res = await axiosInstance.get<ResponseApi<any>>('/api/returns', {
                params: paramsToSend,
            });
            if (res.data.success) {
                const dataVal = res.data.data;
                if (dataVal && Array.isArray(dataVal.items)) {
                    setReturnsData(dataVal.items);
                    setPagination(dataVal.pagination);
                } else {
                    setReturnsData([]);
                }
            } else {
                showWarningToast(res.data.message);
            }
        } catch (error) {
            handleApiError(error);
        } finally {
            setLoading(false);
        }
    };

    // Trigger fetch on page/limit/field changes
    useEffect(() => {
        fetchReturns(queryParam);
    }, [queryParam.page, queryParam.limit, queryParam.field]);

    // Debounce keyword search
    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchReturns(queryParam);
        }, DEBOUNCEDEFAULTDURATION);

        return () => clearTimeout(timeout);
    }, [queryParam.keyword]);

    const handleDetailClick = (item: ReturnItem) => {
        setSelectedReturn(item);
        setDetailOpen(true);
    };

    const handleChangePaginationPage = (page: number) => {
        setQueryParam((prev) => ({
            ...prev,
            page: page,
        }));
    };

    const handleChangePaginationLimit = (limit: number) => {
        setQueryParam((prev) => ({
            ...prev,
            limit: limit,
            page: 1,
        }));
    };

    const handleChangeField = (field: string) => {
        setQueryParam((prev) => ({
            ...prev,
            field: field,
            page: 1,
        }));
    };

    const handleChangeKeyword = (keyword: string) => {
        setQueryParam((prev) => ({
            ...prev,
            keyword: keyword,
            page: 1,
        }));
    };

    const handleResetFilter = () => {
        setQueryParam({
            limit: PAGINATIONLIMITDEFAULT,
            page: 1,
            field: 'default',
            keyword: '',
        });
    };

    const isFilterActive = Boolean(
        queryParam.keyword || (queryParam.field && queryParam.field !== 'default')
    );

    const tableColumns = columns({ onDetailClick: handleDetailClick });

    const table = useReactTable({
        data: returnsData,
        columns: tableColumns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <>
            <Head title={t('page.return.page_name', 'Retur Barang')} />
            <div className="mb-16 flex h-full flex-1 flex-col overflow-x-auto rounded-xl p-4">
                <HeaderContent>
                    {t('page.return.page_name', 'Retur Barang')}
                </HeaderContent>

                <div className="rounded-2xl border bg-card p-3 mt-4">
                    {/* Header Filter Actions */}
                    <div className="flex flex-col justify-between gap-3 pb-4">
                        <div className="flex items-center justify-end gap-2">
                            {isFilterActive && (
                                <Button variant="outline" onClick={handleResetFilter}>
                                    <RotateCcw className="mr-1.5 h-4 w-4" />
                                    {t('component.data_table.reset_filter', 'Reset Filter')}
                                </Button>
                            )}
                        </div>

                        {/* Search and Filters grid */}
                        <div className="second-row grid grid-cols-1 gap-2 gap-y-3 rounded-md border p-3 md:grid-cols-2 lg:grid-cols-3">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-muted-foreground">
                                    {t('component.data_table.search_component.search_label', 'Pencarian')}
                                </Label>
                                <div className="keyword-filter flex w-full gap-1">
                                    <Select
                                        value={queryParam.field}
                                        onValueChange={handleChangeField}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>
                                                    {t('component.data_table.search_component.search_by', 'Pencarian berdasarkan')}
                                                </SelectLabel>
                                                <SelectItem value="default">
                                                    {t('component.data_table.search_component.default', 'Bawaan')}
                                                </SelectItem>
                                                <SelectItem value="return_number">
                                                    {t('component.data_table.search_component.return_number', 'No. Retur')}
                                                </SelectItem>
                                                <SelectItem value="invoice_number">
                                                    {t('component.data_table.search_component.invoice_number', 'No. Invoice')}
                                                </SelectItem>
                                                <SelectItem value="user_name">
                                                    {t('component.data_table.search_component.user_name', 'Kasir / Petugas')}
                                                </SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                    <Input
                                        placeholder={t('component.data_table.search_component.placeholder', 'Telusuri...')}
                                        value={queryParam.keyword}
                                        onChange={(event) => handleChangeKeyword(event.target.value)}
                                        className="w-full"
                                    />
                                </div>
                            </div>

                            {/* Active Filter Badges */}
                            {isFilterActive && (
                                <div className="col-span-full flex flex-wrap items-center gap-1.5 border-t pt-2 text-xs">
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
                                                onClick={() => handleChangeKeyword('')}
                                                className="ml-0.5 rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-muted-foreground/20 hover:text-foreground"
                                            >
                                                <X className="h-3 w-3" />
                                                <span className="sr-only">Hapus filter pencarian</span>
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
                                                          header.column.columnDef.header,
                                                          header.getContext(),
                                                      )}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    Array.from({ length: queryParam.limit }).map((_, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-36" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : table.getRowModel().rows?.length ? (
                                    table.getRowModel().rows.map((row) => (
                                        <TableRow
                                            key={row.id}
                                            data-state={row.getIsSelected() && 'selected'}
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
                                            {t('page.return.no_data', 'Belum ada riwayat retur barang.')}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination Controls */}
                    <div className="flex items-center justify-end space-x-4 overflow-auto py-4">
                        <div className="flex items-center gap-8 w-full lg:w-fit">
                            <Select
                                value={queryParam.limit.toString()}
                                onValueChange={(value) =>
                                    handleChangePaginationLimit(Number(value))
                                }
                            >
                                <SelectTrigger className="w-20">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>
                                            {t('component.data_table.row_per_page', 'Baris per halaman')}
                                        </SelectLabel>
                                        {PAGINATIONLIMITOPTIONDEFAULT.map((option) => (
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
                            <div className="text-sm text-muted-foreground whitespace-nowrap">
                                {sprintf(
                                    t('component.data_table.pagination_info', 'Halaman %d dari %d'),
                                    pagination.current_page,
                                    pagination.last_page,
                                )}
                            </div>
                            <div className="ml-auto flex items-center gap-2 lg:ml-0">
                                <Button
                                    variant="outline"
                                    className="hidden h-8 w-8 p-0 lg:flex"
                                    onClick={() => handleChangePaginationPage(1)}
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
                                            handleChangePaginationPage(pagination.current_page - 1);
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
                                        if (pagination.current_page !== pagination.last_page) {
                                            handleChangePaginationPage(pagination.current_page + 1);
                                        }
                                    }}
                                    disabled={
                                        pagination.current_page === pagination.last_page || loading
                                    }
                                >
                                    <span className="sr-only">Go to next page</span>
                                    <IconChevronRight className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    className="hidden h-8 w-8 p-0 lg:flex"
                                    onClick={() => handleChangePaginationPage(pagination.last_page)}
                                    disabled={
                                        pagination.current_page === pagination.last_page || loading
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
                </div>
            </div>
        </>
    );
}

Index.layout = {
    breadcrumbs: [
        {
            title: 'Retur Barang',
            href: '/returns',
        },
    ],
};
