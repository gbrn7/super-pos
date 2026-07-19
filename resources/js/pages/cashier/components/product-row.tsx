import { useTranslation } from 'react-i18next';
import { Product } from '@/support/models/product';
import { formatRupiah } from '@/lib/format-money';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Check, Barcode } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductRowProps {
    product: Product;
    onAdd: (product: Product) => void;
    isInCart: boolean;
}

export default function ProductRow({ product, onAdd, isInCart }: ProductRowProps) {
    const { t } = useTranslation();
    const isOutOfStock = !product.is_unlimited && product.stock <= 0;

    return (
        <tr
            className={cn(
                'group hover:bg-accent/60 transition-colors cursor-pointer border-b text-sm',
                isOutOfStock && 'opacity-50 bg-muted/20 cursor-not-allowed',
                isInCart && 'bg-primary/10 hover:bg-primary/15',
            )}
            onClick={() => !isOutOfStock && onAdd(product)}
        >
            {/* Barcode / Kode (Hidden on mobile) */}
            <td className="py-3 px-2 sm:py-3.5 sm:px-3.5 font-mono text-xs sm:text-sm font-bold text-muted-foreground whitespace-nowrap hidden sm:table-cell">
                <div className="flex items-center gap-1.5">
                    <Barcode className="w-4 h-4 shrink-0 opacity-80" />
                    <span className="tracking-tight">{product.barcode || product.sku || `#${product.id}`}</span>
                </div>
            </td>

            {/* Nama Produk & Kategori */}
            <td className="py-3 px-2 sm:py-3.5 sm:px-3.5 min-w-[130px] sm:min-w-[200px]">
                <div className="font-extrabold text-sm sm:text-base text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                    {product.name}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5 font-medium">
                    <span className="sm:hidden font-mono font-bold text-muted-foreground/90">{product.barcode || product.sku}</span>
                    {product.barcode && product.category_name && <span className="sm:hidden">·</span>}
                    {product.category_name && <span>{product.category_name}</span>}
                </div>
            </td>

            {/* Status Stok */}
            <td className="py-3 px-2 sm:py-3.5 sm:px-3.5 whitespace-nowrap">
                {product.is_unlimited ? (
                    <Badge variant="outline" className="text-xs px-2 py-0.5 border-blue-500/40 text-blue-600 dark:text-blue-400 font-bold">
                        {t('page.kasir.unlimited_stock', 'Tak Terbatas')}
                    </Badge>
                ) : product.stock <= 0 ? (
                    <Badge variant="destructive" className="text-xs px-2 py-0.5 font-bold">
                        {t('page.kasir.out_of_stock', 'Habis')}
                    </Badge>
                ) : product.stock <= 5 ? (
                    <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 font-bold">
                        {product.stock}
                    </Badge>
                ) : (
                    <Badge variant="outline" className="text-xs px-2 py-0.5 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-bold">
                        {product.stock}
                    </Badge>
                )}
            </td>

            {/* Satuan */}
            <td className="py-3 px-2 sm:py-3.5 sm:px-3.5 text-xs sm:text-sm font-bold text-muted-foreground whitespace-nowrap hidden md:table-cell">
                {product.unit_name || '-'}
            </td>

            {/* Harga Jual */}
            <td className="py-3 px-2 sm:py-3.5 sm:px-3.5 text-right font-black text-sm sm:text-lg text-emerald-600 dark:text-emerald-400 whitespace-nowrap font-mono">
                {formatRupiah(product.price)}
            </td>

            {/* Action */}
            <td className="py-3 px-2 sm:py-3.5 sm:px-3.5 text-center whitespace-nowrap">
                <Button
                    type="button"
                    size="sm"
                    variant={isInCart ? 'secondary' : 'default'}
                    disabled={isOutOfStock}
                    className="h-8 px-2.5 sm:h-9 sm:px-3.5 text-xs sm:text-sm gap-1.5 font-bold shrink-0 shadow-xs"
                    onClick={(e) => {
                        e.stopPropagation();
                        if (!isOutOfStock) {
                            onAdd(product);
                        }
                    }}
                >
                    {isInCart ? (
                        <>
                            <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
                            <span className="hidden xs:inline">{t('page.kasir.add_btn', 'Tambah')}</span>
                        </>
                    ) : (
                        <>
                            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span>{t('page.kasir.select_btn', 'Pilih')}</span>
                        </>
                    )}
                </Button>
            </td>
        </tr>
    );
}
