import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { index as apiGetPaymentMethods } from '@/routes/apiPaymentMethods';
import { index as paymentMethods } from '@/routes/payment-methods';
import type { PaymentMethod } from '@/support/models/paymentMethod';
import { columns } from './columns';
import { DataTable } from './data-table';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import axiosInstance from '@/lib/axios';
import { ResponseApi } from '@/support/interfaces/response/Response';
import { handleApiError, showWarningToast } from '@/lib/utils';
import HeaderContent from '@/components/header-content';
import { PAGINATIONLIMITOPTIONDEFAULT } from '@/constants/Index';

const { url } = paymentMethods();


export default function Index() {


    const { url: apiUrl } = apiGetPaymentMethods();
    const { t } = useTranslation()


    const [allPaymentMethods, setAllPaymentMethods] = useState<PaymentMethod[]>([]);
    const [processing, setProcessing] = useState(false);
    const [detailOpen, setDetailOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(
        null,
    );
    const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<PaymentMethod[]>([]);

    const fetchAllPaymentMethods = async () => {
        try {
            setProcessing(true);
            const res = await axiosInstance.get<ResponseApi<PaymentMethod[]>>(apiUrl);
            if (!res.data.success) {
                showWarningToast(res.data.message)
                return
            }
            setAllPaymentMethods(res.data.data);
        } catch (error) {
            handleApiError(error)
        } finally {
            setProcessing(false);
            setSelectedPaymentMethods([])
        }
    };

    const handleDetailClick = (paymentMethod: PaymentMethod) => {
        setSelectedPaymentMethod(paymentMethod);
        setDetailOpen(true);
    };

    const handleEditClick = (paymentMethod: PaymentMethod) => {
        setSelectedPaymentMethod(paymentMethod);
        setEditOpen(true);
    };

    const handleDeleteClick = (paymentMethod: PaymentMethod) => {
        setSelectedPaymentMethod(paymentMethod);
        setDeleteOpen(true);
    };

    const handleBulkDeleteClick = (paymentMethods: PaymentMethod[]) => {
        setSelectedPaymentMethods(paymentMethods);
        setBulkDeleteOpen(true);
    };

    useEffect(() => {
        const fetchPaymentMethods = async () => fetchAllPaymentMethods();

        fetchPaymentMethods();
    }, []);

    return (
        <>
            <Head title={t("page.payment_method.page_name", "Metode Pembayaran")} />
            <div className="mb-16 flex h-full flex-1 flex-col overflow-x-auto rounded-xl p-4">
                <HeaderContent>
                    {t("page.payment_method.page_name", "Metode Pembayaran")}
                </HeaderContent>
                <DataTable
                    columns={columns}
                    processing={processing}
                    data={allPaymentMethods}
                    limitOptions={PAGINATIONLIMITOPTIONDEFAULT}
                    onRefresh={fetchAllPaymentMethods}
                    detailDataOpen={detailOpen}
                    editOpen={editOpen}
                    deleteOpen={deleteOpen}
                    setDetailOpen={setDetailOpen}
                    setEditOpen={setEditOpen}
                    setDeleteOpen={setDeleteOpen}
                    onDetailClick={handleDetailClick}
                    onEditClick={handleEditClick}
                    onDeleteClick={handleDeleteClick}
                    onBulkDeleteClick={handleBulkDeleteClick}
                    isBulkDeleteDialogOpen={bulkDeleteOpen}
                    setOpenBulkDeleteDialogOpen={setBulkDeleteOpen}
                    selectedBulkPaymentMethods={selectedPaymentMethods}
                    selectedPaymentMethod={selectedPaymentMethod}
                />
            </div>
        </>
    );
}

Index.layout = {
    breadcrumbs: [
        {
            title: i18next.t("page.payment_method.page_name", "Metode Pembayaran"),
            href: url,
        },
    ],
};