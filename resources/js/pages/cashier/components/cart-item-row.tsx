import { Minus, Plus, Trash2, Tag } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { formatRupiah } from '@/lib/format-money';
import type { CartItem } from '../index';

interface CartItemRowProps {
    item: CartItem;
    onUpdateQty: (productId: number, qty: number) => void;
    onUpdateDiscount?: (
        productId: number,
        discount: number,
        discountType: 'nominal' | 'percent',
    ) => void;
    onRemove: (productId: number) => void;
}

export default function CartItemRow({
    item,
    onUpdateQty,
    onUpdateDiscount,
    onRemove,
}: CartItemRowProps) {
    const { t } = useTranslation();

    const [enabledDiscount, setEnabledDiscount] = useState<boolean>(
        Boolean(item.discount && item.discount > 0),
    );

    useEffect(() => {
        if (item.discount && item.discount > 0 && !enabledDiscount) {
            setEnabledDiscount(true);
        }
    }, [item.discount]);

    const discType = item.discountType || 'nominal';
    const activeDiscount = enabledDiscount ? item.discount || 0 : 0;
    const discPerUnit =
        discType === 'percent'
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
        <div className="group flex flex-col gap-2.5 rounded-xl border bg-card p-3.5 shadow-xs transition-colors hover:bg-accent/40">
            {/* Top row: Name & Remove button */}
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-base leading-tight font-extrabold text-foreground">
                        {item.product.name}
                    </p>
                    {(item.product.barcode ||
                        item.product.sku ||
                        item.product.unit_name) && (
                        <p className="mt-1 font-mono text-xs font-semibold text-muted-foreground">
                            {item.product.barcode || item.product.sku
                                ? `${item.product.barcode || item.product.sku}`
                                : ''}
                            {(item.product.barcode || item.product.sku) &&
                            item.product.unit_name
                                ? ' · '
                                : ''}
                            {item.product.unit_name
                                ? `${item.product.unit_name}`
                                : ''}
                        </p>
                    )}
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 text-muted-foreground opacity-80 transition-opacity group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => onRemove(item.product.id)}
                    title={t('page.kasir.remove_item', 'Hapus barang')}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>

            {/* Discount toggle & input section */}
            <div className="flex flex-col gap-2 rounded-lg border border-border/50 bg-muted/40 px-2.5 py-1.5 text-xs">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-1.5">
                        <Tag className="h-3.5 w-3.5 shrink-0 text-primary/70" />
                        <span className="shrink-0 text-[11px] font-semibold">
                            {t('page.kasir.item_discount', 'Diskon Produk')}
                        </span>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                        <span className="text-[10px] font-medium text-muted-foreground">
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
                    <div className="flex items-center justify-end gap-1.5 border-t border-border/40 pt-1.5">
                        <div className="flex h-7 items-center overflow-hidden rounded-md border bg-background">
                            <button
                                type="button"
                                className={`h-full px-2 text-[11px] transition-colors ${
                                    discType === 'nominal'
                                        ? 'bg-primary font-black text-primary-foreground'
                                        : 'font-bold text-muted-foreground hover:bg-muted'
                                }`}
                                onClick={() => {
                                    if (onUpdateDiscount) {
                                        const nextVal =
                                            (item.discount || 0) >
                                            item.product.price
                                                ? item.product.price
                                                : item.discount || 0;
                                        onUpdateDiscount(
                                            item.product.id,
                                            nextVal,
                                            'nominal',
                                        );
                                    }
                                }}
                                title="Diskon Nominal (Rp)"
                            >
                                Rp
                            </button>
                            <button
                                type="button"
                                className={`h-full px-2 text-[11px] transition-colors ${
                                    discType === 'percent'
                                        ? 'bg-primary font-black text-primary-foreground'
                                        : 'font-bold text-muted-foreground hover:bg-muted'
                                }`}
                                onClick={() => {
                                    if (onUpdateDiscount) {
                                        const nextVal =
                                            (item.discount || 0) > 100
                                                ? 100
                                                : item.discount || 0;
                                        onUpdateDiscount(
                                            item.product.id,
                                            nextVal,
                                            'percent',
                                        );
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
                                        onUpdateDiscount(
                                            item.product.id,
                                            val,
                                            'nominal',
                                        );
                                    }
                                }}
                                className="h-7 w-24 border-input bg-background px-2 text-right font-mono text-xs font-bold"
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
                                        onUpdateDiscount(
                                            item.product.id,
                                            val,
                                            'percent',
                                        );
                                    }
                                }}
                                className="h-7 w-16 border-input bg-background px-2 text-right font-mono text-xs font-bold"
                            />
                        )}
                    </div>
                )}
            </div>

            {/* Bottom row: Controls (Qty) + Subtotal Price */}
            <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-3 border-t border-border/60 pt-2.5">
                <div className="flex items-center gap-2">
                    {/* Qty controls */}
                    <div className="flex items-center gap-1.5">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-10 w-10 shrink-0 font-bold"
                            onClick={() =>
                                onUpdateQty(item.product.id, item.quantity - 1)
                            }
                            disabled={item.quantity <= 1}
                        >
                            <Minus className="h-5 w-5" />
                        </Button>
                        <Input
                            type="number"
                            value={item.quantity}
                            min={1}
                            max={
                                item.product.is_unlimited
                                    ? undefined
                                    : item.product.stock
                            }
                            onChange={(e) => {
                                const val = parseInt(e.target.value, 10);

                                if (!isNaN(val) && val >= 1) {
                                    onUpdateQty(item.product.id, val);
                                }
                            }}
                            className="h-10 w-14 border-primary/30 px-1 text-center font-mono text-lg font-black"
                        />
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-10 w-10 shrink-0 font-bold"
                            onClick={() =>
                                onUpdateQty(item.product.id, item.quantity + 1)
                            }
                            disabled={
                                !item.product.is_unlimited &&
                                item.quantity >= item.product.stock
                            }
                        >
                            <Plus className="h-5 w-5" />
                        </Button>
                    </div>

                    <span className="text-sm font-bold text-muted-foreground/60 select-none">
                        x
                    </span>

                    {/* Harga Per Produk */}
                    <div className="font-mono text-sm font-semibold text-muted-foreground sm:text-base">
                        {discPerUnit > 0 ? (
                            <div className="flex flex-col justify-center">
                                <span className="mb-0.5 text-[11px] leading-none font-normal text-muted-foreground/70 line-through">
                                    @ {formatRupiah(item.product.price)}
                                </span>
                                <span className="text-xs leading-none font-black text-emerald-600 sm:text-sm dark:text-emerald-400">
                                    @ {formatRupiah(netUnitPrice)}
                                </span>
                            </div>
                        ) : (
                            <span className="font-black text-foreground">
                                @ {formatRupiah(item.product.price)}
                            </span>
                        )}
                    </div>
                </div>

                {/* Subtotal Display */}
                <div className="min-w-[110px] shrink-0 text-right">
                    <span className="mb-0.5 block font-mono text-xs leading-none font-bold tracking-wider text-muted-foreground uppercase">
                        {t('page.kasir.subtotal_label', 'Subtotal')}
                    </span>
                    <span
                        className={`font-mono text-lg leading-tight font-black whitespace-nowrap sm:text-xl ${
                            discPerUnit > 0
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-primary'
                        }`}
                    >
                        {formatRupiah(subtotal)}
                    </span>
                </div>
            </div>
        </div>
    );
}
