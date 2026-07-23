import { CheckCircle2, Printer, ShoppingBag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import type { Transaction } from '@/support/models/transaction';
import ReceiptCard from './receipt-card';

export interface StoreSetting {
    id?: number;
    name: string;
    address: string;
    phone: string;
    email?: string | null;
    tax_number?: string | null;
    receipt_footer?: string | null;
}

interface ReceiptModalProps {
    open: boolean;
    transaction: Transaction | null;
    storeSetting?: StoreSetting | null;
    onClose: () => void;
    onNewTransaction: () => void;
}

export default function ReceiptModal({
    open,
    transaction,
    storeSetting,
    onClose,
    onNewTransaction,
}: ReceiptModalProps) {
    const { t } = useTranslation();

    if (!transaction) {
        return null;
    }

    // Default fallback settings
    const finalStoreSetting = storeSetting || {
        name: 'Toko Maju Jaya',
        address: 'Jl. Raya Bekasi KM.18 RT.004/0009, Jakarta Timur, 13250',
        phone: '081234567890',
        email: 'support@tokomajujaya.com',
        receipt_footer: null,
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-sm sm:max-w-md">
                <DialogHeader className="print:hidden">
                    <div className="flex flex-col items-center gap-3 pt-2">
                        <div className="rounded-full bg-emerald-100 p-3 dark:bg-emerald-900/30">
                            <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <DialogTitle className="text-center text-lg font-extrabold">
                            {t('page.kasir.checkout_success', 'Transaksi Berhasil!')}
                        </DialogTitle>
                    </div>
                </DialogHeader>

                {/* Printable Receipt Card */}
                <ReceiptCard
                    storeName={finalStoreSetting.name}
                    storeAddress={finalStoreSetting.address}
                    storePhone={finalStoreSetting.phone}
                    storeEmail={finalStoreSetting.email}
                    storeReceiptFooter={finalStoreSetting.receipt_footer}
                    transaction={transaction}
                />

                <DialogFooter className="flex-row gap-2 sm:flex-row print:hidden">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-10 flex-1 gap-1.5 font-bold"
                        onClick={() => window.print()}
                    >
                        <Printer className="h-4 w-4" />
                        {t('page.kasir.print_btn', 'Print')}
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        className="h-10 flex-1 gap-1.5 bg-emerald-600 font-extrabold text-white hover:bg-emerald-700"
                        onClick={onNewTransaction}
                    >
                        <ShoppingBag className="h-4 w-4" />
                        {t('page.kasir.new_transaction', 'Transaksi Baru')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
