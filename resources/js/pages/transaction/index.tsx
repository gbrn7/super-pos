import { Head } from '@inertiajs/react';
import type { RowSelectionState } from '@tanstack/react-table';
import i18next from 'i18next';
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import HeaderContent from '@/components/header-content';
import type { StoreSetting } from '@/components/receipt-modal';
import { PAGINATIONLIMITOPTIONDEFAULT } from '@/constants/Index';
import axiosInstance from '@/lib/axios';
import { handleApiError, showWarningToast } from '@/lib/utils';
import { index as apiGetPaymentMethods } from '@/routes/apiPaymentMethods';
import { index as apiGetTransactions } from '@/routes/apiTransactions';
import { all as apiGetAllUsers } from '@/routes/apiUsers';
import { index as transactions } from '@/routes/transactions';
import type { TransactionQueryParam } from '@/support/interfaces/request/transaction';
import type { Pagination } from '@/support/interfaces/resource/pagination';
import type { PaginationResponse } from '@/support/interfaces/resource/resource-response';
import type { ResponseApi } from '@/support/interfaces/response/Response';
import type { PaymentMethod } from '@/support/models/paymentMethod';
import type { Transaction } from '@/support/models/transaction';
import type { User } from '@/support/models/user';
import { RotateCcw } from 'lucide-react';
import ReturnModal from '@/Components/ReturnModal';
import { columns } from './columns';
import { DataTable } from './data-table';
import { useAuth } from '@/hooks/use-auth';
import { PERMISSIONENUMS } from '@/support/enums/PermissionEnums';

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

export default function Index({ storeSetting }: { storeSetting?: StoreSetting | null }) {
    const { t } = useTranslation();
    const { hasPermission } = useAuth();

    const [transactionsData, setTransactionsData] = useState<Transaction[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [processing, setProcessing] = useState(false);
    const [detailOpen, setDetailOpen] = useState(false);
    const [returnModalOpen, setReturnModalOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] =
        useState<Transaction | null>(null);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

    const [queryParam, setQueryParam] = useState<TransactionQueryParam>({
        page: 1,
        limit: 10,
        keyword: '',
        field: 'default',
        user_id: null,
        payment_method_id: null,
        start_date: null,
        end_date: null,
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

    const fetchPaymentMethods = async () => {
        try {
            const res = await axiosInstance.get<ResponseApi<PaymentMethod[]>>(
                apiGetPaymentMethods().url,
                { params: { order_by: 'name', order: 'asc' } },
            );

            if (res.data.success && Array.isArray(res.data.data)) {
                setPaymentMethods(res.data.data);
            }
        } catch (error) {
            handleApiError(error);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await axiosInstance.get<
                ResponseApi<PaginatedData<User> | User[]>
            >(apiGetAllUsers().url, {
                params: { order_by: 'name', order: 'asc' },
            });

            if (res.data.success) {
                const dataVal = res.data.data;

                if (Array.isArray(dataVal)) {
                    setUsers(dataVal);
                } else if (
                    dataVal &&
                    typeof dataVal === 'object' &&
                    'data' in dataVal &&
                    Array.isArray(dataVal.data)
                ) {
                    setUsers(dataVal.data);
                }
            }
        } catch (error) {
            handleApiError(error);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void Promise.all([fetchPaymentMethods(), fetchUsers()]);
    }, []);

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

            if (queryParam.user_id) {
                params.user_id = queryParam.user_id;
            }

            if (queryParam.payment_method_id) {
                params.payment_method_id = queryParam.payment_method_id;
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
            const res =
                await axiosInstance.get<
                    ResponseApi<PaginationResponse<Transaction> | PaginatedData<Transaction> | Transaction[]>
                >(apiUrl);

            if (!res.data.success) {
                showWarningToast(res.data.message);

                return;
            }

            const resData = res.data.data;

            if (
                resData &&
                typeof resData === 'object' &&
                'items' in resData &&
                Array.isArray(resData.items)
            ) {
                setTransactionsData(resData.items);
                if ('pagination' in resData && resData.pagination) {
                    setPagination(resData.pagination);
                }
            } else if (
                resData &&
                typeof resData === 'object' &&
                'data' in resData &&
                Array.isArray(resData.data)
            ) {
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

    const handleQueryParamChange = useCallback(
        <K extends keyof TransactionQueryParam>(
            key: K,
            value: TransactionQueryParam[K],
        ) => {
            setQueryParam((prev) => ({
                ...prev,
                [key]: value,
                ...(key !== 'page' ? { page: 1 } : {}),
            }));
        },
        [],
    );

    const handleResetFilter = useCallback(() => {
        setQueryParam({
            page: 1,
            limit: 10,
            keyword: '',
            field: 'default',
            user_id: null,
            payment_method_id: null,
            start_date: null,
            end_date: null,
            order_by: null,
            order: null,
        });
    }, []);

    const handleReturnClick = (transactionItem: Transaction) => {
        setSelectedTransaction(transactionItem);
        setReturnModalOpen(true);
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
                    paymentMethods={paymentMethods}
                    users={users}
                    processing={processing}
                    data={transactionsData}
                    limitOptions={PAGINATIONLIMITOPTIONDEFAULT}
                    onRefresh={fetchTransactions}
                    detailDataOpen={detailOpen}
                    setDetailOpen={setDetailOpen}
                    onDetailClick={handleDetailClick}
                    onReturnClick={
                        hasPermission(PERMISSIONENUMS.RETURN.CREATE)
                            ? handleReturnClick
                            : undefined
                    }
                    selectedTransaction={selectedTransaction}
                    queryParam={queryParam}
                    pagination={pagination}
                    onQueryParamChange={handleQueryParamChange}
                    onResetFilter={handleResetFilter}
                    onChangePaginationPage={(val) =>
                        handleQueryParamChange('page', val)
                    }
                    onChangePaginationLimit={(val) =>
                        handleQueryParamChange('limit', val)
                    }
                    onChangeField={(val) =>
                        handleQueryParamChange('field', val)
                    }
                    onChangeUser={(val) =>
                        handleQueryParamChange('user_id', val)
                    }
                    onChangePaymentMethod={(val) =>
                        handleQueryParamChange('payment_method_id', val)
                    }
                    onChangeKeyword={(val) =>
                        handleQueryParamChange('keyword', val)
                    }
                    onChangeStartDate={(val) =>
                        handleQueryParamChange('start_date', val)
                    }
                    onChangeEndDate={(val) =>
                        handleQueryParamChange('end_date', val)
                    }
                    setQueryParam={setQueryParam}
                    rowSelection={rowSelection}
                    setRowSelection={setRowSelection}
                    storeSetting={storeSetting}
                />

                <ReturnModal
                    isOpen={returnModalOpen}
                    onClose={() => setReturnModalOpen(false)}
                    transaction={selectedTransaction}
                    onSuccess={fetchTransactions}
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
