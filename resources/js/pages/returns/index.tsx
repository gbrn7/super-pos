import { Head } from '@inertiajs/react';
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import HeaderContent from '@/components/header-content';
import {
    PAGINATIONLIMITDEFAULT,
    PAGINATIONLIMITOPTIONDEFAULT,
    DEBOUNCEDEFAULTDURATION,
} from '@/constants/Index';
import axiosInstance from '@/lib/axios';
import { handleApiError, showWarningToast } from '@/lib/utils';
import type { Pagination } from '@/support/interfaces/resource/pagination';
import type { ResponseApi } from '@/support/interfaces/response/Response';
import { columns } from './columns';
import type { ReturnItem } from './columns';
import { DataTable } from './data-table';
import type { ReturnQueryParam } from './data-table';

export default function Index() {
    const { t } = useTranslation();
    const [returnsData, setReturnsData] = useState<ReturnItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedReturn, setSelectedReturn] = useState<ReturnItem | null>(
        null,
    );
    const [detailOpen, setDetailOpen] = useState(false);
    const [txDetailOpen, setTxDetailOpen] = useState(false);
    const [selectedTxId, setSelectedTxId] = useState<number | null>(null);

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

    const [queryParam, setQueryParam] = useState<ReturnQueryParam>({
        limit: PAGINATIONLIMITDEFAULT,
        page: 1,
        field: 'default',
        keyword: '',
        start_date: null,
        end_date: null,
    });

    const fetchReturns = useCallback(async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get<ResponseApi<any>>(
                '/api/returns',
                {
                    params: queryParam,
                },
            );

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
    }, [queryParam]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            void fetchReturns();
        }, DEBOUNCEDEFAULTDURATION);

        return () => clearTimeout(timeout);
    }, [fetchReturns]);

    const handleDetailClick = (item: ReturnItem) => {
        setSelectedReturn(item);
        setDetailOpen(true);
    };

    const handleInvoiceClick = (transactionId: number) => {
        setSelectedTxId(transactionId);
        setTxDetailOpen(true);
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

    const handleChangeStartDate = (date: string | null) => {
        setQueryParam((prev) => ({
            ...prev,
            start_date: date,
            page: 1,
        }));
    };

    const handleChangeEndDate = (date: string | null) => {
        setQueryParam((prev) => ({
            ...prev,
            end_date: date,
            page: 1,
        }));
    };

    const handleResetFilter = () => {
        setQueryParam({
            limit: PAGINATIONLIMITDEFAULT,
            page: 1,
            field: 'default',
            keyword: '',
            start_date: null,
            end_date: null,
        });
    };

    return (
        <>
            <Head title={t('page.return.page_name', 'Retur Barang')} />
            <div className="mb-16 flex h-full flex-1 flex-col overflow-x-auto rounded-xl p-4">
                <HeaderContent>
                    {t('page.return.page_name', 'Retur Barang')}
                </HeaderContent>

                <DataTable
                    columns={columns}
                    data={returnsData}
                    loading={loading}
                    pagination={pagination}
                    queryParam={queryParam}
                    limitOptions={PAGINATIONLIMITOPTIONDEFAULT}
                    onResetFilter={handleResetFilter}
                    onChangePaginationLimit={handleChangePaginationLimit}
                    onChangePaginationPage={handleChangePaginationPage}
                    onChangeField={handleChangeField}
                    onChangeKeyword={handleChangeKeyword}
                    onChangeStartDate={handleChangeStartDate}
                    onChangeEndDate={handleChangeEndDate}
                    onDetailClick={handleDetailClick}
                    onInvoiceClick={handleInvoiceClick}
                    detailOpen={detailOpen}
                    setDetailOpen={setDetailOpen}
                    selectedReturn={selectedReturn}
                    txDetailOpen={txDetailOpen}
                    setTxDetailOpen={setTxDetailOpen}
                    selectedTxId={selectedTxId}
                />
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
