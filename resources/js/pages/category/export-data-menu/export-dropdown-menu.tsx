import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { DownloadCloud } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import axiosInstance from '@/lib/axios';
import apiCategories from '@/routes/apiCategories';
import { handleApiError } from '@/lib/utils';

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
            const route = apiCategories.exportCategoriesExcelData();
            const response = await axiosInstance.get(route.url, {
                responseType: 'blob',
            });

            const blob = new Blob([response.data], {
                type:
                    response.headers['content-type'] ||
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;

            const contentDisposition = response.headers['content-disposition'];
            let fileName = `categories_${new Date().toISOString().split('T')[0]}.xlsx`;
            if (contentDisposition) {
                const match = contentDisposition.match(/filename="?([^";]+)"?/);
                if (match && match[1]) {
                    fileName = match[1];
                }
            }

            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
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
