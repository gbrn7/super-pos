import { Head } from '@inertiajs/react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import { index as cashierRoute } from '@/routes/cashier';
import { index as apiGetProducts } from '@/routes/apiProducts';
import { index as apiGetPaymentMethods } from '@/routes/apiPaymentMethods';
import { index as apiGetCategories } from '@/routes/apiCategories';
import { checkout as apiCheckout } from '@/routes/apiTransactions';
import type { Product } from '@/support/models/product';
import type { Category } from '@/support/models/category';
import type { PaymentMethod } from '@/support/models/paymentMethod';
import type { Transaction } from '@/support/models/transaction';
import type { ResponseApi } from '@/support/interfaces/response/Response';
import axiosInstance from '@/lib/axios';
import { formatRupiah } from '@/lib/format-money';
import { handleApiError, showErrorToast, showSuccessToast, cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NumericFormat } from 'react-number-format';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    Search,
    ScanBarcode,
    ShoppingCart,
    Trash2,
    RotateCcw,
    CreditCard,
    ChevronLeft,
    ChevronRight,
    Package,
    Tag,
    Banknote,
    Receipt,
    Coins,
    Printer,
    Check,
    Info,
} from 'lucide-react';
import ProductRow from './components/product-row';
import CartItemRow from './components/cart-item-row';
import ReceiptModal from './components/receipt-modal';
import PaymentMethodDetailDialog from './components/payment-method-detail-dialog';

export interface CartItem {
    product: Product;
    quantity: number;
    discount: number;
    discountType?: 'nominal' | 'percent';
}

const { url } = cashierRoute();

export default function CashierIndex() {
    const { t } = useTranslation();

    // ── Products state ──────────────────────────────────────────────────────────
    const [products, setProducts] = useState<Product[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);
    const LIMIT = 25;

    // ── Categories & Payment methods state ──────────────────────────────────────
    const [categories, setCategories] = useState<Category[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

    // ── Cart & Discount state ───────────────────────────────────────────────────
    const [cart, setCart] = useState<CartItem[]>([]);
    const [paymentMethodId, setPaymentMethodId] = useState<string>('');
    const [paymentAmount, setPaymentAmount] = useState<number | ''>('');
    const [totalDiscountValue, setTotalDiscountValue] = useState<number | ''>('');
    const [totalDiscountType, setTotalDiscountType] = useState<'nominal' | 'percent'>('nominal');

    // ── UI / Mobile navigation state ───────────────────────────────────────────
    const [processing, setProcessing] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [receiptOpen, setReceiptOpen] = useState(false);
    const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);
    const [detailPaymentMethod, setDetailPaymentMethod] = useState<PaymentMethod | null>(null);
    const [mobileTab, setMobileTab] = useState<'products' | 'cart'>('products');

    const searchRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ── Computed values ─────────────────────────────────────────────────────────
    const itemsSubtotal = cart.reduce((sum, item) => {
        const discType = item.discountType || 'nominal';
        const discPerUnit = discType === 'percent'
            ? (item.product.price * (item.discount || 0)) / 100
            : (item.discount || 0);
        const itemPrice = Math.max(0, item.product.price - discPerUnit);
        return sum + itemPrice * item.quantity;
    }, 0);

    const discountAmount = totalDiscountType === 'percent'
        ? (itemsSubtotal * (Number(totalDiscountValue) || 0)) / 100
        : (Number(totalDiscountValue) || 0);

    const grandTotal = Math.max(0, itemsSubtotal - discountAmount);
    const change = (Number(paymentAmount) || 0) - grandTotal;
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    const selectedPaymentMethodObj = paymentMethods.find((pm) => String(pm.id) === paymentMethodId);
    const selectedPaymentMethodName = selectedPaymentMethodObj?.name || 'Tunai';

    // Auto-select cash payment method if available
    useEffect(() => {
        if (paymentMethods.length > 0 && !paymentMethodId) {
            const cashMethod = paymentMethods.find((pm) =>
                pm.name.toLowerCase().includes('tunai') || pm.name.toLowerCase().includes('cash')
            );
            setPaymentMethodId(String(cashMethod ? cashMethod.id : paymentMethods[0].id));
        }
    }, [paymentMethods, paymentMethodId]);

    // ── Fetch products ──────────────────────────────────────────────────────────
    const fetchProducts = useCallback(async (keyword: string, currentPage: number, catId: number | null) => {
        setLoadingProducts(true);
        try {
            const params: Record<string, any> = {
                keyword,
                page: currentPage,
                limit: LIMIT,
                is_active: true,
            };
            if (catId) {
                params.category_id = catId;
            }
            const { data } = await axiosInstance.get<ResponseApi<any>>(apiGetProducts().url, { params });
            if (data.success) {
                const payload = data.data;
                const itemsList = Array.isArray(payload) ? payload : (payload?.items ?? payload?.data ?? []);
                const paginationObj = payload?.pagination ?? payload?.meta ?? payload;
                setProducts(itemsList);
                setTotalPages(paginationObj?.last_page ?? 1);
                setTotalProducts(paginationObj?.total ?? itemsList.length ?? 0);
            }
        } catch (e) {
            handleApiError(e);
        } finally {
            setLoadingProducts(false);
        }
    }, []);

    useEffect(() => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }
        debounceRef.current = setTimeout(() => {
            fetchProducts(search, page, selectedCategory);
        }, 300);
        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, [search, page, selectedCategory, fetchProducts]);

    // ── Fetch categories & payment methods ──────────────────────────────────────
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                // Fetch Categories
                const catRes = await axiosInstance.get<ResponseApi<any>>(apiGetCategories().url);
                if (catRes.data.success) {
                    const raw = catRes.data.data;
                    setCategories(Array.isArray(raw) ? raw : (raw?.items ?? raw?.data ?? []));
                }

                // Fetch Payment Methods
                const pmRes = await axiosInstance.get<ResponseApi<any>>(apiGetPaymentMethods().url);
                if (pmRes.data.success) {
                    const raw = pmRes.data.data;
                    setPaymentMethods(Array.isArray(raw) ? raw : (raw?.items ?? raw?.data ?? []));
                }
            } catch (e) {
                handleApiError(e);
            }
        };
        loadInitialData();
    }, []);

    // ── Add to Cart ─────────────────────────────────────────────────────────────
    const addToCart = useCallback(
        (product: Product): boolean => {
            if (!product.is_unlimited && product.stock <= 0) {
                showErrorToast(
                    t(
                        'page.kasir.out_of_stock_warning',
                        'Stok barang ini habis dan tidak dapat ditambahkan ke keranjang',
                    ),
                );
                return false;
            }

            let addedSuccessfully = true;

            setCart((prev) => {
                const existing = prev.find((i) => i.product.id === product.id);
                if (existing) {
                    const maxQty = product.is_unlimited ? Infinity : product.stock;
                    if (existing.quantity >= maxQty) {
                        showErrorToast(t('page.kasir.max_stock_reached', 'Stok tidak mencukupi'));
                        addedSuccessfully = false;
                        return prev;
                    }
                    return prev.map((i) =>
                        i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i,
                    );
                }
                return [...prev, { product, quantity: 1, discount: 0, discountType: 'nominal' }];
            });

            return addedSuccessfully;
        },
        [t],
    );

    // ── Barcode scan & Enter handler ────────────────────────────────────────────
    const handleBarcodeSearch = useCallback(
        async (barcodeQuery: string) => {
            if (!barcodeQuery.trim()) {
                return;
            }
            try {
                const { data } = await axiosInstance.get<ResponseApi<Product>>(
                    `/api/product/barcode/${encodeURIComponent(barcodeQuery.trim())}`,
                );
                if (data.success && data.data) {
                    const success = addToCart(data.data);
                    if (success) {
                        setSearch('');
                    }
                    return;
                }
            } catch {
                // Fallback check in current product list
            }

            if (products.length > 0) {
                const exactMatch = products.find(
                    (p) =>
                        p.barcode === barcodeQuery.trim() ||
                        p.sku === barcodeQuery.trim() ||
                        p.name.toLowerCase() === barcodeQuery.trim().toLowerCase(),
                );
                if (exactMatch) {
                    const success = addToCart(exactMatch);
                    if (success) {
                        setSearch('');
                    }
                } else if (products.length === 1) {
                    const success = addToCart(products[0]);
                    if (success) {
                        setSearch('');
                    }
                }
            }
        },
        [addToCart, products],
    );

    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleBarcodeSearch(search);
        }
    };

    // ── Global Keyboard Shortcuts ───────────────────────────────────────────────
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'F2') {
                e.preventDefault();
                setMobileTab('products');
                setTimeout(() => {
                    searchRef.current?.focus();
                    searchRef.current?.select();
                }, 50);
            } else if (e.key === 'Escape') {
                if (confirmOpen) {
                    setConfirmOpen(false);
                } else if (search) {
                    setSearch('');
                }
            } else if (e.key === 'F9') {
                e.preventDefault();
                if (cart.length > 0 && paymentMethodId && (Number(paymentAmount) || 0) >= grandTotal) {
                    handleCheckout();
                } else {
                    setMobileTab('cart');
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [cart, paymentMethodId, paymentAmount, grandTotal, search, confirmOpen]);

    // ── Cart operations ─────────────────────────────────────────────────────────
    const updateQty = useCallback((productId: number, qty: number) => {
        setCart((prev) =>
            prev.map((item) => {
                if (item.product.id !== productId) {
                    return item;
                }
                const maxQty = item.product.is_unlimited ? Infinity : item.product.stock;
                return { ...item, quantity: Math.max(1, Math.min(qty, maxQty)) };
            }),
        );
    }, []);

    const updateItemDiscount = useCallback(
        (productId: number, discount: number, discountType: 'nominal' | 'percent' = 'nominal') => {
            setCart((prev) =>
                prev.map((item) =>
                    item.product.id === productId ? { ...item, discount, discountType } : item,
                ),
            );
        },
        [],
    );

    const removeFromCart = useCallback((productId: number) => {
        setCart((prev) => prev.filter((i) => i.product.id !== productId));
    }, []);

    const clearCart = useCallback(() => {
        setCart([]);
        setPaymentAmount('');
        setTotalDiscountValue('');
    }, []);

    // ── Preset Cash Payment ────────────────────────────────────────────────────
    const applyPresetCash = (amount: number | 'pas') => {
        if (amount === 'pas') {
            setPaymentAmount(grandTotal);
        } else {
            setPaymentAmount(amount);
        }
    };

    // ── Checkout ────────────────────────────────────────────────────────────────
    const handleCheckout = () => {
        if (!paymentMethodId) {
            showErrorToast(t('page.kasir.select_payment_method', 'Pilih metode pembayaran'));
            return;
        }
        if ((Number(paymentAmount) || 0) < grandTotal) {
            showErrorToast(t('page.kasir.insufficient_payment', 'Nominal bayar kurang dari total'));
            return;
        }
        setConfirmOpen(true);
    };

    const submitCheckout = async (shouldPrintReceipt: boolean = true) => {
        setConfirmOpen(false);
        setProcessing(true);
        try {
            const { data } = await axiosInstance.post<ResponseApi<Transaction>>(apiCheckout().url, {
                payment_method_id: Number(paymentMethodId),
                total_amount: grandTotal,
                discount_amount: discountAmount,
                payment_amount: Number(paymentAmount),
                change_amount: Math.max(0, change),
                items: cart.map((item) => {
                    const discType = item.discountType || 'nominal';
                    const discPerUnit = discType === 'percent'
                        ? (item.product.price * (item.discount || 0)) / 100
                        : (item.discount || 0);
                    return {
                        product_id: item.product.id,
                        unit_name: item.product.unit_name,
                        quantity: item.quantity,
                        price: item.product.price,
                        cost_price: item.product.cost_price,
                        discount: discPerUnit,
                    };
                }),
            });

            if (data.success) {
                setLastTransaction(data.data as unknown as Transaction);
                showSuccessToast(t('page.kasir.checkout_success', 'Transaksi berhasil diselesaikan!'));
                fetchProducts(search, page, selectedCategory);

                if (shouldPrintReceipt) {
                    setReceiptOpen(true);
                } else {
                    clearCart();
                    setMobileTab('products');
                    setTimeout(() => {
                        searchRef.current?.focus();
                    }, 100);
                }
            }
        } catch (e) {
            handleApiError(e);
        } finally {
            setProcessing(false);
        }
    };

    const handleNewTransaction = () => {
        setReceiptOpen(false);
        clearCart();
        setMobileTab('products');
        setTimeout(() => {
            searchRef.current?.focus();
        }, 100);
    };

    // ── Render ──────────────────────────────────────────────────────────────────
    return (
        <>
            <Head title={t('page.kasir.page_name', 'Kasir')} />

            <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-background">
                {/* ─── MOBILE NAVIGATION TABS (Visible only on < lg screens) ───── */}
                <div className="flex lg:hidden border-b bg-card shrink-0 shadow-xs">
                    <button
                        type="button"
                        className={cn(
                            'flex-1 py-3.5 text-sm font-black flex items-center justify-center gap-2 border-b-2 transition-all',
                            mobileTab === 'products'
                                ? 'border-primary text-primary bg-primary/5'
                                : 'border-transparent text-muted-foreground hover:bg-muted/30',
                        )}
                        onClick={() => setMobileTab('products')}
                    >
                        <Package className="w-4 h-4" />
                        <span>{t('page.kasir.products_tab', 'Daftar Barang')} ({totalProducts})</span>
                    </button>
                    <button
                        type="button"
                        className={cn(
                            'flex-1 py-3.5 text-sm font-black flex items-center justify-center gap-2 border-b-2 transition-all',
                            mobileTab === 'cart'
                                ? 'border-primary text-primary bg-primary/5'
                                : 'border-transparent text-muted-foreground hover:bg-muted/30',
                        )}
                        onClick={() => setMobileTab('cart')}
                    >
                        <ShoppingCart className="w-4 h-4" />
                        <span>{t('page.kasir.cart_tab', 'Keranjang')}</span>
                        {cartCount > 0 && (
                            <Badge className="h-5 px-2 text-xs bg-emerald-600 font-black">
                                {cartCount} Pcs
                            </Badge>
                        )}
                    </button>
                </div>

                <div className="flex flex-col lg:flex-row flex-1 overflow-hidden min-h-0">
                    {/* ─── LEFT PANEL: Minimarket Product Table & Lookup ───────── */}
                    <div
                        className={cn(
                            'flex flex-col flex-1 min-w-0 border-r overflow-hidden',
                            mobileTab !== 'products' && 'hidden lg:flex',
                        )}
                    >
                        {/* Top Shortcut Banner */}
                        <div className="hidden sm:flex items-center justify-between px-3.5 py-2 bg-muted/70 border-b text-xs text-muted-foreground font-semibold">
                            <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1.5 font-mono">
                                    <kbd className="px-1.5 py-0.5 bg-background rounded border shadow-xs text-xs font-bold">F2</kbd> {t('page.kasir.shortcut_search', 'Cari Barang')}
                                </span>
                                <span className="flex items-center gap-1.5 font-mono">
                                    <kbd className="px-1.5 py-0.5 bg-background rounded border shadow-xs text-xs font-bold">Enter</kbd> {t('page.kasir.shortcut_select', 'Scan / Pilih')}
                                </span>
                                <span className="flex items-center gap-1.5 font-mono">
                                    <kbd className="px-1.5 py-0.5 bg-background rounded border shadow-xs text-xs font-bold">F9</kbd> {t('page.kasir.shortcut_checkout', 'Proses Bayar')}
                                </span>
                            </div>
                            <Badge variant="outline" className="text-xs px-2.5 py-0.5 gap-1 font-mono font-bold">
                                <Package className="w-3.5 h-3.5 text-primary" />
                                {totalProducts} {t('page.kasir.product_data_count', 'Data Barang')}
                            </Badge>
                        </div>

                        {/* Search Bar & Category Filter */}
                        <div className="p-3 sm:p-4 border-b space-y-2.5 bg-card shrink-0">
                            <div className="flex items-center gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                                    <Input
                                        ref={searchRef}
                                        value={search}
                                        onChange={(e) => {
                                            setSearch(e.target.value);
                                            setPage(1);
                                        }}
                                        onKeyDown={handleSearchKeyDown}
                                        placeholder={t(
                                            'page.kasir.search_placeholder',
                                            'Scan Barcode / Ketik Kode / Nama Barang (Enter)...',
                                        )}
                                        className="pl-11 pr-10 h-11 sm:h-12 font-bold text-base border-primary/40 focus-visible:ring-primary shadow-xs"
                                        autoFocus
                                    />
                                    {search ? (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSearch('');
                                                searchRef.current?.focus();
                                            }}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-extrabold text-muted-foreground hover:text-foreground p-1"
                                        >
                                            ✕
                                        </button>
                                    ) : (
                                        <ScanBarcode className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                                    )}
                                </div>
                            </div>

                            {/* Category Filter Pills */}
                            {categories.length > 0 && (
                                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs sm:text-sm">
                                    <span className="text-xs font-bold text-muted-foreground shrink-0 flex items-center gap-1 mr-1">
                                        <Tag className="w-3.5 h-3.5" /> {t('page.kasir.category_label', 'Kategori:')}
                                    </span>
                                    <Button
                                        type="button"
                                        variant={selectedCategory === null ? 'default' : 'outline'}
                                        size="sm"
                                        className="h-7 sm:h-8 px-3 text-xs sm:text-sm rounded-full shrink-0 font-bold"
                                        onClick={() => {
                                            setSelectedCategory(null);
                                            setPage(1);
                                        }}
                                    >
                                        {t('page.kasir.all_categories', 'Semua')}
                                    </Button>
                                    {categories.map((cat) => (
                                        <Button
                                            key={cat.id}
                                            type="button"
                                            variant={selectedCategory === cat.id ? 'default' : 'outline'}
                                            size="sm"
                                            className="h-7 sm:h-8 px-3 text-xs sm:text-sm rounded-full shrink-0 font-bold"
                                            onClick={() => {
                                                setSelectedCategory(cat.id);
                                                setPage(1);
                                            }}
                                        >
                                            {cat.name}
                                        </Button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Product Data Table */}
                        <div className="flex-1 overflow-y-auto">
                            {loadingProducts ? (
                                <div className="p-4 space-y-3">
                                    {Array.from({ length: 8 }).map((_, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <Skeleton className="h-10 w-28" />
                                            <Skeleton className="h-10 flex-1" />
                                            <Skeleton className="h-10 w-20" />
                                            <Skeleton className="h-10 w-24" />
                                        </div>
                                    ))}
                                </div>
                            ) : products.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full p-8 text-center text-muted-foreground">
                                    <Search className="w-14 h-14 stroke-1 opacity-25 mb-2" />
                                    <p className="font-extrabold text-base">{t('page.kasir.no_products_found', 'Barang tidak ditemukan')}</p>
                                    <p className="text-sm text-muted-foreground mt-1 max-w-xs font-medium">
                                        {t('page.kasir.no_products_desc', 'Coba ketik kata kunci lain atau scan ulang barcode barang')}
                                    </p>
                                </div>
                            ) : (
                                <table className="w-full text-left border-collapse">
                                    <thead className="sticky top-0 bg-muted/95 backdrop-blur-xs border-b text-xs sm:text-sm font-extrabold text-muted-foreground uppercase tracking-wider z-10 shadow-xs">
                                        <tr>
                                            <th className="py-3 px-2 sm:px-3.5 hidden sm:table-cell">{t('page.kasir.table_code', 'Kode / Barcode')}</th>
                                            <th className="py-3 px-2 sm:px-3.5">{t('page.kasir.table_name', 'Nama Barang')}</th>
                                            <th className="py-3 px-2 sm:px-3.5">{t('page.kasir.table_stock', 'Stok')}</th>
                                            <th className="py-3 px-2 sm:px-3.5 hidden md:table-cell">{t('page.kasir.table_unit', 'Satuan')}</th>
                                            <th className="py-3 px-2 sm:px-3.5 text-right">{t('page.kasir.table_price', 'Harga Jual')}</th>
                                            <th className="py-3 px-2 sm:px-3.5 text-center">{t('page.kasir.table_action', 'Aksi')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.map((product) => (
                                            <ProductRow
                                                key={product.id}
                                                product={product}
                                                onAdd={addToCart}
                                                isInCart={cart.some((i) => i.product.id === product.id)}
                                            />
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        {/* Table Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between px-4 py-2.5 border-t bg-card text-xs sm:text-sm shrink-0 font-semibold">
                                <span className="text-muted-foreground font-mono">
                                    {t('page.kasir.page_label', 'Halaman')} {page} {t('page.kasir.of_label', 'dari')} {totalPages}
                                </span>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 px-2.5 gap-1 text-xs sm:text-sm font-bold"
                                        disabled={page <= 1 || loadingProducts}
                                        onClick={() => setPage((p) => p - 1)}
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                        {t('page.kasir.prev_btn', 'Prev')}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 px-2.5 gap-1 text-xs sm:text-sm font-bold"
                                        disabled={page >= totalPages || loadingProducts}
                                        onClick={() => setPage((p) => p + 1)}
                                    >
                                        {t('page.kasir.next_btn', 'Next')}
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Floating Mobile Cart Bar */}
                        {cartCount > 0 && mobileTab === 'products' && (
                            <div className="lg:hidden p-3.5 bg-slate-900 text-slate-50 flex items-center justify-between shadow-xl border-t shrink-0">
                                <div className="flex flex-col">
                                    <span className="text-xs text-slate-400 font-mono font-bold uppercase">
                                        {t('page.kasir.mobile_total', 'Total')} ({cartCount} {t('page.kasir.items_unit', 'Barang')})
                                    </span>
                                    <span className="text-xl font-black text-emerald-400 font-mono leading-none mt-0.5">
                                        {formatRupiah(grandTotal)}
                                    </span>
                                </div>
                                <Button
                                    size="sm"
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold gap-2 text-xs sm:text-sm px-4 h-10 shadow-md"
                                    onClick={() => setMobileTab('cart')}
                                >
                                    <ShoppingCart className="w-4 h-4" />
                                    <span>{t('page.kasir.view_cart', 'Lihat Keranjang')} ({cartCount})</span>
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* ─── RIGHT PANEL: Cart & POS Register Summary ─────────────── */}
                    <div
                        className={cn(
                            'flex flex-col w-full lg:w-[440px] xl:w-[480px] 2xl:w-[520px] shrink-0 bg-card border-l overflow-hidden flex-1 lg:flex-none min-h-0 relative shadow-sm',
                            mobileTab !== 'cart' && 'hidden lg:flex',
                        )}
                    >
                        {/* Digital LED Screen Register Banner */}
                        <div className="p-4 sm:p-5 bg-slate-900 dark:bg-slate-950 text-slate-50 border-b space-y-1 shrink-0">
                            <div className="flex items-center justify-between text-xs sm:text-sm text-slate-400 font-mono uppercase tracking-wider font-bold">
                                <span>{t('page.kasir.total_header', 'TOTAL BELANJA')}</span>
                                <span className="flex items-center gap-1.5 text-emerald-400 font-extrabold">
                                    <Receipt className="w-4 h-4" /> {cartCount} Pcs
                                </span>
                            </div>
                            <div className="text-3xl sm:text-4xl font-black text-emerald-400 tracking-tight font-mono">
                                {formatRupiah(grandTotal)}
                            </div>
                        </div>

                        {/* Cart Header */}
                        <div className="flex items-center justify-between p-3.5 border-b bg-muted/30 shrink-0">
                            <div className="flex items-center gap-2">
                                <ShoppingCart className="w-5 h-5 text-primary" />
                                <span className="font-extrabold text-base">
                                    {t('page.kasir.cart_label', 'Daftar Belanja')}
                                </span>
                                {cartCount > 0 && (
                                    <Badge className="h-6 px-2.5 text-xs font-black bg-primary">
                                        {cart.length} {t('page.kasir.items_types', 'Jenis')}
                                    </Badge>
                                )}
                            </div>
                            {cart.length > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-2.5 gap-1.5 text-xs font-bold text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                    onClick={clearCart}
                                >
                                    <Trash2 className="w-4 h-4" />
                                    {t('page.kasir.clear_cart_btn', 'Kosongkan')}
                                </Button>
                            )}
                        </div>

                        {/* Cart Items List */}
                        <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5 min-h-0">
                            {cart.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-10 min-h-[180px] gap-2 text-muted-foreground">
                                    <ShoppingCart className="w-14 h-14 stroke-1 opacity-20" />
                                    <p className="font-extrabold text-base">{t('page.kasir.empty_cart_title', 'Keranjang Masih Kosong')}</p>
                                    <p className="text-xs sm:text-sm text-center opacity-75 max-w-[220px] font-medium">
                                        {t('page.kasir.empty_cart_desc', 'Pilih barang dari daftar atau scan barcode')}
                                    </p>
                                </div>
                            ) : (
                                cart.map((item) => (
                                    <CartItemRow
                                        key={item.product.id}
                                        item={item}
                                        onUpdateQty={updateQty}
                                        onUpdateDiscount={updateItemDiscount}
                                        onRemove={removeFromCart}
                                    />
                                ))
                            )}
                        </div>

                        {/* Sticky Checkout & Payment Summary Section */}
                        <div className="sticky bottom-0 z-20 border-t p-3.5 pb-8 sm:pb-6 lg:pb-3.5 space-y-3.5 bg-card dark:bg-slate-900/90 backdrop-blur-md shadow-lg lg:shadow-none shrink-0 max-h-[75vh] overflow-y-auto lg:overflow-visible">
                            {/* Summary breakdown */}
                            <div className="space-y-2 text-xs sm:text-sm">
                                <div className="flex justify-between font-semibold">
                                    <span className="text-muted-foreground">{t('page.kasir.items_subtotal', 'Subtotal Barang')}</span>
                                    <span className="font-bold font-mono text-foreground">{formatRupiah(itemsSubtotal)}</span>
                                </div>

                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        <Label className="text-xs sm:text-sm text-muted-foreground font-bold">
                                            {t('page.kasir.total_discount_label', 'Potongan / Diskon')}
                                        </Label>
                                        {/* Nominal vs Percentage toggle */}
                                        <div className="flex items-center rounded-md border bg-background overflow-hidden h-7">
                                            <button
                                                type="button"
                                                className={cn(
                                                    'px-2 h-full text-xs font-black border-r transition-colors',
                                                    totalDiscountType === 'nominal'
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'text-muted-foreground hover:bg-muted',
                                                )}
                                                onClick={() => setTotalDiscountType('nominal')}
                                                title="Diskon Nominal (Rp)"
                                            >
                                                Rp
                                            </button>
                                            <button
                                                type="button"
                                                className={cn(
                                                    'px-2 h-full text-xs font-black transition-colors',
                                                    totalDiscountType === 'percent'
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'text-muted-foreground hover:bg-muted',
                                                )}
                                                onClick={() => setTotalDiscountType('percent')}
                                                title="Diskon Persentase (%)"
                                            >
                                                %
                                            </button>
                                        </div>
                                    </div>
                                    {totalDiscountType === 'nominal' ? (
                                        <NumericFormat
                                            customInput={Input}
                                            thousandSeparator="."
                                            decimalSeparator=","
                                            placeholder="0"
                                            value={totalDiscountValue}
                                            onFocus={(e) => e.target.select()}
                                            onValueChange={(values) => {
                                                setTotalDiscountValue(values.floatValue ?? '');
                                            }}
                                            className="h-8 sm:h-9 text-xs sm:text-sm text-right w-24 sm:w-32 font-bold font-mono"
                                        />
                                    ) : (
                                        <Input
                                            type="number"
                                            value={totalDiscountValue}
                                            min={0}
                                            max={100}
                                            placeholder="0"
                                            onFocus={(e) => e.target.select()}
                                            onChange={(e) =>
                                                setTotalDiscountValue(parseFloat(e.target.value) || '')
                                            }
                                            className="h-8 sm:h-9 text-xs sm:text-sm text-right w-24 sm:w-28 font-bold font-mono"
                                        />
                                    )}
                                </div>

                                <Separator />

                                <div className="flex justify-between items-center text-sm sm:text-base font-extrabold pt-0.5">
                                    <span>{t('page.kasir.grand_total_label', 'Grand Total')}</span>
                                    <span className="text-primary text-xl sm:text-2xl font-mono font-black">
                                        {formatRupiah(grandTotal)}
                                    </span>
                                </div>
                            </div>

                            {/* Payment Method Selector (Button Pills with Info Detail Button) */}
                            <div className="space-y-1.5">
                                <Label className="text-xs sm:text-sm font-extrabold flex items-center gap-1.5">
                                    <Banknote className="w-4 h-4 text-muted-foreground" />
                                    {t('page.kasir.payment_method_label', 'Metode Pembayaran')}
                                </Label>
                                <div className="flex flex-wrap gap-1.5">
                                    {paymentMethods.map((pm) => {
                                        const isSelected = String(pm.id) === paymentMethodId;
                                        return (
                                            <div key={pm.id} className="flex items-center rounded-lg border overflow-hidden flex-1 min-w-[115px] bg-background shadow-2xs group/pm">
                                                <Button
                                                    type="button"
                                                    variant={isSelected ? 'default' : 'ghost'}
                                                    size="sm"
                                                    className={cn(
                                                        'h-9 sm:h-10 text-xs sm:text-sm font-bold px-2.5 transition-all flex-1 rounded-r-none border-0',
                                                        isSelected
                                                            ? 'bg-primary text-primary-foreground shadow-xs'
                                                            : 'hover:bg-accent/60 text-foreground',
                                                    )}
                                                    onClick={() => setPaymentMethodId(String(pm.id))}
                                                >
                                                    <span className="truncate">{pm.name}</span>
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant={isSelected ? 'default' : 'ghost'}
                                                    size="icon"
                                                    className={cn(
                                                        'h-9 w-8 sm:h-10 shrink-0 rounded-l-none border-l border-border/40 transition-colors',
                                                        isSelected
                                                            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                                                            : 'text-muted-foreground hover:text-primary hover:bg-primary/10',
                                                    )}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setDetailPaymentMethod(pm);
                                                    }}
                                                    title={`Detail ${pm.name}`}
                                                >
                                                    <Info className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Payment Amount & Quick Cash Buttons */}
                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center">
                                    <Label className="text-xs sm:text-sm font-extrabold flex items-center gap-1.5">
                                        <Coins className="w-4 h-4 text-muted-foreground" />
                                        {t('page.kasir.payment_amount_label', 'Nominal Diterima')}
                                    </Label>
                                </div>
                                <NumericFormat
                                    customInput={Input}
                                    thousandSeparator="."
                                    decimalSeparator=","
                                    placeholder={grandTotal > 0 ? String(grandTotal) : '0'}
                                    value={paymentAmount}
                                    onFocus={(e) => e.target.select()}
                                    onValueChange={(values) => {
                                        setPaymentAmount(values.floatValue ?? '');
                                    }}
                                    className="h-11 sm:h-12 text-lg sm:text-xl font-black font-mono border-primary/50 focus-visible:ring-primary"
                                />

                                {/* Preset Buttons for Cashier Efficiency */}
                                {grandTotal > 0 && (
                                    <div className="flex flex-wrap gap-1 pt-0.5">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="h-8 sm:h-9 text-xs font-black px-2 flex-1 min-w-[65px]"
                                            onClick={() => applyPresetCash('pas')}
                                        >
                                            {t('page.kasir.exact_cash', 'Uang Pas')}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="h-8 sm:h-9 text-xs font-bold px-2 flex-1 min-w-[48px]"
                                            onClick={() => applyPresetCash(5000)}
                                        >
                                            5rb
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="h-8 sm:h-9 text-xs font-bold px-2 flex-1 min-w-[48px]"
                                            onClick={() => applyPresetCash(10000)}
                                        >
                                            10rb
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="h-8 sm:h-9 text-xs font-bold px-2 flex-1 min-w-[48px]"
                                            onClick={() => applyPresetCash(20000)}
                                        >
                                            20rb
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="h-8 sm:h-9 text-xs font-bold px-2 flex-1 min-w-[48px]"
                                            onClick={() => applyPresetCash(50000)}
                                        >
                                            50rb
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="h-8 sm:h-9 text-xs font-bold px-2 flex-1 min-w-[48px]"
                                            onClick={() => applyPresetCash(100000)}
                                        >
                                            100rb
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="h-8 sm:h-9 text-xs font-bold px-2 flex-1 min-w-[48px]"
                                            onClick={() => applyPresetCash(200000)}
                                        >
                                            200rb
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Change Display Panel */}
                            <div
                                className={cn(
                                    'flex justify-between items-center rounded-xl px-3.5 py-2.5 border font-mono',
                                    change < 0
                                        ? 'bg-destructive/10 border-destructive/40 text-destructive'
                                        : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-800 dark:text-emerald-300',
                                )}
                            >
                                <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider">
                                    {change < 0 ? t('page.kasir.underpaid_label', 'Kurang Bayar:') : t('page.kasir.change_label', 'Kembalian:')}
                                </span>
                                <span className="text-lg sm:text-xl font-black">
                                    {formatRupiah(Math.abs(change))}
                                </span>
                            </div>

                            {/* Checkout Button */}
                            <Button
                                className="w-full h-12 sm:h-14 text-base sm:text-lg font-black gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg transition-all"
                                disabled={
                                    cart.length === 0 ||
                                    processing ||
                                    !paymentMethodId ||
                                    (Number(paymentAmount) || 0) < grandTotal
                                }
                                onClick={handleCheckout}
                            >
                                {processing ? (
                                    <RotateCcw className="w-5 h-5 animate-spin" />
                                ) : (
                                    <CreditCard className="w-5 h-5" />
                                )}
                                <span>{t('page.kasir.checkout_btn', 'Bayar Transaksi')} (F9)</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Enhanced Confirm Payment Dialog */}
            <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <AlertDialogContent className="max-w-md">
                    <AlertDialogHeader>
                        <div className="flex items-center justify-between w-full border-b pb-3">
                            <div className="flex items-center gap-2">
                                <div className="p-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full">
                                    <CreditCard className="w-6 h-6" />
                                </div>
                                <div>
                                    <AlertDialogTitle className="text-lg font-extrabold">{t('page.kasir.confirm_dialog_title', 'Konfirmasi Pembayaran')}</AlertDialogTitle>
                                    <p className="text-xs sm:text-sm text-muted-foreground font-medium">{t('page.kasir.confirm_dialog_desc', 'Periksa rincian sebelum menyelesaikan transaksi')}</p>
                                </div>
                            </div>
                            <Badge variant="outline" className="text-xs sm:text-sm font-bold bg-primary/10 text-primary border-primary/30 px-2.5 py-1">
                                {selectedPaymentMethodName}
                            </Badge>
                        </div>
                    </AlertDialogHeader>

                    <div className="space-y-3.5 py-1">
                        {/* Items Overview */}
                        <div className="bg-muted/40 rounded-xl p-3.5 space-y-2.5 text-xs sm:text-sm border">
                            <div className="flex justify-between items-center text-muted-foreground font-bold pb-2 border-b border-border/60">
                                <span>{t('page.kasir.items_breakdown', 'Rincian Barang')}</span>
                                <span className="font-extrabold text-foreground">{cart.length} {t('page.kasir.items_types', 'Jenis')} ({cartCount} Pcs)</span>
                            </div>
                            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                                {cart.map((item) => (
                                    <div key={item.product.id} className="flex justify-between items-center text-xs sm:text-sm font-medium">
                                        <span className="truncate flex-1 pr-2 font-bold">{item.product.name}</span>
                                        <span className="text-muted-foreground shrink-0 font-mono font-semibold">{item.quantity} x {formatRupiah(item.product.price)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Financial Summary Card */}
                        <div className="bg-card rounded-xl border p-3.5 space-y-2 text-xs sm:text-sm font-mono font-semibold">
                            <div className="flex justify-between text-muted-foreground">
                                <span>{t('page.kasir.items_subtotal', 'Subtotal Barang')}:</span>
                                <span className="font-bold">{formatRupiah(itemsSubtotal)}</span>
                            </div>
                            {discountAmount > 0 && (
                                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                                    <span>{t('page.kasir.total_discount_label', 'Potongan / Diskon')} ({totalDiscountType === 'percent' ? `${totalDiscountValue}%` : 'Rp'}):</span>
                                    <span className="font-bold">- {formatRupiah(discountAmount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between font-black text-base pt-1.5 border-t text-foreground">
                                <span>{t('page.kasir.grand_total_label', 'TOTAL HARGA')}:</span>
                                <span className="text-emerald-600 dark:text-emerald-400 text-lg sm:text-xl">{formatRupiah(grandTotal)}</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground pt-0.5">
                                <span>{t('page.kasir.payment_amount_label', 'Nominal Diterima')}:</span>
                                <span className="font-bold text-foreground">{formatRupiah(Number(paymentAmount))}</span>
                            </div>
                        </div>

                        {/* Change highlight panel */}
                        <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-800 dark:text-emerald-300 font-mono">
                            <span className="text-xs sm:text-sm font-black uppercase tracking-wider">{t('page.kasir.change_label', 'KEMBALIAN')}:</span>
                            <span className="text-xl sm:text-2xl font-black">{formatRupiah(Math.max(0, change))}</span>
                        </div>
                    </div>

                    <AlertDialogFooter className="flex-col sm:flex-row gap-2 pt-2">
                        <AlertDialogCancel disabled={processing} className="sm:mr-auto h-10 sm:h-11 font-bold text-xs sm:text-sm">
                            {t('page.kasir.cancel_btn', 'Batal')}
                        </AlertDialogCancel>
                        <Button
                            type="button"
                            variant="outline"
                            disabled={processing}
                            className="gap-2 h-10 sm:h-11 text-xs sm:text-sm font-bold border-emerald-600/40 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
                            onClick={() => submitCheckout(false)}
                        >
                            <Check className="w-4 h-4" />
                            {t('page.kasir.checkout_no_receipt', 'Bayar Tanpa Struk')}
                        </Button>
                        <Button
                            type="button"
                            disabled={processing}
                            className="gap-2 h-10 sm:h-11 text-xs sm:text-sm font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={() => submitCheckout(true)}
                        >
                            <Printer className="w-4 h-4" />
                            {t('page.kasir.checkout_with_receipt', 'Bayar & Cetak Struk')}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Receipt Modal */}
            <ReceiptModal
                open={receiptOpen}
                transaction={lastTransaction}
                onClose={() => setReceiptOpen(false)}
                onNewTransaction={handleNewTransaction}
            />

            {/* Payment Method Detail Dialog */}
            <PaymentMethodDetailDialog
                open={!!detailPaymentMethod}
                paymentMethod={detailPaymentMethod}
                isSelected={String(detailPaymentMethod?.id) === paymentMethodId}
                onClose={() => setDetailPaymentMethod(null)}
                onSelect={(id) => setPaymentMethodId(id)}
            />
        </>
    );
}

CashierIndex.layout = {
    breadcrumbs: [
        {
            title: i18next.t('page.kasir.page_name', 'Kasir'),
            href: url,
        },
    ],
};
