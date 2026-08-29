import { DownloadCloud } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import axiosInstance from '@/lib/axios';
import { handleApiError } from '@/lib/utils';
import apiUnits from '@/routes/apiUnits';
import * as XLSX from 'xlsx';

interface ExportDropdownMenuProps<TData> {
    data?: TData[];
}

export function ExportDropdownMenu() {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);

    const handleExport = async () => {
        try {
            setLoading(true);
            const route = apiUnits.index();
            const response = await axiosInstance.get(route.url);

            const units = response.data.data || [];

            const rows = units.map((unit: any) => ({
                [t('page.unit.form.name_label', 'Nama')]: unit.name,
            }));

            const worksheet = XLSX.utils.json_to_sheet(rows);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Units');

            const fileName = `units_${new Date().toISOString().split('T')[0]}.xlsx`;
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
