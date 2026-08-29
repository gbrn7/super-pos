import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { DownloadCloud } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import axiosInstance from '@/lib/axios';
import apiCategories from '@/routes/apiCategories';
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
            const route = apiCategories.index();
            const response = await axiosInstance.get(route.url, {
                params: { limit: 999999 }
            });

            const categories = response.data.data.items || [];

            const rows = categories.map((category: any) => ({
                [t('page.category.form.name_label', 'Nama')]: category.name,
                [t('page.category.form.desc_label', 'Deskripsi')]: category.desc || '',
            }));

            const worksheet = XLSX.utils.json_to_sheet(rows);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Categories');

            const fileName = `categories_${new Date().toISOString().split('T')[0]}.xlsx`;
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
