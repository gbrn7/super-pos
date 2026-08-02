import { AlertCircle, Barcode as BarcodeIcon, Minus, Plus } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactBarcode from 'react-barcode';
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
import axiosInstance from '@/lib/axios';
import { handleApiError } from '@/lib/utils';
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

    const hasBarcode = Boolean(product?.barcode && product.barcode.trim() !== '');

    const handlePrint = async () => {
        if (!product || !hasBarcode) return;

        try {
            setLoading(true);
            setErrorMessage(null);

            const response = await axiosInstance.post(
                `/api/product/${product.id}/print-barcode`,
                { quantity },
                {
                    responseType: 'blob',
                },
            );

            const blob = new Blob([response.data], {
                type: 'application/pdf',
            });
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank');
            onOpenChange(false);
        } catch (error: any) {
            if (error?.response?.data instanceof Blob) {
                try {
                    const text = await error.response.data.text();
                    const json = JSON.parse(text);
                    setErrorMessage(
                        json.message ||
                            t(
                                'page.product.dialog_modal.print_barcode_dialog.no_barcode_error',
                                'Barcode tidak ditemukan pada produk ini.',
                            ),
                    );
                } catch {
                    setErrorMessage(
                        t(
                            'page.product.dialog_modal.print_barcode_dialog.no_barcode_error',
                            'Barcode tidak ditemukan pada produk ini.',
                        ),
                    );
                }
            } else {
                handleApiError(error);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <BarcodeIcon className="h-5 w-5" />
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

                {!hasBarcode && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            {t(
                                'page.product.dialog_modal.print_barcode_dialog.no_barcode_error',
                                'Produk ini belum memiliki kode barcode.',
                            )}
                        </AlertDescription>
                    </Alert>
                )}

                {errorMessage && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{errorMessage}</AlertDescription>
                    </Alert>
                )}

                <div className="grid gap-4 py-2">
                    <div className="flex flex-col items-center justify-center rounded-lg border p-4 bg-muted/20">
                        <span className="font-semibold text-base mb-2">
                            {product?.name}
                        </span>
                        {hasBarcode ? (
                            <div className="flex flex-col items-center justify-center rounded-md bg-white p-1.5 shadow-sm text-black">
                                <ReactBarcode
                                    value={product!.barcode}
                                    format="CODE128"
                                    width={1.8}
                                    height={50}
                                    fontSize={12}
                                    lineColor="#000000"
                                    background="#ffffff"
                                />
                            </div>
                        ) : (
                            <span className="text-sm text-muted-foreground italic my-4">
                                ({t(
                                    'page.product.dialog_modal.print_barcode_dialog.no_barcode_error',
                                    'Produk ini belum memiliki kode barcode.',
                                )})
                            </span>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="quantity" className="text-center">
                            {t(
                                'page.product.dialog_modal.print_barcode_dialog.quantity_label',
                                'Jumlah Barcode',
                            )}
                        </Label>
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                disabled={!hasBarcode || loading || quantity <= 1}
                                onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                            >
                                <Minus className="h-4 w-4" />
                            </Button>
                            <Input
                                id="quantity"
                                type="number"
                                min={1}
                                max={500}
                                disabled={!hasBarcode || loading}
                                value={quantity}
                                onChange={(e) =>
                                    setQuantity(Math.max(1, Math.min(500, Number(e.target.value) || 1)))
                                }
                                className="text-center font-medium"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                disabled={!hasBarcode || loading || quantity >= 500}
                                onClick={() => setQuantity((prev) => Math.min(500, prev + 1))}
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
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
                    <Button onClick={handlePrint} disabled={!hasBarcode || loading}>
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
