import { AlertCircle, Barcode } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Product } from '@/support/models/product';

interface PrintBarcodeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product: Product | null;
}

export function PrintBarcodeDialog({
    open,
    onOpenChange,
    product,
}: PrintBarcodeDialogProps) {
    const { t } = useTranslation();
    const [quantity, setQuantity] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handlePrint = async () => {
        if (!product) return;

        if (!product.barcode) {
            setErrorMessage(
                t(
                    'page.product.dialog_modal.print_barcode_dialog.no_barcode_error',
                    'Produk ini belum memiliki kode barcode.',
                ),
            );
            return;
        }

        try {
            setLoading(true);
            setErrorMessage(null);

            const response = await fetch(
                `/products/${product.id}/print-barcode`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/pdf, application/json',
                        'X-CSRF-TOKEN':
                            (
                                document.querySelector(
                                    'meta[name="csrf-token"]',
                                ) as HTMLMetaElement
                            )?.content || '',
                    },
                    body: JSON.stringify({ quantity }),
                },
            );

            if (!response.ok) {
                const data = await response.json();
                throw new Error(
                    data.message ||
                        t(
                            'page.product.dialog_modal.print_barcode_dialog.no_barcode_error',
                            'Barcode tidak ditemukan pada produk ini.',
                        ),
                );
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank');
            onOpenChange(false);
        } catch (error: any) {
            setErrorMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Barcode className="h-5 w-5" />
                        {t(
                            'page.product.dialog_modal.print_barcode_dialog.dialog_title',
                            'Cetak Barcode Produk',
                        )}
                    </DialogTitle>
                    <DialogDescription>
                        {t(
                            'page.product.dialog_modal.print_barcode_dialog.dialog_desc',
                            'Masukkan jumlah barcode yang ingin dicetak.',
                        )}
                    </DialogDescription>
                </DialogHeader>

                {errorMessage && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{errorMessage}</AlertDescription>
                    </Alert>
                )}

                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">
                            {t(
                                'page.product.dialog_modal.print_barcode_dialog.product_label',
                                'Produk',
                            )}
                        </Label>
                        <span className="col-span-3 font-semibold">
                            {product?.name} ({product?.barcode || '-'})
                        </span>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="quantity" className="text-right">
                            {t(
                                'page.product.dialog_modal.print_barcode_dialog.quantity_label',
                                'Jumlah Barcode',
                            )}
                        </Label>
                        <Input
                            id="quantity"
                            type="number"
                            min={1}
                            max={500}
                            value={quantity}
                            onChange={(e) =>
                                setQuantity(Number(e.target.value))
                            }
                            className="col-span-3"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                    >
                        {t(
                            'page.product.dialog_modal.print_barcode_dialog.cancel_button',
                            'Batal',
                        )}
                    </Button>
                    <Button onClick={handlePrint} disabled={loading}>
                        {loading
                            ? 'Processing...'
                            : t(
                                  'page.product.dialog_modal.print_barcode_dialog.confirm_button',
                                  'Cetak PDF',
                              )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
