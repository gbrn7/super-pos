import { PaymentMethod } from '@/support/models/paymentMethod';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Banknote, Check, Image as ImageIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PaymentMethodDetailDialogProps {
    open: boolean;
    paymentMethod: PaymentMethod | null;
    isSelected: boolean;
    onClose: () => void;
    onSelect: (id: string) => void;
}

export default function PaymentMethodDetailDialog({
    open,
    paymentMethod,
    isSelected,
    onClose,
    onSelect,
}: PaymentMethodDetailDialogProps) {
    const { t } = useTranslation();

    if (!paymentMethod) {
        return null;
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-sm sm:max-w-md p-5">
                <DialogHeader className="border-b pb-3">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-primary/10 text-primary rounded-lg shrink-0">
                                <Banknote className="w-5 h-5" />
                            </div>
                            <DialogTitle className="text-base sm:text-lg font-extrabold leading-tight">
                                {paymentMethod.name}
                            </DialogTitle>
                        </div>
                        {isSelected && (
                            <Badge className="bg-emerald-600 text-white font-bold gap-1 text-xs shrink-0">
                                <Check className="w-3 h-3" /> {t('page.kasir.selected', 'Terpilih')}
                            </Badge>
                        )}
                    </div>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {/* Gambar (Logo / QR Code) */}
                    {paymentMethod.image ? (
                        <div className="flex flex-col items-center justify-center p-3 bg-muted/30 rounded-xl border border-dashed">
                            <img
                                src={paymentMethod.image}
                                alt={paymentMethod.name}
                                className="max-h-60 max-w-full object-contain rounded-lg shadow-xs bg-white p-2"
                                onError={(e) => {
                                    (e.target as HTMLElement).style.display = 'none';
                                }}
                            />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-6 bg-muted/20 rounded-xl border border-dashed text-muted-foreground text-center">
                            <ImageIcon className="w-10 h-10 opacity-30 mb-1" />
                            <p className="text-xs font-medium">{t('page.kasir.no_payment_image', 'Tidak ada gambar pendukung')}</p>
                        </div>
                    )}

                    {/* Deskripsi / Instruksi Pembayaran */}
                    <div className="space-y-1.5">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                            {t('page.kasir.payment_method_desc_label', 'Deskripsi / Instruksi:')}
                        </span>
                        <div className="p-3.5 bg-muted/40 rounded-xl border text-xs sm:text-sm text-foreground whitespace-pre-line leading-relaxed font-medium">
                            {paymentMethod.desc ? paymentMethod.desc : t('page.kasir.no_payment_desc', 'Tidak ada deskripsi tambahan.')}
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex-row gap-2 pt-2 border-t">
                    <Button
                        type="button"
                        variant="outline"
                        className="flex-1 font-bold h-10 text-xs sm:text-sm"
                        onClick={onClose}
                    >
                        {t('page.kasir.close_btn', 'Tutup')}
                    </Button>
                    <Button
                        type="button"
                        className="flex-1 font-extrabold h-10 text-xs sm:text-sm bg-primary"
                        onClick={() => {
                            onSelect(String(paymentMethod.id));
                            onClose();
                        }}
                    >
                        <Check className="w-4 h-4 mr-1.5" />
                        {t('page.kasir.select_this_method', 'Pilih Metode Ini')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
