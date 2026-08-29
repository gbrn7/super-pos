import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { DownloadCloud } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import axiosInstance from '@/lib/axios';
import apiMasterProducts from '@/routes/apiMasterProducts';
import { handleApiError } from '@/lib/utils';
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
            const route = apiMasterProducts.index();
            const response = await axiosInstance.get(route.url, {
                params: { limit: 999999 }
            });

            const masterProducts = response.data.data.items || [];

            const rows = masterProducts.map((masterProduct: any) => ({
                [t('page.master_product.form.name_label', 'Nama')]: masterProduct.name,
                [t('page.master_product.form.category_label', 'Kategori')]: masterProduct.category_name || '',
                [t('page.master_product.form.unit_label', 'Satuan')]: masterProduct.unit_name || '',
                [t('page.master_product.form.barcode_label', 'Barcode (Opsional)')]: masterProduct.barcode || '',
                [t('page.master_product.form.cost_price_label', 'Harga Modal')]: masterProduct.cost_price,
                [t('page.master_product.form.price_label', 'Harga Jual')]: masterProduct.price,
                [t('page.master_product.form.desc_label', 'Deskripsi (Opsional)')]: masterProduct.desc || '',
            }));

            const worksheet = XLSX.utils.json_to_sheet(rows);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Master Products');

            const fileName = `master-products_${new Date().toISOString().split('T')[0]}.xlsx`;
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


