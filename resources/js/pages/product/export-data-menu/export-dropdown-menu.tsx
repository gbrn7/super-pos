import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { DownloadCloud } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import axiosInstance from '@/lib/axios';
import apiProducts from '@/routes/apiProducts';
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
            
            // Fetch all products with a very high limit to get all records
            const route = apiProducts.index();
            const response = await axiosInstance.get(route.url, {
                params: { limit: 999999 }
            });
            
            const products = response.data.data.items || [];
            
            // Map data to Excel columns
            const rows = products.map((product: any) => ({
                [t('page.product.form.name_label', 'Nama')]: product.name,
                [t('page.product.form.sku_label', 'SKU')]: product.sku,
                [t('page.product.form.barcode_label', 'Barcode')]: product.barcode,
                [t('page.product.form.category_label', 'Kategori')]: product.category?.name || '',
                [t('page.product.form.unit_label', 'Satuan')]: product.unit?.name || '',
                [t('page.product.form.stock_label', 'Stok')]: product.stock,
                [t('page.product.form.cost_price_label', 'Harga Modal')]: product.cost_price,
                [t('page.product.form.price_label', 'Harga Jual')]: product.price,
                [t('page.product.form.status_label', 'Status')]: product.is_active ? 'Aktif' : 'Tidak Aktif',
                [t('page.product.form.stock_type_label', 'Tipe Stok')]: product.is_unlimited ? 'Tidak Terbatas' : 'Terbatas',
                [t('page.product.form.desc_label', 'Deskripsi')]: product.desc || '',
            }));

            // Generate workbook and download
            const worksheet = XLSX.utils.json_to_sheet(rows);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
            
            const fileName = `products_${new Date().toISOString().split('T')[0]}.xlsx`;
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

