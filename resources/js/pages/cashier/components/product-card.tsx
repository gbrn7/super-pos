import { Product } from '@/support/models/product';
import { formatRupiah } from '@/lib/format-money';
import { Badge } from '@/components/ui/badge';
import { Box, Plus, ShoppingCart, Edit3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface ProductCardProps {
    product: Product;
    onAdd: (product: Product) => void;
    onEditStock?: (product: Product) => void;
    isInCart: boolean;
}

export default function ProductCard({
    product,
    onAdd,
    onEditStock,
    isInCart,
}: ProductCardProps) {
    const { t } = useTranslation();
    const isOutOfStock = !product.is_unlimited && product.stock <= 0;

    return (
        <div
            className={cn(
                'group relative flex cursor-pointer flex-col overflow-hidden rounded-xl border bg-card transition-all duration-200',
                'hover:-translate-y-0.5 hover:shadow-md',
                isOutOfStock && 'cursor-not-allowed opacity-60',
                isInCart && 'ring-2 ring-primary/60',
            )}
            onClick={() => !isOutOfStock && onAdd(product)}
        >
                {/* Product Image */}
            <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-muted/40">
                {product.image ? (
                    <img
                        src={`/storage/${product.image}`}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                ) : (
                    <Box className="h-12 w-12 text-muted-foreground/40 stroke-1" />
                )}

                {/* Edit Stock Button */}
                {onEditStock && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onEditStock(product);
                        }}
                        className="absolute top-2 left-2 z-10 rounded-md bg-background/90 p-1.5 text-muted-foreground shadow-xs backdrop-blur-xs transition-colors hover:bg-background hover:text-foreground"
                        title={t(
                            'page.kasir.update_stock_tooltip',
                            'Update Stok',
                        )}
                    >
                        <Edit3 className="h-4 w-4" />
                    </button>
                )}

                {/* Stock badge */}
                {product.is_unlimited ? (
                    <div className="absolute top-2 right-2 z-10">
                        <Badge
                            variant="outline"
                            className="border-blue-500/40 bg-background/90 px-2 py-0.5 text-xs font-bold text-blue-600 backdrop-blur-xs dark:text-blue-400"
                        >
                            {t('page.kasir.unlimited_stock', 'Tak Terbatas')}
                        </Badge>
                    </div>
                ) : (
                    <div className="absolute top-2 right-2 z-10">
                        <Badge
                            variant={
                                product.stock <= 0
                                    ? 'destructive'
                                    : product.stock <= 5
                                        ? 'secondary'
                                        : 'default'
                            }
                            className="px-2 py-0.5 text-xs font-bold shadow-xs"
                        >
                            {product.stock <= 0
                                ? t('page.kasir.out_of_stock', 'Habis')
                                : `Stok: ${product.stock}`}
                        </Badge>
                    </div>
                )}

                {/* Add to cart overlay */}
                {!isOutOfStock && (
                    <div className="absolute inset-0 flex items-center justify-center bg-primary/10 opacity-0 transition-opacity group-hover:opacity-100">
                        <div className="scale-75 transform rounded-full bg-primary p-2.5 shadow-lg transition-transform group-hover:scale-100">
                            <Plus className="h-5 w-5 text-primary-foreground" />
                        </div>
                    </div>
                )}
            </div>

            {/* Product Info */}
            <div className="flex flex-1 flex-col gap-1.5 p-3">
                <p className="line-clamp-2 text-sm font-extrabold leading-snug text-foreground transition-colors group-hover:text-primary sm:text-base">
                    {product.name}
                </p>
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    {product.unit_name && <span>{product.unit_name}</span>}
                    {product.unit_name && product.category_name && <span>·</span>}
                    {product.category_name && (
                        <span className="truncate">{product.category_name}</span>
                    )}
                </div>
                <div className="mt-auto flex items-center justify-between gap-1 pt-2">
                    <p className="font-mono text-sm font-black text-emerald-600 dark:text-emerald-400 sm:text-base">
                        {formatRupiah(product.price)}
                    </p>
                    {isInCart && (
                        <div className="flex items-center gap-1 rounded-md bg-primary/10 px-1.5 py-0.5 text-xs font-bold text-primary">
                            <ShoppingCart className="h-3.5 w-3.5" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
