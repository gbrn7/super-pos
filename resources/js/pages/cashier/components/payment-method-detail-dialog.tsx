import { useState } from 'react';
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
import { Banknote, Check, Image as ImageIcon, Maximize2 } from 'lucide-react';
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
    const [previewImageOpen, setPreviewImageOpen] = useState(false);

    if (!paymentMethod) {
        return null;
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-lg p-6 sm:max-w-xl">
                <DialogHeader className="border-b pb-3">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <div className="shrink-0 rounded-lg bg-primary/10 p-2 text-primary">
                                <Banknote className="h-5 w-5" />
                            </div>
                            <DialogTitle className="text-lg leading-tight font-extrabold sm:text-xl">
                                {paymentMethod.name}
                            </DialogTitle>
                        </div>
                        {isSelected && (
                            <Badge className="shrink-0 gap-1 bg-emerald-600 text-xs font-bold text-white">
                                <Check className="h-3 w-3" />{' '}
                                {t('page.kasir.selected', 'Terpilih')}
                            </Badge>
                        )}
                    </div>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {/* Gambar (Logo / QR Code) */}
                    {paymentMethod.image ? (
                        <div className="group relative flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/30 p-4">
                            <img
                                src={paymentMethod.image}
                                alt={paymentMethod.name}
                                className="max-h-[420px] w-auto max-w-full rounded-xl bg-white object-contain p-3 shadow-sm"
                                onError={(e) => {
                                    (e.target as HTMLElement).style.display =
                                        'none';
                                }}
                            />
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                className="absolute right-3 bottom-3 gap-1.5 rounded-lg bg-background/90 font-medium shadow-md backdrop-blur-sm transition-all hover:bg-background"
                                onClick={() => setPreviewImageOpen(true)}
                            >
                                <Maximize2 className="h-4 w-4" />
                                {t('page.kasir.view_large_image', 'Perbesar Gambar')}
                            </Button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20 p-8 text-center text-muted-foreground">
                            <ImageIcon className="mb-2 h-12 w-12 opacity-30" />
                            <p className="text-sm font-medium">
                                {t(
                                    'page.kasir.no_payment_image',
                                    'Tidak ada gambar pendukung',
                                )}
                            </p>
                        </div>
                    )}

                    {/* Deskripsi / Instruksi Pembayaran */}
                    <div className="space-y-1.5">
                        <span className="block text-xs font-bold tracking-wider text-muted-foreground uppercase">
                            {t(
                                'page.kasir.payment_method_desc_label',
                                'Deskripsi / Instruksi:',
                            )}
                        </span>
                        <div className="rounded-xl border bg-muted/40 p-3.5 text-xs leading-relaxed font-medium whitespace-pre-line text-foreground sm:text-sm">
                            {paymentMethod.desc
                                ? paymentMethod.desc
                                : t(
                                      'page.kasir.no_payment_desc',
                                      'Tidak ada deskripsi tambahan.',
                                  )}
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex-row gap-2 border-t pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        className="h-10 flex-1 text-xs font-bold sm:text-sm"
                        onClick={onClose}
                    >
                        {t('page.kasir.close_btn', 'Tutup')}
                    </Button>
                    <Button
                        type="button"
                        className="h-10 flex-1 bg-primary text-xs font-extrabold sm:text-sm"
                        onClick={() => {
                            onSelect(String(paymentMethod.id));
                            onClose();
                        }}
                    >
                        <Check className="mr-1.5 h-4 w-4" />
                        {t('page.kasir.select_this_method', 'Pilih Metode Ini')}
                    </Button>
                </DialogFooter>
            </DialogContent>

            {/* Jendela Full-Screen / Besar Khusus Gambar */}
            {paymentMethod.image && (
                <Dialog
                    open={previewImageOpen}
                    onOpenChange={setPreviewImageOpen}
                >
                    <DialogContent className="flex max-h-[95vh] max-w-[95vw] flex-col items-center justify-center border-none bg-black/90 p-4 text-white sm:max-w-4xl">
                        <DialogHeader className="w-full pb-2">
                            <DialogTitle className="text-center text-lg font-bold text-white">
                                {paymentMethod.name}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="flex max-h-[80vh] w-full items-center justify-center overflow-auto p-2">
                            <img
                                src={paymentMethod.image}
                                alt={paymentMethod.name}
                                className="max-h-[75vh] max-w-full rounded-xl bg-white object-contain p-4 shadow-2xl"
                            />
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </Dialog>
    );
}
