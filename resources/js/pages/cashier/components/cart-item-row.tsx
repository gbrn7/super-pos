import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CartItem } from '../index';
import { formatRupiah } from '@/lib/format-money';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Minus, Plus, Trash2, Tag } from 'lucide-react';
import { NumericFormat } from 'react-number-format';

interface CartItemRowProps {
    item: CartItem;
    onUpdateQty: (productId: number, qty: number) => void;
    onUpdateDiscount?: (productId: number, discount: number, discountType: 'nominal' | 'percent') => void;
    onRemove: (productId: number) => void;
}

export default function CartItemRow({ item, onUpdateQty, onUpdateDiscount, onRemove }: CartItemRowProps) {
    const { t } = useTranslation();

    const [enabledDiscount, setEnabledDiscount] = useState<boolean>(Boolean(item.discount && item.discount > 0));

    useEffect(() => {
        if (item.discount && item.discount > 0 && !enabledDiscount) {
            setEnabledDiscount(true);
        }
    }, [item.discount]);

    const discType = item.discountType || 'nominal';
    const activeDiscount = enabledDiscount ? (item.discount || 0) : 0;
    const discPerUnit = discType === 'percent'
        ? (item.product.price * activeDiscount) / 100
        : activeDiscount;
    const netUnitPrice = Math.max(0, item.product.price - discPerUnit);
    const subtotal = netUnitPrice * item.quantity;

    const handleToggleDiscount = (checked: boolean) => {
        setEnabledDiscount(checked);
        if (!checked && onUpdateDiscount) {
            onUpdateDiscount(item.product.id, 0, discType);
        }
    };

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
                        {discPerUnit > 0 ? (
                            <span>
                                <span className="line-through text-muted-foreground/70 mr-1 font-normal">
                                    @ {formatRupiah(item.product.price)}
                                </span>
                                <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">
                                    @ {formatRupiah(netUnitPrice)}
                                </span>
                            </span>
                        ) : (
                            <span className="text-foreground font-bold">@ {formatRupiah(item.product.price)}</span>
                        )}
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

            {/* Discount toggle & input section */}
            <div className="flex flex-col gap-2 py-1.5 px-2.5 bg-muted/40 rounded-lg border border-border/50 text-xs">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                        <Tag className="w-3.5 h-3.5 text-primary/70 shrink-0" />
                        <span className="font-semibold text-[11px] shrink-0">
                            {t('page.kasir.item_discount', 'Diskon Produk')}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] text-muted-foreground font-medium">
                            {enabledDiscount ? 'Aktif' : 'Nonaktif'}
                        </span>
                        <Switch
                            id={`discount-switch-${item.product.id}`}
                            checked={enabledDiscount}
                            onCheckedChange={handleToggleDiscount}
                            className="scale-90"
                        />
                    </div>
                </div>

                {/* Discount Inputs (shown when enabled) */}
                {enabledDiscount && (
                    <div className="flex items-center justify-end gap-1.5 pt-1.5 border-t border-border/40">
                        <div className="flex items-center rounded-md border bg-background overflow-hidden h-7">
                            <button
                                type="button"
                                className={`px-2 h-full text-[11px] transition-colors ${
                                    discType === 'nominal'
                                        ? 'bg-primary text-primary-foreground font-black'
                                        : 'text-muted-foreground hover:bg-muted font-bold'
                                }`}
                                onClick={() => {
                                    if (onUpdateDiscount) {
                                        const nextVal = (item.discount || 0) > item.product.price ? item.product.price : (item.discount || 0);
                                        onUpdateDiscount(item.product.id, nextVal, 'nominal');
                                    }
                                }}
                                title="Diskon Nominal (Rp)"
                            >
                                Rp
                            </button>
                            <button
                                type="button"
                                className={`px-2 h-full text-[11px] transition-colors ${
                                    discType === 'percent'
                                        ? 'bg-primary text-primary-foreground font-black'
                                        : 'text-muted-foreground hover:bg-muted font-bold'
                                }`}
                                onClick={() => {
                                    if (onUpdateDiscount) {
                                        const nextVal = (item.discount || 0) > 100 ? 100 : (item.discount || 0);
                                        onUpdateDiscount(item.product.id, nextVal, 'percent');
                                    }
                                }}
                                title="Diskon Persentase (%)"
                            >
                                %
                            </button>
                        </div>
                        {discType === 'nominal' ? (
                            <NumericFormat
                                customInput={Input}
                                thousandSeparator="."
                                decimalSeparator=","
                                placeholder="0"
                                value={item.discount || ''}
                                onFocus={(e) => e.target.select()}
                                onValueChange={(values) => {
                                    let val = values.floatValue ?? 0;
                                    if (val < 0) {
                                        val = 0;
                                    } else if (val > item.product.price) {
                                        val = item.product.price;
                                    }
                                    if (onUpdateDiscount) {
                                        onUpdateDiscount(item.product.id, val, 'nominal');
                                    }
                                }}
                                className="h-7 w-24 text-right text-xs font-mono font-bold px-2 bg-background border-input"
                            />
                        ) : (
                            <Input
                                type="number"
                                min={0}
                                max={100}
                                placeholder="0"
                                value={item.discount || ''}
                                onFocus={(e) => e.target.select()}
                                onChange={(e) => {
                                    let val = parseFloat(e.target.value);
                                    if (isNaN(val) || val < 0) {
                                        val = 0;
                                    } else if (val > 100) {
                                        val = 100;
                                    }
                                    if (onUpdateDiscount) {
                                        onUpdateDiscount(item.product.id, val, 'percent');
                                    }
                                }}
                                className="h-7 w-16 text-right text-xs font-mono font-bold px-2 bg-background border-input"
                            />
                        )}
                    </div>
                )}
            </div>

            {/* Bottom row: Controls (Qty) + Subtotal Price */}
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

                {/* Subtotal Display */}
                <div className="text-right shrink-0 min-w-[100px]">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider block font-mono font-bold leading-none mb-0.5">
                        {t('page.kasir.subtotal_label', 'Subtotal')}
                    </span>
                    {discPerUnit > 0 ? (
                        <div className="flex flex-col items-end">
                            <span className="text-[11px] font-mono text-muted-foreground/70 line-through leading-none mb-0.5">
                                {formatRupiah(item.product.price * item.quantity)}
                            </span>
                            <span className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono whitespace-nowrap leading-tight">
                                {formatRupiah(subtotal)}
                            </span>
                        </div>
                    ) : (
                        <span className="text-base sm:text-lg font-black text-primary font-mono whitespace-nowrap leading-tight">
                            {formatRupiah(subtotal)}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

