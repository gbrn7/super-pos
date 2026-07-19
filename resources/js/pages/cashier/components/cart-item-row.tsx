import { useTranslation } from 'react-i18next';
import { CartItem } from '../index';
import { formatRupiah } from '@/lib/format-money';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NumericFormat } from 'react-number-format';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CartItemRowProps {
    item: CartItem;
    onUpdateQty: (productId: number, qty: number) => void;
    onUpdateDiscount: (productId: number, discount: number, discountType: 'nominal' | 'percent') => void;
    onRemove: (productId: number) => void;
}

export default function CartItemRow({ item, onUpdateQty, onUpdateDiscount, onRemove }: CartItemRowProps) {
    const { t } = useTranslation();
    const discountType = item.discountType || 'nominal';
    const discountPerUnit = discountType === 'percent'
        ? (item.product.price * (item.discount || 0)) / 100
        : (item.discount || 0);

    const priceAfterDiscount = Math.max(0, item.product.price - discountPerUnit);
    const subtotal = priceAfterDiscount * item.quantity;

    return (
        <div className="group flex flex-col gap-2.5 p-3.5 rounded-xl border bg-card hover:bg-accent/40 transition-colors shadow-xs">
            {/* Top row: Name & Remove button */}
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                    <p className="text-base font-extrabold leading-tight text-foreground line-clamp-2">
                        {item.product.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 font-mono font-semibold">
                        {item.product.barcode || item.product.sku ? `${item.product.barcode || item.product.sku} · ` : ''}
                        {item.product.unit_name ? `${item.product.unit_name} · ` : ''}
                        <span className="text-foreground font-bold">@ {formatRupiah(item.product.price)}</span>
                    </p>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity"
                    onClick={() => onRemove(item.product.id)}
                    title={t('page.kasir.remove_item', 'Hapus barang')}
                >
                    <Trash2 className="w-4 h-4" />
                </Button>
            </div>

            {/* Bottom row: Controls (Qty & Discount) + Subtotal Price */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/60">
                {/* Qty controls */}
                <div className="flex items-center gap-1 shrink-0">
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 shrink-0 font-bold"
                        onClick={() => onUpdateQty(item.product.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                    >
                        <Minus className="w-4 h-4" />
                    </Button>
                    <Input
                        type="number"
                        value={item.quantity}
                        min={1}
                        max={item.product.is_unlimited ? undefined : item.product.stock}
                        onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            if (!isNaN(val) && val >= 1) {
                                onUpdateQty(item.product.id, val);
                            }
                        }}
                        className="h-8 w-12 text-center text-sm font-black px-1 font-mono border-primary/30"
                    />
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 shrink-0 font-bold"
                        onClick={() => onUpdateQty(item.product.id, item.quantity + 1)}
                        disabled={!item.product.is_unlimited && item.quantity >= item.product.stock}
                    >
                        <Plus className="w-4 h-4" />
                    </Button>
                </div>

                {/* Per-item discount toggle & formatted input */}
                <div className="flex items-center gap-1 shrink-0">
                    <div className="flex items-center rounded-md border bg-background overflow-hidden h-8 shrink-0">
                        <button
                            type="button"
                            className={cn(
                                'px-1.5 h-full text-xs font-black border-r transition-colors',
                                discountType === 'nominal' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted',
                            )}
                            onClick={() => onUpdateDiscount(item.product.id, item.discount, 'nominal')}
                            title={t('page.kasir.discount_nominal_title', 'Diskon Nominal (Rp)')}
                        >
                            Rp
                        </button>
                        <button
                            type="button"
                            className={cn(
                                'px-1.5 h-full text-xs font-black transition-colors',
                                discountType === 'percent' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted',
                            )}
                            onClick={() => onUpdateDiscount(item.product.id, item.discount, 'percent')}
                            title={t('page.kasir.discount_percent_title', 'Diskon Persentase (%)')}
                        >
                            %
                        </button>
                    </div>

                    {discountType === 'nominal' ? (
                        <NumericFormat
                            customInput={Input}
                            thousandSeparator="."
                            decimalSeparator=","
                            value={item.discount || ''}
                            placeholder="0"
                            onFocus={(e) => e.target.select()}
                            onValueChange={(values) => {
                                onUpdateDiscount(item.product.id, values.floatValue ?? 0, 'nominal');
                            }}
                            className="h-8 w-20 text-xs text-right px-1.5 font-bold font-mono"
                        />
                    ) : (
                        <Input
                            type="number"
                            value={item.discount || ''}
                            min={0}
                            max={100}
                            placeholder="0"
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                onUpdateDiscount(item.product.id, val, 'percent');
                            }}
                            className="h-8 w-16 text-xs text-right px-1.5 font-bold font-mono"
                        />
                    )}
                </div>

                {/* Subtotal Display */}
                <div className="text-right shrink-0 min-w-[100px]">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider block font-mono font-bold leading-none mb-0.5">
                        {t('page.kasir.subtotal_label', 'Subtotal')}
                    </span>
                    <span className="text-base sm:text-lg font-black text-primary font-mono whitespace-nowrap leading-tight">
                        {formatRupiah(subtotal)}
                    </span>
                </div>
            </div>
        </div>
    );
}
