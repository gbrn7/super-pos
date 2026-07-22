import { useTranslation } from 'react-i18next';
import { Product } from '@/support/models/product';
import { formatRupiah } from '@/lib/format-money';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Check, Barcode, Edit3 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductRowProps {
    product: Product;
    onAdd: (product: Product) => void;
    onEditStock?: (product: Product) => void;
    isInCart: boolean;
}

export default function ProductRow({
    product,
    onAdd,
    onEditStock,
    isInCart,
}: ProductRowProps) {
    const { t } = useTranslation();
    const isOutOfStock = !product.is_unlimited && product.stock <= 0;

    return (
        <tr
            className={cn(
                'group cursor-pointer border-b text-sm transition-colors hover:bg-accent/60',
                isOutOfStock && 'cursor-not-allowed bg-muted/20 opacity-50',
                isInCart && 'bg-primary/10 hover:bg-primary/15',
            )}
            onClick={() => !isOutOfStock && onAdd(product)}
        >
            {/* Barcode / Kode (Hidden on mobile) */}
            <td className="hidden px-2 py-3 font-mono text-xs font-bold whitespace-nowrap text-muted-foreground sm:table-cell sm:px-3.5 sm:py-3.5 sm:text-sm">
                <div className="flex items-center gap-1.5">
                    <Barcode className="h-4 w-4 shrink-0 opacity-80" />
                    <span className="tracking-tight">
                        {product.barcode || product.sku || `#${product.id}`}
                    </span>
                </div>
            </td>

            {/* Nama Produk & Kategori */}
            <td className="min-w-[130px] px-2 py-3 sm:min-w-[200px] sm:px-3.5 sm:py-3.5">
                <div className="line-clamp-1 text-sm font-extrabold text-foreground transition-colors group-hover:text-primary sm:text-base">
                    {product.name}
                </div>
                <div className="mt-0.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <span className="font-mono font-bold text-muted-foreground/90 sm:hidden">
                        {product.barcode || product.sku}
                    </span>
                    {product.barcode && product.category_name && (
                        <span className="sm:hidden">·</span>
                    )}
                    {product.category_name && (
                        <span>{product.category_name}</span>
                    )}
                </div>
            </td>

            {/* Status Stok */}
            <td className="px-2 py-3 whitespace-nowrap sm:px-3.5 sm:py-3.5">
                <div className="flex items-center gap-1.5">
                    {product.is_unlimited ? (
                        <Badge
                            variant="outline"
                            className="border-blue-500/40 px-2 py-0.5 text-xs font-bold text-blue-600 dark:text-blue-400"
                        >
                            {t('page.kasir.unlimited_stock', 'Tak Terbatas')}
                        </Badge>
                    ) : product.stock <= 0 ? (
                        <Badge
                            variant="destructive"
                            className="px-2 py-0.5 text-xs font-bold"
                        >
                            {t('page.kasir.out_of_stock', 'Habis')}
                        </Badge>
                    ) : product.stock <= 5 ? (
                        <Badge
                            variant="secondary"
                            className="border border-amber-500/30 bg-amber-500/15 px-2 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-400"
                        >
                            {product.stock}
                        </Badge>
                    ) : (
                        <Badge
                            variant="outline"
                            className="border-emerald-500/30 px-2 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400"
                        >
                            {product.stock}
                        </Badge>
                    )}
                    {onEditStock && (
                        <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 shrink-0 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary"
                            onClick={(e) => {
                                e.stopPropagation();
                                onEditStock(product);
                            }}
                            title={t(
                                'page.kasir.update_stock_tooltip',
                                'Update Stok',
                            )}
                        >
                            <Edit3 className="h-3.5 w-3.5" />
                        </Button>
                    )}
                </div>
            </td>

            {/* Satuan */}
            <td className="hidden px-2 py-3 text-xs font-bold whitespace-nowrap text-muted-foreground sm:px-3.5 sm:py-3.5 sm:text-sm md:table-cell">
                {product.unit_name || '-'}
            </td>

            {/* Harga Jual */}
            <td className="px-2 py-3 text-right font-mono text-sm font-black whitespace-nowrap text-emerald-600 sm:px-3.5 sm:py-3.5 sm:text-lg dark:text-emerald-400">
                {formatRupiah(product.price)}
            </td>

            {/* Action */}
            <td className="px-2 py-3 text-center whitespace-nowrap sm:px-3.5 sm:py-3.5">
                <Button
                    type="button"
                    size="sm"
                    variant={isInCart ? 'secondary' : 'default'}
                    disabled={isOutOfStock}
                    className="h-8 shrink-0 gap-1.5 px-2.5 text-xs font-bold shadow-xs sm:h-9 sm:px-3.5 sm:text-sm"
                    onClick={(e) => {
                        e.stopPropagation();
                        if (!isOutOfStock) {
                            onAdd(product);
                        }
                    }}
                >
                    {isInCart ? (
                        <>
                            <Check className="h-3.5 w-3.5 text-emerald-600 sm:h-4 sm:w-4" />
                            <span className="xs:inline hidden">
                                {t('page.kasir.add_btn', 'Tambah')}
                            </span>
                        </>
                    ) : (
                        <>
                            <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            <span>{t('page.kasir.select_btn', 'Pilih')}</span>
                        </>
                    )}
                </Button>
            </td>
        </tr>
    );
}
