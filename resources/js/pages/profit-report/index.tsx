import { Head } from '@inertiajs/react';
import i18next from 'i18next';
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import HeaderContent from '@/components/header-content';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatRupiah } from '@/lib/format-money';
import axiosInstance from '@/lib/axios';
import { handleApiError } from '@/lib/utils';
import { DetailDialog } from '@/pages/transaction/dialog-modal/detail-dialog';
import type { StoreSetting } from '@/components/receipt-modal';
import type { PaymentMethod } from '@/support/models/paymentMethod';
import type { User } from '@/support/models/user';
import { index as apiGetPaymentMethods } from '@/routes/apiPaymentMethods';
import { all as apiGetAllUsers } from '@/routes/apiUsers';
import { index as profitReportRoute } from '@/routes/profit-report';
import { columns, type ProfitRecord } from './columns';
import { DataTable } from './data-table';

const { url } = profitReportRoute();

interface SummaryData {
    total_revenue: number;
    total_cost: number;
    total_net_profit: number;
    total_transactions: number;
}

export default function ProfitReportIndex({ storeSetting }: { storeSetting?: StoreSetting | null }) {
    const { t } = useTranslation();

    const [profitData, setProfitData] = useState<ProfitRecord[]>([]);
    const [summary, setSummary] = useState<SummaryData>({
        total_revenue: 0,
        total_cost: 0,
        total_net_profit: 0,
        total_transactions: 0,
    });
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [processing, setProcessing] = useState(false);
    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

    const [queryParam, setQueryParam] = useState({
        page: 1,
        limit: 10,
        keyword: '',
        user_id: null as number | null,
        payment_method_id: null as number | null,
        start_date: '',
        end_date: '',
        order_by: 'id',
        order: 'desc',
    });

    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0,
    });

    const fetchPaymentMethods = async () => {
        try {
            const res = await axiosInstance.get(apiGetPaymentMethods().url, {
                params: { order_by: 'name', order: 'asc' },
            });
            if (res.data.success) setPaymentMethods(res.data.data);
        } catch (error) {
            handleApiError(error);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await axiosInstance.get(apiGetAllUsers().url);
            if (res.data.success) {
                setUsers(Array.isArray(res.data.data) ? res.data.data : res.data.data.data || []);
            }
        } catch (error) {
            handleApiError(error);
        }
    };

    const fetchProfitReport = useCallback(async () => {
        try {
            setProcessing(true);
            const params: Record<string, any> = { ...queryParam };
            const res = await axiosInstance.get('/api/profit-report', { params });
            if (res.data.success) {
                setProfitData(res.data.data.transactions.data);
                setSummary(res.data.data.summary);
                if (res.data.data.transactions.meta) {
                    setPagination(res.data.data.transactions.meta);
                }
            }
        } catch (error) {
            handleApiError(error);
        } finally {
            setProcessing(false);
        }
    }, [queryParam]);

    useEffect(() => {
        void Promise.all([fetchPaymentMethods(), fetchUsers()]);
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            void fetchProfitReport();
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [fetchProfitReport]);

    const handleDetailClick = (transactionId: number, invoiceNumber: string) => {
        setSelectedTransaction({ id: transactionId, invoice_number: invoiceNumber });
        setDetailOpen(true);
    };

    const handleQueryParamChange = (key: string, value: any) => {
        setQueryParam((prev) => ({
            ...prev,
            [key]: value,
            ...(key !== 'page' ? { page: 1 } : {}),
        }));
    };

    const handleResetFilter = () => {
        setQueryParam({
            page: 1,
            limit: 10,
            keyword: '',
            user_id: null,
            payment_method_id: null,
            start_date: '',
            end_date: '',
            order_by: 'id',
            order: 'desc',
        });
    };

    const handleSortChange = (orderBy: string | null, order: string | null) => {
        setQueryParam((prev) => ({
            ...prev,
            order_by: orderBy || 'id',
            order: order || 'desc',
            page: 1,
        }));
    };

    return (
        <>
            <Head title={t('page.profit.page_name', 'Laporan Profit')} />
            <div className="mb-16 flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <HeaderContent>{t('page.profit.page_name', 'Laporan Profit')}</HeaderContent>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <Card className="bg-gradient-to-tr from-primary/5 to-card border-l-4 border-l-blue-500 shadow-xs">
                        <CardHeader className="py-4">
                            <CardDescription>{t('page.profit.cards.revenue', 'Total Pendapatan')}</CardDescription>
                            <CardTitle className="text-2xl font-bold text-foreground">
                                {formatRupiah(summary.total_revenue)}
                            </CardTitle>
                        </CardHeader>
                    </Card>

                    <Card className="bg-gradient-to-tr from-primary/5 to-card border-l-4 border-l-amber-500 shadow-xs">
                        <CardHeader className="py-4">
                            <CardDescription>{t('page.profit.cards.cost', 'Total Modal / HPP')}</CardDescription>
                            <CardTitle className="text-2xl font-bold text-foreground">
                                {formatRupiah(summary.total_cost)}
                            </CardTitle>
                        </CardHeader>
                    </Card>

                    <Card className="bg-gradient-to-tr from-primary/5 to-card border-l-4 border-l-emerald-500 shadow-xs">
                        <CardHeader className="py-4">
                            <CardDescription>{t('page.profit.cards.profit', 'Total Laba Bersih')}</CardDescription>
                            <CardTitle className={`text-2xl font-bold ${summary.total_net_profit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                {formatRupiah(summary.total_net_profit)}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                {/* Table Component */}
                <DataTable
                    columns={columns({
                        onDetailClick: handleDetailClick,
                        onSortChange: handleSortChange,
                        orderBy: queryParam.order_by,
                        order: queryParam.order,
                    })}
                    data={profitData}
                    users={users}
                    paymentMethods={paymentMethods}
                    processing={processing}
                    queryParam={queryParam}
                    pagination={pagination}
                    onQueryParamChange={handleQueryParamChange}
                    onResetFilter={handleResetFilter}
                    onRefresh={fetchProfitReport}
                    onChangePaginationPage={(val) => handleQueryParamChange('page', val)}
                    onChangePaginationLimit={(val) => handleQueryParamChange('limit', val)}
                    limitOptions={[10, 25, 50, 100]}
                />

                {/* Struk / Detail Transaction Modal */}
                {selectedTransaction && (
                    <DetailDialog
                        isOpen={detailOpen}
                        transaction={selectedTransaction}
                        onOpenChange={setDetailOpen}
                        storeSetting={storeSetting}
                    />
                )}
            </div>
        </>
    );
}

ProfitReportIndex.layout = {
    breadcrumbs: [
        {
            title: i18next.t('page.profit.page_name', 'Laporan Profit'),
            href: url,
        },
    ],
};
