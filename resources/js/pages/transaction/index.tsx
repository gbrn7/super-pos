import { Head } from '@inertiajs/react';
import { useState, useEffect, useCallback } from 'react';
import { index as apiGetTransactions } from '@/routes/apiTransactions';
import { index as transactions } from '@/routes/transactions';
import type { Transaction } from '@/support/models/transaction';
import type { TransactionQueryParam } from '@/support/interfaces/request/transaction';
import type { Pagination } from '@/support/interfaces/resource/pagination';
import { columns } from './columns';
import { DataTable } from './data-table';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import axiosInstance from '@/lib/axios';
import type { ResponseApi } from '@/support/interfaces/response/Response';
import { handleApiError, showWarningToast } from '@/lib/utils';
import HeaderContent from '@/components/header-content';
import { PAGINATIONLIMITOPTIONDEFAULT } from '@/constants/Index';
import type { RowSelectionState } from '@tanstack/react-table';

const { url } = transactions();

interface PaginatedData<T> {
    data: T[];
    meta?: Pagination;
    links?: any;
    current_page?: number;
    last_page?: number;
    per_page?: number;
    total?: number;
}

export default function Index() {
    const { t } = useTranslation();

    const [transactionsData, setTransactionsData] = useState<Transaction[]>([]);
    const [processing, setProcessing] = useState(false);
    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

    const [queryParam, setQueryParam] = useState<TransactionQueryParam>({
        page: 1,
        limit: 10,
        keyword: '',
        field: 'default',
        start_date: '',
        end_date: '',
        order_by: null,
        order: null,
    });

    const [pagination, setPagination] = useState<Pagination>({
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0,
        from: 0,
        to: 0,
        links: [],
        prev_page_url: '',
        next_page_url: '',
    });

    const fetchTransactions = useCallback(async () => {
        try {
            setProcessing(true);
            const params: Record<string, any> = {
                page: queryParam.page,
                limit: queryParam.limit,
            };

            if (queryParam.keyword) {
                params.keyword = queryParam.keyword;
                if (queryParam.field && queryParam.field !== 'default') {
                    params.field = queryParam.field;
                }
            }

            if (queryParam.start_date) {
                params.start_date = queryParam.start_date;
            }

            if (queryParam.end_date) {
                params.end_date = queryParam.end_date;
            }

            if (queryParam.order_by && queryParam.order) {
                params.order_by = queryParam.order_by;
                params.order = queryParam.order;
            }

            const apiUrl = apiGetTransactions({ query: params }).url;
            const res = await axiosInstance.get<ResponseApi<PaginatedData<Transaction> | Transaction[]>>(apiUrl);

            if (!res.data.success) {
                showWarningToast(res.data.message);
                return;
            }

            const resData = res.data.data;
            if (resData && typeof resData === 'object' && 'data' in resData && Array.isArray(resData.data)) {
                setTransactionsData(resData.data);
                if (resData.meta) {
                    setPagination(resData.meta);
                } else if ('current_page' in resData) {
                    setPagination({
                        current_page: resData.current_page || 1,
                        last_page: resData.last_page || 1,
                        per_page: resData.per_page || queryParam.limit,
                        total: resData.total || 0,
                        from: 1,
                        to: resData.data.length,
                        links: [],
                        prev_page_url: '',
                        next_page_url: '',
                    });
                }
            } else if (Array.isArray(resData)) {
                setTransactionsData(resData);
                setPagination((prev) => ({
                    ...prev,
                    total: resData.length,
                    last_page: 1,
                }));
            } else {
                setTransactionsData([]);
            }
        } catch (error) {
            handleApiError(error);
        } finally {
            setProcessing(false);
        }
    }, [queryParam]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchTransactions();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [fetchTransactions]);

    const handleDetailClick = (transactionItem: Transaction) => {
        setSelectedTransaction(transactionItem);
        setDetailOpen(true);
    };

    const handlePageChange = (page: number) => {
        setQueryParam((prev) => ({ ...prev, page }));
    };

    const handleLimitChange = (limit: number) => {
        setQueryParam((prev) => ({ ...prev, limit, page: 1 }));
    };

    const handleFieldChange = (field: string) => {
        setQueryParam((prev) => ({ ...prev, field, page: 1 }));
    };

    const handleKeywordChange = (keyword: string) => {
        setQueryParam((prev) => ({ ...prev, keyword, page: 1 }));
    };

    const handleStartDateChange = (startDate: string) => {
        setQueryParam((prev) => ({ ...prev, start_date: startDate, page: 1 }));
    };

    const handleEndDateChange = (endDate: string) => {
        setQueryParam((prev) => ({ ...prev, end_date: endDate, page: 1 }));
    };

    return (
        <>
            <Head title={t('page.transaction.page_name', 'Transaksi')} />
            <div className="mb-16 flex h-full flex-1 flex-col overflow-x-auto rounded-xl p-4">
                <HeaderContent>
                    {t('page.transaction.page_name', 'Transaksi')}
                </HeaderContent>

                <DataTable
                    columns={columns}
                    processing={processing}
                    data={transactionsData}
                    limitOptions={PAGINATIONLIMITOPTIONDEFAULT}
                    onRefresh={fetchTransactions}
                    detailDataOpen={detailOpen}
                    setDetailOpen={setDetailOpen}
                    onDetailClick={handleDetailClick}
                    selectedTransaction={selectedTransaction}
                    queryParam={queryParam}
                    pagination={pagination}
                    onChangePaginationPage={handlePageChange}
                    onChangePaginationLimit={handleLimitChange}
                    onChangeField={handleFieldChange}
                    onChangeKeyword={handleKeywordChange}
                    onChangeStartDate={handleStartDateChange}
                    onChangeEndDate={handleEndDateChange}
                    setQueryParam={setQueryParam}
                    rowSelection={rowSelection}
                    setRowSelection={setRowSelection}
                />
            </div>
        </>
    );
}

Index.layout = {
    breadcrumbs: [
        {
            title: i18next.t('page.transaction.page_name', 'Transaksi'),
            href: url,
        },
    ],
};
