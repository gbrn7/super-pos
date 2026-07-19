import { Product } from '@/support/models/product';
import { formatRupiah } from '@/lib/format-money';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ImageIcon, Plus, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface ProductCardProps {
    product: Product;
    onAdd: (product: Product) => void;
    isInCart: boolean;
}

export default function ProductCard({ product, onAdd, isInCart }: ProductCardProps) {
    const { t } = useTranslation();
    const isOutOfStock = !product.is_unlimited && product.stock <= 0;

    return (
        <div
            className={cn(
                'group relative flex flex-col rounded-xl border bg-card transition-all duration-200 overflow-hidden cursor-pointer',
                'hover:shadow-md hover:-translate-y-0.5',
                isOutOfStock && 'opacity-60 cursor-not-allowed',
                isInCart && 'ring-2 ring-primary/60',
            )}
            onClick={() => !isOutOfStock && onAdd(product)}
        >
            {/* Product Image */}
            <div className="relative aspect-square bg-muted/40 flex items-center justify-center overflow-hidden">
                {product.image ? (
                    <img
                        src={`/storage/${product.image}`}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                ) : (
                    <ImageIcon className="w-10 h-10 text-muted-foreground/40" />
                )}

                {/* Stock badge */}
                {!product.is_unlimited && (
                    <div className="absolute top-1.5 right-1.5">
                        <Badge
                            variant={product.stock <= 0 ? 'destructive' : product.stock <= 5 ? 'secondary' : 'default'}
                            className="text-[10px] px-1.5 py-0.5 font-semibold"
                        >
                            {product.stock <= 0
                                ? t('page.kasir.out_of_stock', 'Habis')
                                : `Stok: ${product.stock}`}
                        </Badge>
                    </div>
                )}

                {/* Add to cart overlay */}
                {!isOutOfStock && (
                    <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="bg-primary rounded-full p-2 shadow-lg transform scale-75 group-hover:scale-100 transition-transform">
                            <Plus className="w-4 h-4 text-primary-foreground" />
                        </div>
                    </div>
                )}
            </div>

            {/* Product Info */}
            <div className="p-2.5 flex flex-col gap-1 flex-1">
                <p className="text-xs font-semibold leading-tight line-clamp-2 text-foreground">{product.name}</p>
                <p className="text-[10px] text-muted-foreground">{product.unit_name}</p>
                <div className="mt-auto flex items-center justify-between gap-1 pt-1">
                    <p className="text-xs font-bold text-primary">{formatRupiah(product.price)}</p>
                    {isInCart && (
                        <div className="flex items-center gap-0.5 text-primary">
                            <ShoppingCart className="w-3 h-3" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
