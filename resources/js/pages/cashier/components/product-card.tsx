import { Product } from '@/support/models/product';
import { formatRupiah } from '@/lib/format-money';
import { Badge } from '@/components/ui/badge';
import { ImageIcon, Plus, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface ProductCardProps {
    product: Product;
    onAdd: (product: Product) => void;
    isInCart: boolean;
}

export default function ProductCard({
    product,
    onAdd,
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
                    <ImageIcon className="h-10 w-10 text-muted-foreground/40" />
                )}

                {/* Stock badge */}
                {!product.is_unlimited && (
                    <div className="absolute top-1.5 right-1.5">
                        <Badge
                            variant={
                                product.stock <= 0
                                    ? 'destructive'
                                    : product.stock <= 5
                                        ? 'secondary'
                                        : 'default'
                            }
                            className="px-1.5 py-0.5 text-[10px] font-semibold"
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
                        <div className="scale-75 transform rounded-full bg-primary p-2 shadow-lg transition-transform group-hover:scale-100">
                            <Plus className="h-4 w-4 text-primary-foreground" />
                        </div>
                    </div>
                )}
            </div>

            {/* Product Info */}
            <div className="flex flex-1 flex-col gap-1 p-2.5">
                <p className="line-clamp-2 text-xs leading-tight font-semibold text-foreground">
                    {product.name}
                </p>
                <p className="text-[10px] text-muted-foreground">
                    {product.unit_name}
                </p>
                <div className="mt-auto flex items-center justify-between gap-1 pt-1">
                    <p className="text-xs font-bold text-primary">
                        {formatRupiah(product.price)}
                    </p>
                    {isInCart && (
                        <div className="flex items-center gap-0.5 text-primary">
                            <ShoppingCart className="h-3 w-3" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
