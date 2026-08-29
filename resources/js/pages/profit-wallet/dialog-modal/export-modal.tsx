import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DownloadCloud, FileText, FileSpreadsheet, Loader2 } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import axiosInstance from '@/lib/axios';
import { index as apiGetProfitWallet, exportData as apiExportProfitWallet } from '@/routes/apiProfitWallet';
import { handleApiError, showSuccessToast } from '@/lib/utils';
import * as XLSX from 'xlsx';

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    defaultStartDate?: string | null;
    defaultEndDate?: string | null;
}

export function ExportModal({
    isOpen,
    onClose,
    defaultStartDate,
    defaultEndDate,
}: ExportModalProps) {
    const { t } = useTranslation();

    const [format, setFormat] = useState<'pdf' | 'excel'>('pdf');

    const getDefaultDates = () => {
        const today = new Date();
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(today.getMonth() - 1);

        const defaultStart = defaultStartDate
            ? defaultStartDate
            : oneMonthAgo.toISOString().slice(0, 10);

        const defaultEnd = defaultEndDate
            ? defaultEndDate
            : today.toISOString().slice(0, 10);

        return { defaultStart, defaultEnd };
    };

    const initialDates = getDefaultDates();
    const [startDate, setStartDate] = useState<string>(initialDates.defaultStart);
    const [endDate, setEndDate] = useState<string>(initialDates.defaultEnd);
    const [loading, setLoading] = useState<boolean>(false);

    React.useEffect(() => {
        if (isOpen) {
            const { defaultStart, defaultEnd } = getDefaultDates();
            setStartDate(defaultStart);
            setEndDate(defaultEnd);
        }
    }, [isOpen, defaultStartDate, defaultEndDate]);

    const handleExport = async () => {
        try {
            setLoading(true);

            const params: Record<string, any> = {};

            if (startDate) {
                params.start_date = startDate;
            }

            if (endDate) {
                params.end_date = endDate;
            }

            if (format === 'excel') {
                const exportUrl = apiGetProfitWallet({ query: params }).url;
                const response = await axiosInstance.get(exportUrl);
                
                if (response.data.success) {
                    const transactions = response.data.data.transactions?.items || [];

                    const rows = transactions.map((tx: any) => {
                        let txTypeLabel = tx.transaction_type;
                        if (tx.transaction_type === 'sales_profit') {
                            txTypeLabel = t('page.profit_wallet.data_table.filters.tx_sales_profit', 'Profit Penjualan');
                        } else if (tx.transaction_type === 'disbursement') {
                            txTypeLabel = t('page.profit_wallet.data_table.filters.tx_disbursement', 'Disburse Ke Pemilik');
                        } else if (tx.transaction_type === 'capital_withdrawal') {
                            txTypeLabel = t('page.profit_wallet.data_table.filters.tx_capital_withdrawal', 'Penarikan Modal');
                        } else if (tx.transaction_type === 'sales_return_deduction') {
                            txTypeLabel = t('page.profit_wallet.data_table.filters.tx_sales_return_deduction', 'Potongan Retur');
                        }

                        const flowLabel = tx.type === 'in' ? 'Masuk' : 'Keluar';

                        const formattedDate = tx.created_at
                            ? new Date(tx.created_at).toISOString().replace('T', ' ').slice(0, 19)
                            : '-';

                        return {
                            'Tanggal': formattedDate,
                            'Tipe Transaksi': txTypeLabel,
                            'Arah': flowLabel,
                            'Jumlah': parseFloat(tx.amount || 0),
                            'Saldo Sebelum': parseFloat(tx.balance_before || 0),
                            'Saldo Sesudah': parseFloat(tx.balance_after || 0),
                            'Catatan': tx.notes || '-',
                        };
                    });

                    const worksheet = XLSX.utils.json_to_sheet(rows);
                    const workbook = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(workbook, worksheet, 'Dompet Profit');

                    const fileName = `laporan-dompet-profit-${new Date().toISOString().slice(0, 10)}.xlsx`;
                    XLSX.writeFile(workbook, fileName);

                    showSuccessToast(t('message.success.success', 'Ekspor berhasil'));
                    onClose();
                }
            } else {
                params.format = 'pdf';
                const exportUrl = apiExportProfitWallet({ query: params }).url;
                const response = await axiosInstance.get(exportUrl, {
                    responseType: 'blob',
                });

                const blob = new Blob([response.data], {
                    type: 'application/pdf',
                });

                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute(
                    'download',
                    `laporan-dompet-profit-${new Date().toISOString().slice(0, 10)}.pdf`,
                );
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(url);

                showSuccessToast(t('message.success.success', 'Ekspor berhasil'));
                onClose();
            }
        } catch (error) {
            handleApiError(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <DownloadCloud className="h-5 w-5 text-primary" />
                        {t('component.export_modal.profit_title', 'Ekspor Laporan Dompet Profit')}
                    </DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {/* Date Range Selection */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium">
                                {t('component.data_table.filter.start_date_label', 'Tanggal Mulai')}
                            </Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start text-left font-normal text-xs h-9">
                                        {startDate ? (
                                            new Date(startDate).toLocaleDateString('id-ID')
                                        ) : (
                                            <span className="text-muted-foreground">Pilih Tanggal</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <CalendarPicker
                                        mode="single"
                                        selected={startDate ? new Date(startDate) : undefined}
                                        onSelect={(date) => {
                                            if (date) {
                                                const iso = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
                                                setStartDate(iso);
                                            }
                                        }}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium">
                                {t('component.data_table.filter.end_date_label', 'Tanggal Akhir')}
                            </Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start text-left font-normal text-xs h-9">
                                        {endDate ? (
                                            new Date(endDate).toLocaleDateString('id-ID')
                                        ) : (
                                            <span className="text-muted-foreground">Pilih Tanggal</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <CalendarPicker
                                        mode="single"
                                        selected={endDate ? new Date(endDate) : undefined}
                                        onSelect={(date) => {
                                            if (date) {
                                                const iso = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
                                                setEndDate(iso);
                                            }
                                        }}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    {/* Format Selection */}
                    <div className="space-y-2 pt-2">
                        <Label className="text-xs font-medium">
                            {t('component.export_modal.format_label', 'Format Laporan')}
                        </Label>
                        <div className="grid grid-cols-2 gap-3">
                            <label
                                htmlFor="format-pdf"
                                className={`flex cursor-pointer flex-col items-center justify-between rounded-md border-2 p-3 transition-colors ${
                                    format === 'pdf'
                                        ? 'border-primary bg-accent/50'
                                        : 'border-muted bg-popover hover:bg-accent'
                                }`}
                            >
                                <input
                                    type="radio"
                                    id="format-pdf"
                                    name="format"
                                    value="pdf"
                                    checked={format === 'pdf'}
                                    onChange={() => setFormat('pdf')}
                                    className="sr-only"
                                />
                                <FileText className="mb-2 h-6 w-6 text-red-500" />
                                <span className="text-xs font-medium">PDF Document</span>
                            </label>

                            <label
                                htmlFor="format-excel"
                                className={`flex cursor-pointer flex-col items-center justify-between rounded-md border-2 p-3 transition-colors ${
                                    format === 'excel'
                                        ? 'border-primary bg-accent/50'
                                        : 'border-muted bg-popover hover:bg-accent'
                                }`}
                            >
                                <input
                                    type="radio"
                                    id="format-excel"
                                    name="format"
                                    value="excel"
                                    checked={format === 'excel'}
                                    onChange={() => setFormat('excel')}
                                    className="sr-only"
                                />
                                <FileSpreadsheet className="mb-2 h-6 w-6 text-green-600" />
                                <span className="text-xs font-medium">Excel Spreadsheet</span>
                            </label>
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        {t('common.cancel', 'Batal')}
                    </Button>
                    <Button onClick={handleExport} disabled={loading}>
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {t('common.processing', 'Memproses...')}
                            </>
                        ) : (
                            <>
                                <DownloadCloud className="mr-2 h-4 w-4" />
                                {t('common.download', 'Unduh')}
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
