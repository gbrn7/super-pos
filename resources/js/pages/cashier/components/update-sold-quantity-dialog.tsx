import { useState, useEffect } from 'react';
import { Product } from '@/support/models/product';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Boxes, Package, Plus, Minus, Check, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import axiosInstance from '@/lib/axios';
import { update as apiUpdateProduct } from '@/routes/apiProducts';
import { handleApiError, showSuccessToast } from '@/lib/utils';
import type { ResponseApi } from '@/support/interfaces/response/Response';

interface UpdateSoldQuantityDialogProps {
    open: boolean;
    product: Product | null;
    onClose: () => void;
    onSuccess: (updatedProduct: Product) => void;
}

export default function UpdateSoldQuantityDialog({
    open,
    product,
    onClose,
    onSuccess,
}: UpdateSoldQuantityDialogProps) {
    const { t } = useTranslation();
    const [soldQuantity, setSoldQuantity] = useState<number | ''>('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (product) {
            setSoldQuantity(product.sold_quantity ?? 0);
        }
    }, [product]);

    if (!product) return null;

    const handleAdjust = (amount: number) => {
        setSoldQuantity((prev) => {
            const current = typeof prev === 'number' ? prev : 0;
            return Math.max(0, current + amount);
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (submitting) return;

        setSubmitting(true);
        try {
            const newSoldQuantityValue = typeof soldQuantity === 'number' ? soldQuantity : 0;
            const payload = {
                category_id: product.category_id,
                unit_id: product.unit_id,
                name: product.name,
                price: product.price,
                cost_price: product.cost_price,
                barcode: product.barcode,
                sku: product.sku,
                is_active: product.is_active ?? true,
                is_unlimited: product.is_unlimited ?? false,
                stock: product.stock ?? 0,
                sold_quantity: newSoldQuantityValue,
            };

            const url = apiUpdateProduct(product.id).url;
            const { data } = await axiosInstance.put<ResponseApi<Product>>(
                url,
                payload,
            );

            if (data.success) {
                showSuccessToast(
                    t(
                        'page.kasir.sold_quantity_update_success',
                        'Jumlah terjual produk berhasil diperbarui!',
                    ),
                );
                onSuccess(
                    data.data || {
                        ...product,
                        sold_quantity: newSoldQuantityValue,
                    },
                );
                onClose();
            }
        } catch (err) {
            handleApiError(err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-sm p-5 sm:max-w-md">
                <form onSubmit={handleSubmit}>
                    <DialogHeader className="border-b pb-3">
                        <div className="flex items-center gap-2.5">
                            <div className="shrink-0 rounded-lg bg-primary/10 p-2 text-primary">
                                <Boxes className="h-5 w-5" />
                            </div>
                            <div>
                                <DialogTitle className="text-base leading-tight font-extrabold sm:text-lg">
                                    {t(
                                        'page.kasir.update_sold_quantity_title',
                                        'Update Jumlah Terjual',
                                    )}
                                </DialogTitle>
                                <p className="mt-0.5 text-xs font-medium text-muted-foreground">
                                    {product.name} ({product.unit_name || '-'})
                                </p>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {/* Current Sold Info Card */}
                        <div className="flex items-center justify-between rounded-xl border bg-muted/40 p-3 text-xs sm:text-sm">
                            <span className="flex items-center gap-1.5 font-bold text-muted-foreground">
                                <Package className="h-4 w-4" />
                                {t(
                                    'page.kasir.current_sold_quantity_label',
                                    'Jumlah Terjual Saat Ini:',
                                )}
                            </span>
                            <Badge
                                variant="secondary"
                                className="text-xs font-bold"
                            >
                                {`${product.sold_quantity ?? 0} ${product.unit_name || ''}`}
                            </Badge>
                        </div>

                        {/* Sold Quantity Input & Adjust Buttons */}
                        <div className="space-y-2">
                            <Label className="text-xs font-extrabold sm:text-sm">
                                {t(
                                    'page.kasir.new_sold_quantity_label',
                                    'Jumlah Terjual Baru',
                                )}
                            </Label>
                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="h-10 w-10 shrink-0 font-bold"
                                    onClick={() => handleAdjust(-1)}
                                >
                                    <Minus className="h-4 w-4" />
                                </Button>
                                <Input
                                    type="number"
                                    min={0}
                                    value={soldQuantity}
                                    onChange={(e) =>
                                        setSoldQuantity(
                                            e.target.value === ''
                                                ? ''
                                                : Math.max(
                                                      0,
                                                      parseInt(
                                                          e.target.value,
                                                      ) || 0,
                                                  ),
                                        )
                                    }
                                    className="h-10 text-center text-base font-extrabold"
                                    placeholder="0"
                                    required
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="h-10 w-10 shrink-0 font-bold"
                                    onClick={() => handleAdjust(1)}
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>

                            {/* Quick Increment Preset Buttons */}
                            <div className="flex flex-wrap gap-1.5 pt-1">
                                {[+5, +10, +50, +100].map((preset) => (
                                    <Button
                                        key={preset}
                                        type="button"
                                        variant="secondary"
                                        size="sm"
                                        className="h-7 px-2.5 text-xs font-bold"
                                        onClick={() => handleAdjust(preset)}
                                    >
                                        +{preset}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="flex-row gap-2 border-t pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            className="h-10 flex-1 text-xs font-bold sm:text-sm"
                            onClick={onClose}
                            disabled={submitting}
                        >
                            {t('page.kasir.cancel_btn', 'Batal')}
                        </Button>
                        <Button
                            type="submit"
                            className="h-10 flex-1 bg-primary text-xs font-extrabold sm:text-sm"
                            disabled={submitting}
                        >
                            {submitting ? (
                                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                            ) : (
                                <Check className="mr-1.5 h-4 w-4" />
                            )}
                            {t('page.kasir.save_sold_quantity_btn', 'Simpan Terjual')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
