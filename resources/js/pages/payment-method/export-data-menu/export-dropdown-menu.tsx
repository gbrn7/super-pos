import { DownloadCloud } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import axiosInstance from '@/lib/axios';
import { handleApiError } from '@/lib/utils';
import apiPaymentMethods from '@/routes/apiPaymentMethods';
import * as XLSX from 'xlsx';

interface ExportDropdownMenuProps<TData> {
    data?: TData[];
}

export function ExportDropdownMenu<TData>({
    data: _data,
}: ExportDropdownMenuProps<TData>) {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);

    const handleExport = async () => {
        try {
            setLoading(true);
            const route = apiPaymentMethods.index();
            const response = await axiosInstance.get(route.url, {
                params: { limit: 999999 }
            });

            const paymentMethods = response.data.data || [];

            const rows = paymentMethods.map((paymentMethod: any) => ({
                [t('page.payment_method.form.name_label', 'Nama')]: paymentMethod.name,
                [t('page.payment_method.form.desc_label', 'Deskripsi')]: paymentMethod.desc || '',
            }));

            const worksheet = XLSX.utils.json_to_sheet(rows);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Payment Methods');

            const fileName = `payment_methods_${new Date().toISOString().split('T')[0]}.xlsx`;
            XLSX.writeFile(workbook, fileName);
        } catch (error) {
            handleApiError(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button variant="outline" onClick={handleExport} disabled={loading}>
            {loading ? (
                <Spinner className="mr-1.5 h-4 w-4" />
            ) : (
                <DownloadCloud className="mr-1.5 h-4 w-4" />
            )}
            {t('component.data_table.export.export_excel_btn', 'Ekspor')}
        </Button>
    );
}
