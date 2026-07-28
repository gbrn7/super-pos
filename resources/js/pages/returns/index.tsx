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
import { sprintf } from 'sprintf-js';
import type { Pagination } from '@/support/interfaces/resource/pagination';
import { PAGINATIONLIMITDEFAULT, PAGINATIONLIMITOPTIONDEFAULT } from '@/constants/Index';

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
    });

    const fetchReturns = async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get<ResponseApi<any>>('/api/returns', {
                params: queryParam,
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

    useEffect(() => {
        fetchReturns();
    }, [queryParam.page, queryParam.limit]);

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
