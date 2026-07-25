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
import type { PaginationResponse } from '@/support/interfaces/resource/resource-response';
import axiosInstance from '@/lib/axios';
import { formatRupiah } from '@/lib/format-money';
import {
    handleApiError,
    showErrorToast,
    showSuccessToast,
    cn,
} from '@/lib/utils';
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
import ReceiptModal, { StoreSetting } from '@/components/receipt-modal';
import PaymentMethodDetailDialog from './components/payment-method-detail-dialog';
import UpdateStockDialog from './components/update-stock-dialog';

export interface CartItem {
    product: Product;
    quantity: number;
    discount: number;
    discountType?: 'nominal' | 'percent';
}

const { url } = cashierRoute();

export default function CashierIndex({ storeSetting }: { storeSetting?: StoreSetting | null }) {
    const { t } = useTranslation();

    // ── Products state ──────────────────────────────────────────────────────────
    const [products, setProducts] = useState<Product[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<number | null>(
        null,
    );
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
    const [totalDiscountValue, setTotalDiscountValue] = useState<number | ''>(
        '',
    );
    const [totalDiscountType, setTotalDiscountType] = useState<
        'nominal' | 'percent'
    >('nominal');

    // ── UI / Mobile navigation state ───────────────────────────────────────────
    const [processing, setProcessing] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [receiptOpen, setReceiptOpen] = useState(false);
    const [lastTransaction, setLastTransaction] = useState<Transaction | null>(
        null,
    );
    const [detailPaymentMethod, setDetailPaymentMethod] =
        useState<PaymentMethod | null>(null);
    const [stockEditProduct, setStockEditProduct] = useState<Product | null>(
        null,
    );
    const [mobileTab, setMobileTab] = useState<'products' | 'cart'>('products');

    const searchRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ── Computed values ─────────────────────────────────────────────────────────
    const grossSubtotal = cart.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0,
    );

    const totalItemDiscounts = cart.reduce((sum, item) => {
        const discType = item.discountType || 'nominal';
        const discPerUnit =
            discType === 'percent'
                ? (item.product.price * (item.discount || 0)) / 100
                : item.discount || 0;
        return sum + discPerUnit * item.quantity;
    }, 0);

    const itemsSubtotal = cart.reduce((sum, item) => {
        const discType = item.discountType || 'nominal';
        const discPerUnit =
            discType === 'percent'
                ? (item.product.price * (item.discount || 0)) / 100
                : item.discount || 0;
        const netPrice = Math.max(0, item.product.price - discPerUnit);
        return sum + netPrice * item.quantity;
    }, 0);

    const discountAmount =
        totalDiscountType === 'percent'
            ? (itemsSubtotal * (Number(totalDiscountValue) || 0)) / 100
            : Number(totalDiscountValue) || 0;

    const grandTotal = Math.max(0, itemsSubtotal - discountAmount);
    const change = (Number(paymentAmount) || 0) - grandTotal;
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    const selectedPaymentMethodObj = paymentMethods.find(
        (pm) => String(pm.id) === paymentMethodId,
    );
    const selectedPaymentMethodName = selectedPaymentMethodObj?.name || 'Tunai';

    // Auto-select cash payment method if available
    useEffect(() => {
        if (paymentMethods.length > 0 && !paymentMethodId) {
            const cashMethod = paymentMethods.find(
                (pm) =>
                    pm.name.toLowerCase().includes('tunai') ||
                    pm.name.toLowerCase().includes('cash'),
            );
            setPaymentMethodId(
                String(cashMethod ? cashMethod.id : paymentMethods[0].id),
            );
        }
    }, [paymentMethods, paymentMethodId]);

    // ── Fetch products ──────────────────────────────────────────────────────────
    const fetchProducts = useCallback(
        async (keyword: string, currentPage: number, catId: number | null) => {
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
                const { data } = await axiosInstance.get<ResponseApi<PaginationResponse<Product>>>(
                    apiGetProducts().url,
                    { params },
                );
                if (data.success) {
                    setProducts(data.data.items);
                    setTotalPages(data.data.pagination.last_page);
                    setTotalProducts(data.data.pagination.total);
                }
            } catch (e) {
                handleApiError(e);
            } finally {
                setLoadingProducts(false);
            }
        },
        [],
    );

    const handleStockUpdateSuccess = useCallback(
        (updatedProduct: Product) => {
            fetchProducts(search, page, selectedCategory);
            setCart((prev) =>
                prev.map((item) =>
                    item.product.id === updatedProduct.id
                        ? { ...item, product: updatedProduct }
                        : item,
                ),
            );
        },
        [fetchProducts, search, page, selectedCategory],
    );

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
                const catRes = await axiosInstance.get<ResponseApi<Category[]>>(
                    apiGetCategories().url,
                );
                if (catRes.data.success) {
                    setCategories(catRes.data.data);
                }

                // Fetch Payment Methods
                const pmRes = await axiosInstance.get<ResponseApi<PaymentMethod[]>>(
                    apiGetPaymentMethods().url,
                );
                if (pmRes.data.success) {
                    setPaymentMethods(pmRes.data.data);
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
                    const maxQty = product.is_unlimited
                        ? Infinity
                        : product.stock;
                    if (existing.quantity >= maxQty) {
                        showErrorToast(
                            t(
                                'page.kasir.max_stock_reached',
                                'Stok tidak mencukupi',
                            ),
                        );
                        addedSuccessfully = false;
                        return prev;
                    }
                    return prev.map((i) =>
                        i.product.id === product.id
                            ? { ...i, quantity: i.quantity + 1 }
                            : i,
                    );
                }
                return [
                    ...prev,
                    {
                        product,
                        quantity: 1,
                        discount: 0,
                        discountType: 'nominal',
                    },
                ];
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
                        p.name.toLowerCase() ===
                        barcodeQuery.trim().toLowerCase(),
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
                if (
                    cart.length > 0 &&
                    paymentMethodId &&
                    (Number(paymentAmount) || 0) >= grandTotal
                ) {
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
                const maxQty = item.product.is_unlimited
                    ? Infinity
                    : item.product.stock;
                return {
                    ...item,
                    quantity: Math.max(1, Math.min(qty, maxQty)),
                };
            }),
        );
    }, []);

    const updateItemDiscount = useCallback(
        (
            productId: number,
            discount: number,
            discountType: 'nominal' | 'percent' = 'nominal',
        ) => {
            setCart((prev) =>
                prev.map((item) =>
                    item.product.id === productId
                        ? { ...item, discount, discountType }
                        : item,
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
            showErrorToast(
                t(
                    'page.kasir.select_payment_method',
                    'Pilih metode pembayaran',
                ),
            );
            return;
        }
        if ((Number(paymentAmount) || 0) < grandTotal) {
            showErrorToast(
                t(
                    'page.kasir.insufficient_payment',
                    'Nominal bayar kurang dari total',
                ),
            );
            return;
        }
        setConfirmOpen(true);
    };

    const submitCheckout = async (shouldPrintReceipt: boolean = true) => {
        setConfirmOpen(false);
        setProcessing(true);
        try {
            const { data } = await axiosInstance.post<ResponseApi<Transaction>>(
                apiCheckout().url,
                {
                    payment_method_id: Number(paymentMethodId),
                    total_amount: grandTotal,
                    discount_amount: discountAmount,
                    payment_amount: Number(paymentAmount),
                    change_amount: Math.max(0, change),
                    items: cart.map((item) => {
                        const discType = item.discountType || 'nominal';
                        const discPerUnit =
                            discType === 'percent'
                                ? (item.product.price * (item.discount || 0)) /
                                100
                                : item.discount || 0;
                        return {
                            product_id: item.product.id,
                            unit_name: item.product.unit_name,
                            quantity: item.quantity,
                            price: item.product.price,
                            cost_price: item.product.cost_price,
                            discount: discPerUnit,
                        };
                    }),
                },
            );

            if (data.success) {
                setLastTransaction(data.data as unknown as Transaction);
                showSuccessToast(
                    t(
                        'page.kasir.checkout_success',
                        'Transaksi berhasil diselesaikan!',
                    ),
                );
                fetchProducts(search, page, selectedCategory);

                if (shouldPrintReceipt) {
                    setReceiptOpen(true);
                    setTimeout(() => {
                        window.print();
                        handleNewTransaction();
                    }, 150);
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

            <div className="flex h-[calc(100vh-4rem)] flex-col overflow-hidden bg-background">
                {/* ─── MOBILE NAVIGATION TABS (Visible only on < lg screens) ───── */}
                <div className="flex shrink-0 border-b bg-card shadow-xs lg:hidden">
                    <button
                        type="button"
                        className={cn(
                            'flex flex-1 items-center justify-center gap-2 border-b-2 py-3.5 text-sm font-black transition-all',
                            mobileTab === 'products'
                                ? 'border-primary bg-primary/5 text-primary'
                                : 'border-transparent text-muted-foreground hover:bg-muted/30',
                        )}
                        onClick={() => setMobileTab('products')}
                    >
                        <Package className="h-4 w-4" />
                        <span>
                            {t('page.kasir.products_tab', 'Daftar Barang')} (
                            {totalProducts})
                        </span>
                    </button>
                    <button
                        type="button"
                        className={cn(
                            'flex flex-1 items-center justify-center gap-2 border-b-2 py-3.5 text-sm font-black transition-all',
                            mobileTab === 'cart'
                                ? 'border-primary bg-primary/5 text-primary'
                                : 'border-transparent text-muted-foreground hover:bg-muted/30',
                        )}
                        onClick={() => setMobileTab('cart')}
                    >
                        <ShoppingCart className="h-4 w-4" />
                        <span>{t('page.kasir.cart_tab', 'Keranjang')}</span>
                        {cartCount > 0 && (
                            <Badge className="h-5 bg-emerald-600 px-2 text-xs font-black">
                                {cartCount} Item
                            </Badge>
                        )}
                    </button>
                </div>

                <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
                    {/* ─── LEFT PANEL: Minimarket Product Table & Lookup ───────── */}
                    <div
                        className={cn(
                            'flex min-w-0 flex-1 flex-col overflow-hidden border-r',
                            mobileTab !== 'products' && 'hidden lg:flex',
                        )}
                    >
                        {/* Top Shortcut Banner */}
                        <div className="hidden items-center justify-between border-b bg-muted/70 px-3.5 py-2 text-xs font-semibold text-muted-foreground sm:flex">
                            <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1.5 font-mono">
                                    <kbd className="rounded border bg-background px-1.5 py-0.5 text-xs font-bold shadow-xs">
                                        F2
                                    </kbd>{' '}
                                    {t(
                                        'page.kasir.shortcut_search',
                                        'Cari Barang',
                                    )}
                                </span>
                                <span className="flex items-center gap-1.5 font-mono">
                                    <kbd className="rounded border bg-background px-1.5 py-0.5 text-xs font-bold shadow-xs">
                                        Enter
                                    </kbd>{' '}
                                    {t(
                                        'page.kasir.shortcut_select',
                                        'Scan / Pilih',
                                    )}
                                </span>
                                <span className="flex items-center gap-1.5 font-mono">
                                    <kbd className="rounded border bg-background px-1.5 py-0.5 text-xs font-bold shadow-xs">
                                        F9
                                    </kbd>{' '}
                                    {t(
                                        'page.kasir.shortcut_checkout',
                                        'Proses Bayar',
                                    )}
                                </span>
                            </div>
                            <Badge
                                variant="outline"
                                className="gap-1 px-2.5 py-0.5 font-mono text-xs font-bold"
                            >
                                <Package className="h-3.5 w-3.5 text-primary" />
                                {totalProducts}{' '}
                                {t(
                                    'page.kasir.product_data_count',
                                    'Data Barang',
                                )}
                            </Badge>
                        </div>

                        {/* Search Bar & Category Filter */}
                        <div className="shrink-0 space-y-2.5 border-b bg-card p-3 sm:p-4">
                            <div className="flex items-center gap-2">
                                <div className="relative flex-1">
                                    <Search className="pointer-events-none absolute top-1/2 left-3.5 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
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
                                        className="h-11 border-primary/40 pr-10 pl-11 text-base font-bold shadow-xs focus-visible:ring-primary sm:h-12"
                                        autoFocus
                                    />
                                    {search ? (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSearch('');
                                                searchRef.current?.focus();
                                            }}
                                            className="absolute top-1/2 right-3.5 -translate-y-1/2 p-1 text-sm font-extrabold text-muted-foreground hover:text-foreground"
                                        >
                                            ✕
                                        </button>
                                    ) : (
                                        <ScanBarcode className="pointer-events-none absolute top-1/2 right-3.5 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                                    )}
                                </div>
                            </div>

                            {/* Category Filter Pills */}
                            {categories.length > 0 && (
                                <div className="scrollbar-none flex items-center gap-2 overflow-x-auto pb-1 text-xs sm:text-sm">
                                    <span className="mr-1 flex shrink-0 items-center gap-1 text-xs font-bold text-muted-foreground">
                                        <Tag className="h-3.5 w-3.5" />{' '}
                                        {t(
                                            'page.kasir.category_label',
                                            'Kategori:',
                                        )}
                                    </span>
                                    <Button
                                        type="button"
                                        variant={
                                            selectedCategory === null
                                                ? 'default'
                                                : 'outline'
                                        }
                                        size="sm"
                                        className="h-7 shrink-0 rounded-full px-3 text-xs font-bold sm:h-8 sm:text-sm"
                                        onClick={() => {
                                            setSelectedCategory(null);
                                            setPage(1);
                                        }}
                                    >
                                        {t(
                                            'page.kasir.all_categories',
                                            'Semua',
                                        )}
                                    </Button>
                                    {categories.map((cat) => (
                                        <Button
                                            key={cat.id}
                                            type="button"
                                            variant={
                                                selectedCategory === cat.id
                                                    ? 'default'
                                                    : 'outline'
                                            }
                                            size="sm"
                                            className="h-7 shrink-0 rounded-full px-3 text-xs font-bold sm:h-8 sm:text-sm"
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
                                <div className="space-y-3 p-4">
                                    {Array.from({ length: 8 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center gap-3"
                                        >
                                            <Skeleton className="h-10 w-28" />
                                            <Skeleton className="h-10 flex-1" />
                                            <Skeleton className="h-10 w-20" />
                                            <Skeleton className="h-10 w-24" />
                                        </div>
                                    ))}
                                </div>
                            ) : products.length === 0 ? (
                                <div className="flex h-full flex-col items-center justify-center p-8 text-center text-muted-foreground">
                                    <Search className="mb-2 h-14 w-14 stroke-1 opacity-25" />
                                    <p className="text-base font-extrabold">
                                        {t(
                                            'page.kasir.no_products_found',
                                            'Barang tidak ditemukan',
                                        )}
                                    </p>
                                    <p className="mt-1 max-w-xs text-sm font-medium text-muted-foreground">
                                        {t(
                                            'page.kasir.no_products_desc',
                                            'Coba ketik kata kunci lain atau scan ulang barcode barang',
                                        )}
                                    </p>
                                </div>
                            ) : (
                                <table className="w-full border-collapse text-left">
                                    <thead className="sticky top-0 z-10 border-b bg-muted/95 text-xs font-extrabold tracking-wider text-muted-foreground uppercase shadow-xs backdrop-blur-xs sm:text-sm">
                                        <tr>
                                            <th className="hidden px-2 py-3 sm:table-cell sm:px-3.5">
                                                {t(
                                                    'page.kasir.table_code',
                                                    'Kode / Barcode',
                                                )}
                                            </th>
                                            <th className="px-2 py-3 sm:px-3.5">
                                                {t(
                                                    'page.kasir.table_name',
                                                    'Nama Barang',
                                                )}
                                            </th>
                                            <th className="px-2 py-3 sm:px-3.5">
                                                {t(
                                                    'page.kasir.table_stock',
                                                    'Stok',
                                                )}
                                            </th>
                                            <th className="hidden px-2 py-3 sm:px-3.5 md:table-cell">
                                                {t(
                                                    'page.kasir.table_unit',
                                                    'Satuan',
                                                )}
                                            </th>
                                            <th className="px-2 py-3 text-right sm:px-3.5">
                                                {t(
                                                    'page.kasir.table_price',
                                                    'Harga Jual',
                                                )}
                                            </th>
                                            <th className="px-2 py-3 text-center sm:px-3.5">
                                                {t(
                                                    'page.kasir.table_action',
                                                    'Aksi',
                                                )}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.map((product) => (
                                            <ProductRow
                                                key={product.id}
                                                product={product}
                                                onAdd={addToCart}
                                                onEditStock={(p) =>
                                                    setStockEditProduct(p)
                                                }
                                                isInCart={cart.some(
                                                    (i) =>
                                                        i.product.id ===
                                                        product.id,
                                                )}
                                            />
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        {/* Table Pagination */}
                        {totalPages > 1 && (
                            <div className="flex shrink-0 items-center justify-between border-t bg-card px-4 py-2.5 text-xs font-semibold sm:text-sm">
                                <span className="font-mono text-muted-foreground">
                                    {t('page.kasir.page_label', 'Halaman')}{' '}
                                    {page} {t('page.kasir.of_label', 'dari')}{' '}
                                    {totalPages}
                                </span>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 gap-1 px-2.5 text-xs font-bold sm:text-sm"
                                        disabled={page <= 1 || loadingProducts}
                                        onClick={() => setPage((p) => p - 1)}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        {t('page.kasir.prev_btn', 'Prev')}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 gap-1 px-2.5 text-xs font-bold sm:text-sm"
                                        disabled={
                                            page >= totalPages ||
                                            loadingProducts
                                        }
                                        onClick={() => setPage((p) => p + 1)}
                                    >
                                        {t('page.kasir.next_btn', 'Next')}
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Floating Mobile Cart Bar */}
                        {cartCount > 0 && mobileTab === 'products' && (
                            <div className="flex shrink-0 items-center justify-between border-t bg-slate-900 p-3.5 text-slate-50 shadow-xl lg:hidden">
                                <div className="flex flex-col">
                                    <span className="font-mono text-xs font-bold text-slate-400 uppercase">
                                        {t('page.kasir.mobile_total', 'Total')}{' '}
                                        ({cartCount}{' '}
                                        {t('page.kasir.items_unit', 'Barang')})
                                    </span>
                                    <span className="mt-0.5 font-mono text-xl leading-none font-black text-emerald-400">
                                        {formatRupiah(grandTotal)}
                                    </span>
                                </div>
                                <Button
                                    size="sm"
                                    className="h-10 gap-2 bg-emerald-600 px-4 text-xs font-extrabold text-white shadow-md hover:bg-emerald-700 sm:text-sm"
                                    onClick={() => setMobileTab('cart')}
                                >
                                    <ShoppingCart className="h-4 w-4" />
                                    <span>
                                        {t(
                                            'page.kasir.view_cart',
                                            'Lihat Keranjang',
                                        )}{' '}
                                        ({cartCount})
                                    </span>
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* ─── RIGHT PANEL: Cart & POS Register Summary ─────────────── */}
                    <div
                        className={cn(
                            'relative flex min-h-0 w-full flex-1 shrink-0 flex-col overflow-hidden border-l bg-card shadow-sm lg:w-[480px] lg:flex-none xl:w-[520px] 2xl:w-[560px]',
                            mobileTab !== 'cart' && 'hidden lg:flex',
                        )}
                    >
                        {/* Digital LED Screen Register Banner */}
                        <div className="shrink-0 space-y-1 border-b bg-slate-900 p-4 text-slate-50 sm:p-5 dark:bg-slate-950">
                            <div className="flex items-center justify-between font-mono text-xs font-bold tracking-wider text-slate-400 uppercase sm:text-sm">
                                <span>
                                    {t(
                                        'page.kasir.total_header',
                                        'TOTAL BELANJA',
                                    )}
                                </span>
                                <span className="flex items-center gap-1.5 font-extrabold text-emerald-400">
                                    <Receipt className="h-4 w-4" /> {cartCount}{' '}
                                    Item
                                </span>
                            </div>
                            <div className="font-mono text-3xl font-black tracking-tight text-emerald-400 sm:text-4xl">
                                {formatRupiah(grandTotal)}
                            </div>
                        </div>

                        {/* Cart Header */}
                        <div className="flex shrink-0 items-center justify-between border-b bg-muted/30 p-3.5">
                            <div className="flex items-center gap-2">
                                <ShoppingCart className="h-5 w-5 text-primary" />
                                <span className="text-base font-extrabold">
                                    {t(
                                        'page.kasir.cart_label',
                                        'Daftar Belanja',
                                    )}
                                </span>
                                {cartCount > 0 && (
                                    <Badge className="h-6 bg-primary px-2.5 text-xs font-black">
                                        {cart.length}{' '}
                                        {t('page.kasir.items_types', 'Jenis')}
                                    </Badge>
                                )}
                            </div>
                            {cart.length > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 gap-1.5 px-2.5 text-xs font-bold text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                    onClick={clearCart}
                                >
                                    <Trash2 className="h-4 w-4" />
                                    {t(
                                        'page.kasir.clear_cart_btn',
                                        'Kosongkan',
                                    )}
                                </Button>
                            )}
                        </div>

                        {/* Cart Items List */}
                        <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto p-3.5">
                            {cart.length === 0 ? (
                                <div className="flex min-h-[180px] flex-col items-center justify-center gap-2 py-10 text-muted-foreground">
                                    <ShoppingCart className="h-14 w-14 stroke-1 opacity-20" />
                                    <p className="text-base font-extrabold">
                                        {t(
                                            'page.kasir.empty_cart_title',
                                            'Keranjang Masih Kosong',
                                        )}
                                    </p>
                                    <p className="max-w-[220px] text-center text-xs font-medium opacity-75 sm:text-sm">
                                        {t(
                                            'page.kasir.empty_cart_desc',
                                            'Pilih barang dari daftar atau scan barcode',
                                        )}
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
                        <div className="sticky bottom-0 z-20 max-h-[75vh] shrink-0 space-y-3.5 overflow-y-auto border-t bg-card p-3.5 pb-8 shadow-lg backdrop-blur-md sm:pb-6 lg:overflow-visible lg:pb-3.5 lg:shadow-none dark:bg-slate-900/90">
                            {/* Summary breakdown */}
                            <div className="space-y-2 text-xs sm:text-sm">
                                <div className="flex justify-between font-semibold">
                                    <span className="text-muted-foreground">
                                        {t(
                                            'page.kasir.items_subtotal',
                                            'Subtotal Barang',
                                        )}
                                    </span>
                                    <span className="font-mono font-bold text-foreground">
                                        {formatRupiah(itemsSubtotal)}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex shrink-0 items-center gap-1.5">
                                        <Label className="text-xs font-bold text-muted-foreground sm:text-sm">
                                            {t(
                                                'page.kasir.total_discount_label',
                                                'Potongan / Diskon',
                                            )}
                                        </Label>
                                        {/* Nominal vs Percentage toggle */}
                                        <div className="flex h-7 items-center overflow-hidden rounded-md border bg-background">
                                            <button
                                                type="button"
                                                className={cn(
                                                    'h-full border-r px-2 text-xs font-black transition-colors',
                                                    totalDiscountType ===
                                                        'nominal'
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'text-muted-foreground hover:bg-muted',
                                                )}
                                                onClick={() => {
                                                    setTotalDiscountType(
                                                        'nominal',
                                                    );
                                                    if (
                                                        typeof totalDiscountValue ===
                                                        'number' &&
                                                        totalDiscountValue >
                                                        itemsSubtotal
                                                    ) {
                                                        setTotalDiscountValue(
                                                            itemsSubtotal,
                                                        );
                                                    }
                                                }}
                                                title="Diskon Nominal (Rp)"
                                            >
                                                Rp
                                            </button>
                                            <button
                                                type="button"
                                                className={cn(
                                                    'h-full px-2 text-xs font-black transition-colors',
                                                    totalDiscountType ===
                                                        'percent'
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'text-muted-foreground hover:bg-muted',
                                                )}
                                                onClick={() => {
                                                    setTotalDiscountType(
                                                        'percent',
                                                    );
                                                    if (
                                                        typeof totalDiscountValue ===
                                                        'number' &&
                                                        totalDiscountValue > 100
                                                    ) {
                                                        setTotalDiscountValue(
                                                            100,
                                                        );
                                                    }
                                                }}
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
                                                const val = values.floatValue;
                                                if (
                                                    val === undefined ||
                                                    val < 0
                                                ) {
                                                    setTotalDiscountValue('');
                                                } else if (
                                                    val > itemsSubtotal
                                                ) {
                                                    setTotalDiscountValue(
                                                        itemsSubtotal,
                                                    );
                                                } else {
                                                    setTotalDiscountValue(val);
                                                }
                                            }}
                                            className="h-8 w-24 text-right font-mono text-xs font-bold sm:h-9 sm:w-32 sm:text-sm"
                                        />
                                    ) : (
                                        <div className="flex items-center gap-1.5">
                                            {Boolean(totalDiscountValue) && (
                                                <span className="font-mono text-xs font-bold text-muted-foreground sm:text-sm">
                                                    (
                                                    {formatRupiah(
                                                        discountAmount,
                                                    )}
                                                    )
                                                </span>
                                            )}
                                            <Input
                                                type="number"
                                                value={totalDiscountValue}
                                                min={0}
                                                max={100}
                                                placeholder="0"
                                                onFocus={(e) =>
                                                    e.target.select()
                                                }
                                                onChange={(e) => {
                                                    let val = parseFloat(
                                                        e.target.value,
                                                    );
                                                    if (isNaN(val) || val < 0) {
                                                        setTotalDiscountValue(
                                                            '',
                                                        );
                                                    } else {
                                                        if (val > 100)
                                                            val = 100;
                                                        setTotalDiscountValue(
                                                            val,
                                                        );
                                                    }
                                                }}
                                                className="h-8 w-16 text-right font-mono text-xs font-bold sm:h-9 sm:w-20 sm:text-sm"
                                            />
                                        </div>
                                    )}
                                </div>

                                <Separator />

                                <div className="flex items-center justify-between pt-0.5 text-sm font-extrabold sm:text-base">
                                    <span>
                                        {t(
                                            'page.kasir.grand_total_label',
                                            'Grand Total',
                                        )}
                                    </span>
                                    <span className="font-mono text-xl font-black text-primary sm:text-2xl">
                                        {formatRupiah(grandTotal)}
                                    </span>
                                </div>
                            </div>

                            {/* Payment Method Selector (Button Pills with Info Detail Button) */}
                            <div className="space-y-1.5">
                                <Label className="flex items-center gap-1.5 text-xs font-extrabold sm:text-sm">
                                    <Banknote className="h-4 w-4 text-muted-foreground" />
                                    {t(
                                        'page.kasir.payment_method_label',
                                        'Metode Pembayaran',
                                    )}
                                </Label>
                                <div className="flex flex-wrap gap-1.5">
                                    {paymentMethods.map((pm) => {
                                        const isSelected =
                                            String(pm.id) === paymentMethodId;
                                        return (
                                            <div
                                                key={pm.id}
                                                className="group/pm flex min-w-[115px] flex-1 items-center overflow-hidden rounded-lg border bg-background shadow-2xs"
                                            >
                                                <Button
                                                    type="button"
                                                    variant={
                                                        isSelected
                                                            ? 'default'
                                                            : 'ghost'
                                                    }
                                                    size="sm"
                                                    className={cn(
                                                        'h-9 flex-1 rounded-r-none border-0 px-2.5 text-xs font-bold transition-all sm:h-10 sm:text-sm',
                                                        isSelected
                                                            ? 'bg-primary text-primary-foreground shadow-xs'
                                                            : 'text-foreground hover:bg-accent/60',
                                                    )}
                                                    onClick={() =>
                                                        setPaymentMethodId(
                                                            String(pm.id),
                                                        )
                                                    }
                                                >
                                                    <span className="truncate">
                                                        {pm.name}
                                                    </span>
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant={
                                                        isSelected
                                                            ? 'default'
                                                            : 'ghost'
                                                    }
                                                    size="icon"
                                                    className={cn(
                                                        'h-9 w-8 shrink-0 rounded-l-none border-l border-border/40 transition-colors sm:h-10',
                                                        isSelected
                                                            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                                                            : 'text-muted-foreground hover:bg-primary/10 hover:text-primary',
                                                    )}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setDetailPaymentMethod(
                                                            pm,
                                                        );
                                                    }}
                                                    title={`Detail ${pm.name}`}
                                                >
                                                    <Info className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Payment Amount & Quick Cash Buttons */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <Label className="flex items-center gap-1.5 text-xs font-extrabold sm:text-sm">
                                        <Coins className="h-4 w-4 text-muted-foreground" />
                                        {t(
                                            'page.kasir.payment_amount_label',
                                            'Nominal Diterima',
                                        )}
                                    </Label>
                                </div>
                                <NumericFormat
                                    customInput={Input}
                                    thousandSeparator="."
                                    decimalSeparator=","
                                    placeholder={t(
                                        'page.kasir.payment_amount_placeholder',
                                        'Masukkan nominal pembayaran',
                                    )}
                                    value={paymentAmount}
                                    onFocus={(e) => e.target.select()}
                                    onValueChange={(values) => {
                                        setPaymentAmount(
                                            values.floatValue ?? '',
                                        );
                                    }}
                                    className="h-11 border-primary/50 font-mono text-lg font-black focus-visible:ring-primary sm:h-12 sm:text-xl"
                                />

                                {/* Preset Buttons for Cashier Efficiency */}
                                {grandTotal > 0 && (
                                    <div className="flex flex-wrap gap-1 pt-0.5">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="h-8 min-w-[65px] flex-1 px-2 text-xs font-black sm:h-9"
                                            onClick={() =>
                                                applyPresetCash('pas')
                                            }
                                        >
                                            {t(
                                                'page.kasir.exact_cash',
                                                'Uang Pas',
                                            )}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="h-8 min-w-[48px] flex-1 px-2 text-xs font-bold sm:h-9"
                                            onClick={() =>
                                                applyPresetCash(5000)
                                            }
                                        >
                                            5rb
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="h-8 min-w-[48px] flex-1 px-2 text-xs font-bold sm:h-9"
                                            onClick={() =>
                                                applyPresetCash(10000)
                                            }
                                        >
                                            10rb
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="h-8 min-w-[48px] flex-1 px-2 text-xs font-bold sm:h-9"
                                            onClick={() =>
                                                applyPresetCash(20000)
                                            }
                                        >
                                            20rb
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="h-8 min-w-[48px] flex-1 px-2 text-xs font-bold sm:h-9"
                                            onClick={() =>
                                                applyPresetCash(50000)
                                            }
                                        >
                                            50rb
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="h-8 min-w-[48px] flex-1 px-2 text-xs font-bold sm:h-9"
                                            onClick={() =>
                                                applyPresetCash(100000)
                                            }
                                        >
                                            100rb
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="h-8 min-w-[48px] flex-1 px-2 text-xs font-bold sm:h-9"
                                            onClick={() =>
                                                applyPresetCash(200000)
                                            }
                                        >
                                            200rb
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Change Display Panel */}
                            <div
                                className={cn(
                                    'flex items-center justify-between rounded-xl border px-3.5 py-2.5 font-mono',
                                    change < 0
                                        ? 'border-destructive/40 bg-destructive/10 text-destructive'
                                        : 'border-emerald-500/40 bg-emerald-500/15 text-emerald-800 dark:text-emerald-300',
                                )}
                            >
                                <span className="text-xs font-extrabold tracking-wider uppercase sm:text-sm">
                                    {change < 0
                                        ? t(
                                            'page.kasir.underpaid_label',
                                            'Kurang Bayar:',
                                        )
                                        : t(
                                            'page.kasir.change_label',
                                            'Kembalian:',
                                        )}
                                </span>
                                <span className="text-lg font-black sm:text-xl">
                                    {formatRupiah(Math.abs(change))}
                                </span>
                            </div>

                            {/* Checkout Button */}
                            <Button
                                className="h-12 w-full gap-2 bg-emerald-600 text-base font-black text-white shadow-lg transition-all hover:bg-emerald-700 sm:h-14 sm:text-lg"
                                disabled={
                                    cart.length === 0 ||
                                    processing ||
                                    !paymentMethodId ||
                                    (Number(paymentAmount) || 0) < grandTotal
                                }
                                onClick={handleCheckout}
                            >
                                {processing ? (
                                    <RotateCcw className="h-5 w-5 animate-spin" />
                                ) : (
                                    <CreditCard className="h-5 w-5" />
                                )}
                                <span>
                                    {t(
                                        'page.kasir.checkout_btn',
                                        'Bayar Transaksi',
                                    )}{' '}
                                    (F9)
                                </span>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Enhanced Confirm Payment Dialog */}
            <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <AlertDialogContent className="max-w-md">
                    <AlertDialogHeader>
                        <div className="flex w-full items-center justify-between border-b pb-3">
                            <div className="flex items-center gap-2">
                                <div className="rounded-full bg-emerald-500/10 p-2.5 text-emerald-600 dark:text-emerald-400">
                                    <CreditCard className="h-6 w-6" />
                                </div>
                                <div>
                                    <AlertDialogTitle className="text-lg font-extrabold">
                                        {t(
                                            'page.kasir.confirm_dialog_title',
                                            'Konfirmasi Pembayaran',
                                        )}
                                    </AlertDialogTitle>
                                    <p className="text-xs font-medium text-muted-foreground sm:text-sm">
                                        {t(
                                            'page.kasir.confirm_dialog_desc',
                                            'Periksa rincian sebelum menyelesaikan transaksi',
                                        )}
                                    </p>
                                </div>
                            </div>
                            <Badge
                                variant="outline"
                                className="border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary sm:text-sm"
                            >
                                {selectedPaymentMethodName}
                            </Badge>
                        </div>
                    </AlertDialogHeader>

                    <div className="space-y-3.5 py-1">
                        {/* Items Overview */}
                        <div className="space-y-2.5 rounded-xl border bg-muted/40 p-3.5 text-xs sm:text-sm">
                            <div className="flex items-center justify-between border-b border-border/60 pb-2 font-bold text-muted-foreground">
                                <span>
                                    {t(
                                        'page.kasir.items_breakdown',
                                        'Rincian Barang',
                                    )}
                                </span>
                                <span className="font-extrabold text-foreground">
                                    {cart.length}{' '}
                                    {t('page.kasir.items_types', 'Jenis')} (
                                    {cartCount} Item)
                                </span>
                            </div>
                            <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
                                {cart.map((item) => {
                                    const discType =
                                        item.discountType || 'nominal';
                                    const discPerUnit =
                                        discType === 'percent'
                                            ? (item.product.price *
                                                (item.discount || 0)) /
                                            100
                                            : item.discount || 0;
                                    const netUnitPrice = Math.max(
                                        0,
                                        item.product.price - discPerUnit,
                                    );
                                    const itemSubtotal =
                                        netUnitPrice * item.quantity;
                                    const hasDisc = discPerUnit > 0;

                                    return (
                                        <div
                                            key={item.product.id}
                                            className="space-y-0.5 border-b border-border/40 pb-1.5 last:border-b-0 last:pb-0"
                                        >
                                            <div className="flex justify-between gap-2 text-xs font-bold sm:text-sm">
                                                <span className="flex-1 truncate text-foreground">
                                                    {item.product.name}
                                                </span>
                                                <span className="shrink-0 text-right font-mono font-extrabold">
                                                    {formatRupiah(itemSubtotal)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between font-mono text-[11px] text-muted-foreground">
                                                <span>
                                                    {item.quantity} x{' '}
                                                    {hasDisc ? (
                                                        <>
                                                            <span className="mr-1 font-normal text-muted-foreground/70 line-through">
                                                                {formatRupiah(
                                                                    item.product
                                                                        .price,
                                                                )}
                                                            </span>
                                                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                                                {formatRupiah(
                                                                    netUnitPrice,
                                                                )}
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <span>
                                                            {formatRupiah(
                                                                item.product
                                                                    .price,
                                                            )}
                                                        </span>
                                                    )}
                                                    {item.product.unit_name
                                                        ? ` (${item.product.unit_name})`
                                                        : ''}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Financial Summary Card */}
                        <div className="space-y-2 rounded-xl border bg-card p-3.5 font-mono text-xs font-semibold sm:text-sm">
                            <div className="flex justify-between text-muted-foreground">
                                <span>
                                    {t(
                                        'page.kasir.items_subtotal',
                                        'Subtotal Barang',
                                    )}
                                    :
                                </span>
                                <span className="font-bold text-foreground">
                                    {formatRupiah(itemsSubtotal)}
                                </span>
                            </div>
                            {discountAmount > 0 && (
                                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                                    <span>
                                        {t(
                                            'page.kasir.total_discount_label',
                                            'Diskon Transaksi',
                                        )}{' '}
                                        (
                                        {totalDiscountType === 'percent'
                                            ? `${totalDiscountValue}%`
                                            : 'Rp'}
                                        ):
                                    </span>
                                    <span className="font-bold">
                                        - {formatRupiah(discountAmount)}
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-between border-t pt-1.5 text-base font-black text-foreground">
                                <span>
                                    {t(
                                        'page.kasir.grand_total_label',
                                        'TOTAL HARGA',
                                    )}
                                    :
                                </span>
                                <span className="text-lg text-emerald-600 sm:text-xl dark:text-emerald-400">
                                    {formatRupiah(grandTotal)}
                                </span>
                            </div>
                            <div className="flex justify-between pt-0.5 text-muted-foreground">
                                <span>
                                    {t(
                                        'page.kasir.payment_amount_label',
                                        'Nominal Diterima',
                                    )}
                                    :
                                </span>
                                <span className="font-bold text-foreground">
                                    {formatRupiah(Number(paymentAmount))}
                                </span>
                            </div>
                        </div>

                        {/* Change highlight panel */}
                        <div className="flex items-center justify-between rounded-xl border border-emerald-500/40 bg-emerald-500/15 p-3.5 font-mono text-emerald-800 dark:text-emerald-300">
                            <span className="text-xs font-black tracking-wider uppercase sm:text-sm">
                                {t('page.kasir.change_label', 'KEMBALIAN')}
                            </span>
                            <span className="text-xl font-black sm:text-2xl">
                                {formatRupiah(Math.max(0, change))}
                            </span>
                        </div>
                    </div>

                    <AlertDialogFooter className="flex-col gap-2 pt-2 sm:flex-row">
                        <AlertDialogCancel
                            disabled={processing}
                            className="h-10 text-xs font-bold sm:mr-auto sm:h-11 sm:text-sm"
                        >
                            {t('page.kasir.cancel_btn', 'Batal')}
                        </AlertDialogCancel>
                        <Button
                            type="button"
                            variant="outline"
                            disabled={processing}
                            className="h-10 gap-2 border-emerald-600/40 text-xs font-bold text-emerald-700 hover:bg-emerald-50 sm:h-11 sm:text-sm dark:text-emerald-400 dark:hover:bg-emerald-950/40"
                            onClick={() => submitCheckout(false)}
                        >
                            <Check className="h-4 w-4" />
                            {t(
                                'page.kasir.checkout_no_receipt',
                                'Bayar Tanpa Struk',
                            )}
                        </Button>
                        <Button
                            type="button"
                            disabled={processing}
                            className="h-10 gap-2 bg-emerald-600 text-xs font-extrabold text-white hover:bg-emerald-700 sm:h-11 sm:text-sm"
                            onClick={() => submitCheckout(true)}
                        >
                            <Printer className="h-4 w-4" />
                            {t(
                                'page.kasir.checkout_with_receipt',
                                'Bayar & Cetak Struk',
                            )}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Receipt Modal */}
            <ReceiptModal
                open={receiptOpen}
                transaction={lastTransaction}
                storeSetting={storeSetting}
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

            {/* Update Stock Dialog */}
            <UpdateStockDialog
                open={!!stockEditProduct}
                product={stockEditProduct}
                onClose={() => setStockEditProduct(null)}
                onSuccess={handleStockUpdateSuccess}
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
