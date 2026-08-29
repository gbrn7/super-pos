import { Head } from '@inertiajs/react';
import i18next from 'i18next';
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import HeaderContent from '@/components/header-content';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatRupiah } from '@/lib/format-money';
import axiosInstance from '@/lib/axios';
import { handleApiError } from '@/lib/utils';
import { index as profitWalletRoute } from '@/routes/profit-wallet';
import { index as apiGetProfitWallet, exportData as apiExportProfitWallet } from '@/routes/apiProfitWallet';
import { columns } from './columns';
import { DataTable } from './data-table';
import { Can } from '@/components/auth/can';
import { PERMISSIONENUMS } from '@/support/enums/PermissionEnums';
import { DisburseDialog } from './dialog-modal/disburse-dialog';
import { WithdrawCapitalDialog } from './dialog-modal/withdraw-capital-dialog';
import { ExportModal } from './dialog-modal/export-modal';
import { DetailDialog } from '@/pages/transaction/dialog-modal/detail-dialog';
import type { StoreSetting } from '@/components/receipt-modal';
import type { ResponseApi } from '@/support/interfaces/response/Response';
import type { PaginationResponse } from '@/support/interfaces/resource/resource-response';
import type { ProfitWalletTransaction, ProfitWalletSummary } from '@/support/models/profitWallet';

export default function ProfitWalletIndex({ storeSetting }: { storeSetting?: StoreSetting | null }) {
    const { t } = useTranslation();

    const [ledgerData, setLedgerData] = useState<ProfitWalletTransaction[]>([]);
    const [summary, setSummary] = useState<ProfitWalletSummary>({
        current_balance: 0,
        total_inflow: 0,
        total_outflow: 0,
    });
    const [processing, setProcessing] = useState(false);
    const [exportModalOpen, setExportModalOpen] = useState(false);
    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

    const [queryParam, setQueryParam] = useState<{
        page: number;
        limit: number;
        keyword: string;
        type: string;
        transaction_type: string;
        start_date: string | null;
        end_date: string | null;
    }>({
        page: 1,
        limit: 10,
        keyword: '',
        type: '',
        transaction_type: '',
        start_date: null,
        end_date: null,
    });

    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0,
    });

    const fetchProfitWalletData = useCallback(async () => {
        try {
            setProcessing(true);
            const params: Record<string, any> = { ...queryParam };
            const res = await axiosInstance.get<ResponseApi<{ summary: ProfitWalletSummary; transactions: PaginationResponse<ProfitWalletTransaction> }>>(apiGetProfitWallet().url, { params });
            if (res.data.success) {
                setLedgerData(res.data.data.transactions.items);
                setSummary(res.data.data.summary);
                if (res.data.data.transactions.pagination) {
                    setPagination(res.data.data.transactions.pagination);
                }
            }
        } catch (error) {
            handleApiError(error);
        } finally {
            setProcessing(false);
        }
    }, [queryParam]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            void fetchProfitWalletData();
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [fetchProfitWalletData]);

    const handleInvoiceClick = async (invoiceNumber: string) => {
        try {
            const res = await axiosInstance.get(`/api/transactions/invoice/${invoiceNumber}`);
            if (res.data.success) {
                setSelectedTransaction(res.data.data);
                setDetailOpen(true);
            }
        } catch (error) {
            handleApiError(error);
        }
    };

    const handleExport = () => {
        setExportModalOpen(true);
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
            type: '',
            transaction_type: '',
            start_date: null,
            end_date: null,
        });
    };

    return (
        <>
            <Head title={t('page.profit_wallet.page_name', 'Dompet Profit')} />
            <div className="mb-16 flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <HeaderContent>{t('page.profit_wallet.page_name', 'Dompet Profit')}</HeaderContent>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <Card className={`bg-gradient-to-tr from-primary/5 to-card border-l-4 ${summary.current_balance < 0 ? 'border-l-rose-500' : 'border-l-emerald-500'} shadow-xs flex flex-col justify-between`}>
                        <CardHeader className="py-4">
                            <CardDescription>{t('page.profit_wallet.cards.balance', 'Saldo Berjalan')}</CardDescription>
                            <CardTitle className={`text-2xl font-bold ${summary.current_balance < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                {summary.current_balance < 0 ? `-${formatRupiah(Math.abs(summary.current_balance))}` : formatRupiah(summary.current_balance)}
                            </CardTitle>
                        </CardHeader>
                        <div className="p-4 pt-0 grid grid-cols-2 gap-2">
                            <Can permission={PERMISSIONENUMS.PROFIT_WALLET.DISBURSE}>
                                <DisburseDialog onSuccess={fetchProfitWalletData} currentBalance={Number(summary.current_balance)} />
                            </Can>
                            <Can permission={PERMISSIONENUMS.PROFIT_WALLET.WITHDRAW_CAPITAL}>
                                <WithdrawCapitalDialog onSuccess={fetchProfitWalletData} currentBalance={Number(summary.current_balance)} />
                            </Can>
                        </div>
                    </Card>

                    <Card className="bg-card border-l-4 border-l-sky-500 shadow-xs">
                        <CardHeader className="py-4">
                            <CardDescription>{t('page.profit_wallet.cards.inflow', 'Total Uang Masuk')}</CardDescription>
                            <CardTitle className="text-2xl font-bold text-sky-600 dark:text-sky-400">
                                {formatRupiah(summary.total_inflow)}
                            </CardTitle>
                        </CardHeader>
                    </Card>

                    <Card className="bg-card border-l-4 border-l-rose-500 shadow-xs">
                        <CardHeader className="py-4">
                            <CardDescription>{t('page.profit_wallet.cards.outflow', 'Total Uang Keluar')}</CardDescription>
                            <CardTitle className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                                {formatRupiah(summary.total_outflow)}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                {/* Table Component */}
                <DataTable
                    columns={columns({
                        onInvoiceClick: handleInvoiceClick,
                        onSortChange: () => {},
                        orderBy: 'id',
                        order: 'desc',
                    })}
                    data={ledgerData}
                    processing={processing}
                    queryParam={queryParam}
                    pagination={pagination}
                    onQueryParamChange={handleQueryParamChange}
                    onResetFilter={handleResetFilter}
                    onChangePaginationPage={(val) => handleQueryParamChange('page', val)}
                    onChangePaginationLimit={(val) => handleQueryParamChange('limit', val)}
                    limitOptions={[10, 25, 50, 100]}
                    onExport={handleExport}
                    exporting={false}
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

                <ExportModal
                    isOpen={exportModalOpen}
                    onClose={() => setExportModalOpen(false)}
                    defaultStartDate={queryParam.start_date}
                    defaultEndDate={queryParam.end_date}
                />
            </div>
        </>
    );
}

ProfitWalletIndex.layout = {
    breadcrumbs: [
        {
            title: i18next.t('page.profit_wallet.page_name', 'Dompet Profit'),
            href: '/profit-wallet',
        },
    ],
};
