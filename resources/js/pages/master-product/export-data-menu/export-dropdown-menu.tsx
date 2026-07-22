import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslation } from 'react-i18next';
import { DownloadCloud } from 'lucide-react';
import apiMasterProducts from '@/routes/apiMasterProducts';

interface ExportDropdownMenuProps<TData> {
    data: TData[];
}

export function ExportDropdownMenu<TData>({
    data: data,
}: ExportDropdownMenuProps<TData>) {
    const { t } = useTranslation();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">
                    <DownloadCloud className="h-4" />
                    {t('component.data_table.export.label', 'Ekspor')}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuGroup>
                    <DropdownMenuItem>
                        <a
                            href={
                                apiMasterProducts.exportMasterProductsExcelData()
                                    .url
                            }
                        >
                            {t(
                                'component.data_table.export.export_excel_btn',
                                'Ekspor Excel',
                            )}
                        </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <a
                            href={
                                apiMasterProducts.exportMasterProductsPdfData()
                                    .url
                            }
                        >
                            {t(
                                'component.data_table.export.export_pdf_btn',
                                'Ekspor Pdf',
                            )}
                        </a>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
