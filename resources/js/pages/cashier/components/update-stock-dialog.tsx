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
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Boxes, Package, Plus, Minus, Check, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import axiosInstance from '@/lib/axios';
import { update as apiUpdateProduct } from '@/routes/apiProducts';
import { handleApiError, showSuccessToast } from '@/lib/utils';
import type { ResponseApi } from '@/support/interfaces/response/Response';

interface UpdateStockDialogProps {
    open: boolean;
    product: Product | null;
    onClose: () => void;
    onSuccess: (updatedProduct: Product) => void;
}

export default function UpdateStockDialog({
    open,
    product,
    onClose,
    onSuccess,
}: UpdateStockDialogProps) {
    const { t } = useTranslation();
    const [stock, setStock] = useState<number | ''>('');
    const [isUnlimited, setIsUnlimited] = useState<boolean>(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (product) {
            setStock(product.stock ?? 0);
            setIsUnlimited(product.is_unlimited ?? false);
        }
    }, [product]);

    if (!product) return null;

    const handleAdjust = (amount: number) => {
        setStock((prev) => {
            const current = typeof prev === 'number' ? prev : 0;
            return Math.max(0, current + amount);
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (submitting) return;

        setSubmitting(true);
        try {
            const newStockValue = typeof stock === 'number' ? stock : 0;
            const payload = {
                category_id: product.category_id,
                unit_id: product.unit_id,
                name: product.name,
                price: product.price,
                cost_price: product.cost_price,
                barcode: product.barcode,
                sku: product.sku,
                is_active: product.is_active ?? true,
                is_unlimited: isUnlimited,
                stock: newStockValue,
            };

            const url = apiUpdateProduct(product.id).url;
            const { data } = await axiosInstance.put<ResponseApi<Product>>(url, payload);

            if (data.success) {
                showSuccessToast(t('page.kasir.stock_update_success', 'Stok produk berhasil diperbarui!'));
                onSuccess(data.data || { ...product, stock: newStockValue, is_unlimited: isUnlimited });
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
            <DialogContent className="max-w-sm sm:max-w-md p-5">
                <form onSubmit={handleSubmit}>
                    <DialogHeader className="border-b pb-3">
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 bg-primary/10 text-primary rounded-lg shrink-0">
                                <Boxes className="w-5 h-5" />
                            </div>
                            <div>
                                <DialogTitle className="text-base sm:text-lg font-extrabold leading-tight">
                                    {t('page.kasir.update_stock_title', 'Update Stok Produk')}
                                </DialogTitle>
                                <p className="text-xs text-muted-foreground font-medium mt-0.5">
                                    {product.name} ({product.unit_name || '-'})
                                </p>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {/* Current Stock Info Card */}
                        <div className="p-3 bg-muted/40 rounded-xl border flex items-center justify-between text-xs sm:text-sm">
                            <span className="font-bold text-muted-foreground flex items-center gap-1.5">
                                <Package className="w-4 h-4" />
                                {t('page.kasir.current_stock_label', 'Stok Saat Ini:')}
                            </span>
                            <Badge variant={product.stock <= 0 ? 'destructive' : 'secondary'} className="font-bold text-xs">
                                {product.is_unlimited
                                    ? t('page.kasir.unlimited_stock', 'Tak Terbatas')
                                    : `${product.stock} ${product.unit_name || ''}`}
                            </Badge>
                        </div>

                        {/* Unlimited Stock Switch */}
                        <div className="flex items-center justify-between p-3 rounded-xl border bg-background">
                            <div className="space-y-0.5">
                                <Label className="text-xs sm:text-sm font-extrabold cursor-pointer">
                                    {t('page.kasir.unlimited_stock_label', 'Stok Tak Terbatas')}
                                </Label>
                                <p className="text-[11px] text-muted-foreground">
                                    {t('page.kasir.unlimited_stock_desc', 'Produk tidak memerlukan pelacakan stok')}
                                </p>
                            </div>
                            <Switch
                                checked={isUnlimited}
                                onCheckedChange={setIsUnlimited}
                            />
                        </div>

                        {/* Stock Quantity Input & Adjust Buttons */}
                        {!isUnlimited && (
                            <div className="space-y-2">
                                <Label className="text-xs sm:text-sm font-extrabold">
                                    {t('page.kasir.new_stock_label', 'Jumlah Stok Baru')}
                                </Label>
                                <div className="flex items-center gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        className="h-10 w-10 shrink-0 font-bold"
                                        onClick={() => handleAdjust(-1)}
                                    >
                                        <Minus className="w-4 h-4" />
                                    </Button>
                                    <Input
                                        type="number"
                                        min={0}
                                        value={stock}
                                        onChange={(e) => setStock(e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value) || 0))}
                                        className="h-10 text-center font-extrabold text-base"
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
                                        <Plus className="w-4 h-4" />
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
                                            className="h-7 text-xs font-bold px-2.5"
                                            onClick={() => handleAdjust(preset)}
                                        >
                                            +{preset}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="flex-row gap-2 pt-2 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1 font-bold h-10 text-xs sm:text-sm"
                            onClick={onClose}
                            disabled={submitting}
                        >
                            {t('page.kasir.cancel_btn', 'Batal')}
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1 font-extrabold h-10 text-xs sm:text-sm bg-primary"
                            disabled={submitting}
                        >
                            {submitting ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                            ) : (
                                <Check className="w-4 h-4 mr-1.5" />
                            )}
                            {t('page.kasir.save_stock_btn', 'Simpan Stok')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
