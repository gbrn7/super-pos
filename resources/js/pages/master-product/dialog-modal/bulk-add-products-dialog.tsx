import {
    PlusCircle,
    Trash2,
    Layers,
    Check,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import { sprintf } from 'sprintf-js';
import ErrorFormInfo from '@/components/errorFormInfo';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';
import axiosInstance from '@/lib/axios';
import {
    handleApiError,
    showSuccessToast,
    showWarningToast,
} from '@/lib/utils';
import { bulkStore } from '@/routes/apiProducts';
import type { ResponseApi } from '@/support/interfaces/response/Response';
import type { Category } from '@/support/models/category';
import type { MasterProduct } from '@/support/models/masterProduct';
import type { Unit } from '@/support/models/unit';

export interface BulkAddProductItem {
    master_product_id: number;
    name: string;
    barcode: string;
    category_id: number | null;
    unit_id: number | null;
    stock: number | string | null;
    cost_price: number | null;
    price: number | null;
    is_active: boolean;
    is_unlimited: boolean;
    desc: string;
    isAdded: boolean;
}

export interface BulkAddProductError {
    category_id?: string;
    unit_id?: string;
    stock?: string;
    cost_price?: string;
    price?: string;
}

interface BulkAddProductsDialogProps {
    isDisabled: boolean;
    selectedLength: number;
    isOpen: boolean;
    setOpen: (open: boolean) => void;
    onSuccess: () => void;
    masterProducts: MasterProduct[];
    categories: Category[];
    units: Unit[];
    onBulkAddClick?: () => void;
}

const ITEMS_PER_PAGE = 10;

export function BulkAddProductsDialog({
    isDisabled,
    selectedLength,
    isOpen,
    setOpen,
    onSuccess,
    masterProducts,
    categories,
    units,
    onBulkAddClick,
}: BulkAddProductsDialogProps) {
    const { t } = useTranslation();
    const [loading, setLoading] = useState<boolean>(false);
    const [items, setItems] = useState<BulkAddProductItem[]>([]);
    const [errors, setErrors] = useState<Record<number, BulkAddProductError>>(
        {},
    );
    const [currentPage, setCurrentPage] = useState<number>(1);

    // Global / batch settings state
    const [batchCategory, setBatchCategory] = useState<string>('');
    const [batchUnit, setBatchUnit] = useState<string>('');
    const [batchStock, setBatchStock] = useState<string>('');

    const categoryOptions = useMemo(
        () =>
            categories.map((category) => ({
                label: category.name,
                value: category.id.toString(),
            })),
        [categories],
    );

    const unitOptions = useMemo(
        () =>
            units.map((unit) => ({
                label: unit.name,
                value: unit.id.toString(),
            })),
        [units],
    );

    // Initialize items state when dialog opens or masterProducts changes
    useEffect(() => {
        if (isOpen && masterProducts.length > 0) {
            const initialItems: BulkAddProductItem[] = masterProducts.map(
                (mp) => {
                    // Attempt to auto-match category & unit by name if available
                    const matchedCategory = categories.find(
                        (c) =>
                            c.name.toLowerCase() ===
                            mp.category_name?.toLowerCase(),
                    );
                    const matchedUnit = units.find(
                        (u) =>
                            u.name.toLowerCase() ===
                            mp.unit_name?.toLowerCase(),
                    );

                    return {
                        master_product_id: mp.id,
                        name: mp.name,
                        barcode: mp.barcode ?? '',
                        category_id: matchedCategory
                            ? matchedCategory.id
                            : null,
                        unit_id: matchedUnit ? matchedUnit.id : null,
                        stock: '',
                        cost_price:
                            mp.cost_price != null && Number(mp.cost_price) !== 0
                                ? Number(mp.cost_price)
                                : null,
                        price:
                            mp.price != null && Number(mp.price) !== 0
                                ? Number(mp.price)
                                : null,
                        is_active: true,
                        is_unlimited: false,
                        desc: mp.desc ?? '',
                        isAdded: Boolean(mp.isAdded),
                    };
                },
            );

            // eslint-disable-next-line react-hooks/set-state-in-effect
            setItems(initialItems);
            setErrors({});
            setBatchCategory('');
            setBatchUnit('');
            setBatchStock('');
            setCurrentPage(1);
        }
    }, [isOpen, masterProducts, categories, units]);

    const handleItemChange = (
        index: number,
        field: keyof BulkAddProductItem,
        value: any,
    ) => {
        setItems((prev) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };

            return updated;
        });

        if (errors[index]?.[field as keyof BulkAddProductError]) {
            setErrors((prev) => ({
                ...prev,
                [index]: {
                    ...prev[index],
                    [field]: undefined,
                },
            }));
        }
    };

    const handleRemoveItem = (index: number) => {
        setItems((prev) => {
            const updated = prev.filter((_, i) => i !== index);
            const newTotalPages =
                Math.ceil(updated.length / ITEMS_PER_PAGE) || 1;

            if (currentPage > newTotalPages) {
                setCurrentPage(newTotalPages);
            }

            return updated;
        });
        setErrors((prev) => {
            const newErrors: Record<number, BulkAddProductError> = {};
            Object.keys(prev).forEach((key) => {
                const k = Number(key);

                if (k < index) {
                    newErrors[k] = prev[k];
                } else if (k > index) {
                    newErrors[k - 1] = prev[k];
                }
            });

            return newErrors;
        });
    };

    const applyBatchCategory = () => {
        if (!batchCategory) {
            return;
        }

        const catId = Number(batchCategory);
        setItems((prev) =>
            prev.map((item) =>
                item.isAdded ? item : { ...item, category_id: catId },
            ),
        );
    };

    const applyBatchUnit = () => {
        if (!batchUnit) {
            return;
        }

        const unitId = Number(batchUnit);
        setItems((prev) =>
            prev.map((item) =>
                item.isAdded ? item : { ...item, unit_id: unitId },
            ),
        );
    };

    const applyBatchStock = () => {
        if (batchStock === '') {
            return;
        }

        const stockVal = Number(batchStock);
        setItems((prev) =>
            prev.map((item) =>
                item.isAdded ? item : { ...item, stock: stockVal },
            ),
        );
    };

    const validate = (): boolean => {
        const newErrors: Record<number, BulkAddProductError> = {};
        let isValid = true;

        items.forEach((item, index) => {
            if (item.isAdded) {
                return;
            }

            const itemErrors: BulkAddProductError = {};

            if (!item.category_id) {
                itemErrors.category_id = t(
                    'validation.required',
                    'Kategori wajib diisi',
                );
                isValid = false;
            }

            if (!item.unit_id) {
                itemErrors.unit_id = t(
                    'validation.required',
                    'Satuan wajib diisi',
                );
                isValid = false;
            }

            if (
                item.cost_price === null ||
                item.cost_price === undefined ||
                item.cost_price < 0
            ) {
                itemErrors.cost_price = t(
                    'validation.required',
                    'Harga modal wajib diisi',
                );
                isValid = false;
            }

            if (
                item.price === null ||
                item.price === undefined ||
                item.price < 0
            ) {
                itemErrors.price = t(
                    'validation.required',
                    'Harga jual wajib diisi',
                );
                isValid = false;
            }

            if (
                item.cost_price !== null &&
                item.price !== null &&
                item.cost_price > item.price
            ) {
                itemErrors.cost_price = t(
                    'message.error.cost_price_greater_than_price_validation',
                    'Harga modal tidak boleh lebih besar dari harga jual',
                );
                isValid = false;
            }

            if (Object.keys(itemErrors).length > 0) {
                newErrors[index] = itemErrors;
            }
        });

        setErrors(newErrors);

        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validItems = items.filter((item) => !item.isAdded);

        if (validItems.length === 0) {
            showWarningToast(
                t(
                    'page.master_product.dialog_modal.bulk_add_products_dialog.no_valid_items',
                    'Tidak ada produk yang dapat ditambahkan (semua sudah pernah ditambahkan).',
                ),
            );

            return;
        }

        if (!validate()) {
            const firstErrorIndex = items.findIndex((item) => {
                if (item.isAdded) {
                    return false;
                }

                return (
                    !item.category_id ||
                    !item.unit_id ||
                    item.cost_price === null ||
                    item.cost_price === undefined ||
                    item.cost_price < 0 ||
                    item.price === null ||
                    item.price === undefined ||
                    item.price < 0 ||
                    (item.cost_price !== null &&
                        item.price !== null &&
                        item.cost_price > item.price)
                );
            });

            if (firstErrorIndex !== -1) {
                const errorPage =
                    Math.floor(firstErrorIndex / ITEMS_PER_PAGE) + 1;
                setCurrentPage(errorPage);
            }

            showWarningToast(
                t(
                    'page.master_product.dialog_modal.bulk_add_products_dialog.validation_error',
                    'Mohon periksa dan lengkapi data produk yang belum valid.',
                ),
            );

            return;
        }

        try {
            setLoading(true);

            const formData = new FormData();
            validItems.forEach((item, index) => {
                if (item.category_id !== null) {
                    formData.append(
                        `products[${index}][category_id]`,
                        item.category_id.toString(),
                    );
                }

                if (item.unit_id !== null) {
                    formData.append(
                        `products[${index}][unit_id]`,
                        item.unit_id.toString(),
                    );
                }

                formData.append(`products[${index}][name]`, item.name);

                if (item.barcode) {
                    formData.append(
                        `products[${index}][barcode]`,
                        item.barcode,
                    );
                }

                const stockVal =
                    item.stock !== '' &&
                    item.stock !== null &&
                    !isNaN(Number(item.stock))
                        ? Number(item.stock)
                        : 0;
                formData.append(
                    `products[${index}][stock]`,
                    stockVal.toString(),
                );

                if (item.cost_price !== null) {
                    formData.append(
                        `products[${index}][cost_price]`,
                        item.cost_price.toString(),
                    );
                }

                if (item.price !== null) {
                    formData.append(
                        `products[${index}][price]`,
                        item.price.toString(),
                    );
                }

                formData.append(
                    `products[${index}][is_active]`,
                    item.is_active ? '1' : '0',
                );
                formData.append(
                    `products[${index}][is_unlimited]`,
                    item.is_unlimited ? '1' : '0',
                );

                if (item.desc) {
                    formData.append(`products[${index}][desc]`, item.desc);
                }
            });

            const res = await axiosInstance.post<ResponseApi<number>>(
                bulkStore().url,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                },
            );

            if (!res.data.success) {
                showWarningToast(res.data.message);

                return;
            }

            showSuccessToast(res.data.message);
            setOpen(false);
            onSuccess();
        } catch (error) {
            console.error('Error bulk creating products:', error);
            handleApiError(error);
        } finally {
            setLoading(false);
        }
    };

    const pendingCount = items.filter((item) => !item.isAdded).length;
    const alreadyAddedCount = items.filter((item) => item.isAdded).length;

    const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE) || 1;
    const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);

    const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, items.length);
    const paginatedItems = useMemo(
        () => items.slice(startIndex, endIndex),
        [items, startIndex, endIndex],
    );

    return (
        <Dialog open={isOpen} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    disabled={isDisabled}
                    variant="outline"
                    className="shrink-0"
                    onClick={() => onBulkAddClick?.()}
                >
                    <PlusCircle className="mr-1 h-4 w-4 shrink-0" />
                    <span>
                        {sprintf(
                            t(
                                'page.master_product.dialog_modal.bulk_add_products_dialog.dialog_button',
                                'Tambah Produk (%d)',
                            ),
                            selectedLength,
                        )}
                    </span>
                </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[92vh] w-[calc(100%-1rem)] overflow-y-auto rounded-xl p-4 sm:max-h-[90vh] sm:w-full sm:max-w-6xl sm:p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-lg leading-tight font-bold sm:text-xl">
                            <PlusCircle className="h-5 w-5 shrink-0 text-primary" />
                            <span>
                                {sprintf(
                                    t(
                                        'page.master_product.dialog_modal.bulk_add_products_dialog.dialog_title',
                                        'Tambah %d Produk Sekaligus',
                                    ),
                                    items.length,
                                )}
                            </span>
                        </DialogTitle>
                        <DialogDescription className="text-xs sm:text-sm">
                            {t(
                                'page.master_product.dialog_modal.bulk_add_products_dialog.dialog_desc',
                                'Konfirmasi dan kustomisasi detail produk master yang dipilih sebelum ditambahkan ke toko.',
                            )}
                        </DialogDescription>
                    </DialogHeader>

                    {alreadyAddedCount > 0 && (
                        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 sm:text-sm dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            <span>
                                {sprintf(
                                    t(
                                        'page.master_product.dialog_modal.bulk_add_products_dialog.already_added_warning',
                                        '%d dari %d master produk terpilih sudah pernah ditambahkan dan akan dilewati.',
                                    ),
                                    alreadyAddedCount,
                                    items.length,
                                )}
                            </span>
                        </div>
                    )}

                    {/* Quick Fill / Batch Settings */}
                    {pendingCount > 0 && (
                        <div className="space-y-3 rounded-xl border bg-muted/50 p-3 sm:p-4">
                            <div className="flex items-center gap-2 border-b border-border/60 pb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                <Layers className="h-4 w-4 shrink-0 text-primary" />
                                <span>
                                    {t(
                                        'page.master_product.dialog_modal.bulk_add_products_dialog.batch_apply_title',
                                        'Atur Sekaligus (Batch Apply)',
                                    )}
                                </span>
                            </div>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-medium text-muted-foreground">
                                        Kategori Massal
                                    </label>
                                    <div className="flex gap-2">
                                        <div className="min-w-0 flex-1">
                                            <SearchableSelect
                                                options={categoryOptions}
                                                value={batchCategory}
                                                onValueChange={setBatchCategory}
                                                placeholder={t(
                                                    'page.master_product.dialog_modal.bulk_add_products_dialog.batch_category_placeholder',
                                                    'Pilih Kategori Semua',
                                                )}
                                                searchPlaceholder="Cari kategori..."
                                                emptyMessage="Kategori tidak ditemukan."
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            size="sm"
                                            className="shrink-0"
                                            onClick={applyBatchCategory}
                                            disabled={!batchCategory}
                                        >
                                            {t(
                                                'component.button.apply',
                                                'Terapkan',
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-xs font-medium text-muted-foreground">
                                        Satuan Massal
                                    </label>
                                    <div className="flex gap-2">
                                        <div className="min-w-0 flex-1">
                                            <SearchableSelect
                                                options={unitOptions}
                                                value={batchUnit}
                                                onValueChange={setBatchUnit}
                                                placeholder={t(
                                                    'page.master_product.dialog_modal.bulk_add_products_dialog.batch_unit_placeholder',
                                                    'Pilih Satuan Semua',
                                                )}
                                                searchPlaceholder="Cari satuan..."
                                                emptyMessage="Satuan tidak ditemukan."
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            size="sm"
                                            className="shrink-0"
                                            onClick={applyBatchUnit}
                                            disabled={!batchUnit}
                                        >
                                            {t(
                                                'component.button.apply',
                                                'Terapkan',
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
                                    <label className="block text-xs font-medium text-muted-foreground">
                                        Stok Massal
                                    </label>
                                    <div className="flex gap-2">
                                        <Input
                                            type="number"
                                            min="0"
                                            placeholder={t(
                                                'page.master_product.dialog_modal.bulk_add_products_dialog.batch_stock_placeholder',
                                                'Stok Semua',
                                            )}
                                            value={batchStock}
                                            onChange={(e) =>
                                                setBatchStock(e.target.value)
                                            }
                                            className="min-w-0 flex-1"
                                        />
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            size="sm"
                                            className="shrink-0"
                                            onClick={applyBatchStock}
                                            disabled={batchStock === ''}
                                        >
                                            {t(
                                                'component.button.apply',
                                                'Terapkan',
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* List of items to create */}
                    <div className="max-h-[50vh] space-y-3 overflow-y-auto pr-1">
                        {paginatedItems.map((item, pageRelativeIndex) => {
                            const originalIndex =
                                startIndex + pageRelativeIndex;
                            const itemError = errors[originalIndex] || {};

                            if (item.isAdded) {
                                return (
                                    <div
                                        key={item.master_product_id}
                                        className="flex flex-wrap items-center justify-between gap-2 rounded-xl border bg-muted/30 p-3 text-xs opacity-60 sm:text-sm"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <span className="font-medium">
                                                {item.name}
                                            </span>
                                            {item.barcode && (
                                                <span className="ml-2 font-mono text-xs text-muted-foreground">
                                                    ({item.barcode})
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex shrink-0 items-center gap-2">
                                            <span className="flex items-center gap-1 rounded bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                                <Check className="h-3 w-3" />
                                                {t(
                                                    'page.master_product.is_added.added',
                                                    'Ditambahkan',
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <div
                                    key={item.master_product_id}
                                    className="space-y-3 rounded-xl border bg-card p-3.5 shadow-2xs transition-colors hover:border-primary/40 sm:p-4"
                                >
                                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-2.5">
                                        <div className="flex min-w-0 flex-1 items-center gap-2">
                                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                                                {originalIndex + 1}
                                            </span>
                                            <h4
                                                className="truncate text-xs font-medium sm:text-sm"
                                                title={item.name}
                                            >
                                                {item.name}
                                            </h4>
                                            {item.barcode && (
                                                <span className="shrink-0 rounded bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">
                                                    {item.barcode}
                                                </span>
                                            )}
                                        </div>
                                        {items.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                                                onClick={() =>
                                                    handleRemoveItem(
                                                        originalIndex,
                                                    )
                                                }
                                                title={t(
                                                    'component.button.remove',
                                                    'Hapus dari daftar',
                                                )}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                                        {/* Category Select */}
                                        <div>
                                            <label className="mb-1 block text-xs font-medium">
                                                {t(
                                                    'page.master_product.dialog_modal.add_products_dialog.category_label',
                                                    'Kategori',
                                                )}
                                                <span className="text-red-500">
                                                    {' '}
                                                    *
                                                </span>
                                            </label>
                                            <SearchableSelect
                                                options={categoryOptions}
                                                value={
                                                    item.category_id?.toString() ??
                                                    ''
                                                }
                                                onValueChange={(val) =>
                                                    handleItemChange(
                                                        originalIndex,
                                                        'category_id',
                                                        val
                                                            ? Number(val)
                                                            : null,
                                                    )
                                                }
                                                placeholder={t(
                                                    'page.master_product.dialog_modal.add_products_dialog.category_placeholder',
                                                    'Pilih kategori',
                                                )}
                                                searchPlaceholder="Cari..."
                                                emptyMessage="Tidak ada"
                                                className={
                                                    itemError.category_id
                                                        ? 'border-red-500'
                                                        : ''
                                                }
                                            />
                                            {itemError.category_id && (
                                                <ErrorFormInfo
                                                    message={
                                                        itemError.category_id
                                                    }
                                                />
                                            )}
                                        </div>

                                        {/* Unit Select */}
                                        <div>
                                            <label className="mb-1 block text-xs font-medium">
                                                {t(
                                                    'page.master_product.dialog_modal.add_products_dialog.unit_label',
                                                    'Satuan',
                                                )}
                                                <span className="text-red-500">
                                                    {' '}
                                                    *
                                                </span>
                                            </label>
                                            <SearchableSelect
                                                options={unitOptions}
                                                value={
                                                    item.unit_id?.toString() ??
                                                    ''
                                                }
                                                onValueChange={(val) =>
                                                    handleItemChange(
                                                        originalIndex,
                                                        'unit_id',
                                                        val
                                                            ? Number(val)
                                                            : null,
                                                    )
                                                }
                                                placeholder={t(
                                                    'page.master_product.dialog_modal.add_products_dialog.unit_placeholder',
                                                    'Pilih satuan',
                                                )}
                                                searchPlaceholder="Cari..."
                                                emptyMessage="Tidak ada"
                                                className={
                                                    itemError.unit_id
                                                        ? 'border-red-500'
                                                        : ''
                                                }
                                            />
                                            {itemError.unit_id && (
                                                <ErrorFormInfo
                                                    message={itemError.unit_id}
                                                />
                                            )}
                                        </div>

                                        {/* Stock Input */}
                                        <div>
                                            <label className="mb-1 block text-xs font-medium">
                                                {t(
                                                    'page.master_product.dialog_modal.add_products_dialog.stock_label',
                                                    'Stok',
                                                )}
                                                <span className="text-red-500">
                                                    {' '}
                                                    *
                                                </span>
                                            </label>
                                            <Input
                                                type="number"
                                                min="0"
                                                placeholder="0"
                                                value={item.stock ?? ''}
                                                onChange={(e) =>
                                                    handleItemChange(
                                                        originalIndex,
                                                        'stock',
                                                        e.target.value,
                                                    )
                                                }
                                                className={
                                                    itemError.stock
                                                        ? 'border-red-500'
                                                        : ''
                                                }
                                            />
                                            {itemError.stock && (
                                                <ErrorFormInfo
                                                    message={itemError.stock}
                                                />
                                            )}
                                        </div>

                                        {/* Cost Price */}
                                        <div>
                                            <label className="mb-1 block text-xs font-medium">
                                                {t(
                                                    'page.master_product.dialog_modal.add_products_dialog.cost_price_label',
                                                    'Harga Modal',
                                                )}
                                                <span className="text-red-500">
                                                    {' '}
                                                    *
                                                </span>
                                            </label>
                                            <NumericFormat
                                                customInput={Input}
                                                thousandSeparator="."
                                                decimalSeparator=","
                                                prefix="Rp "
                                                placeholder="Rp 0"
                                                value={item.cost_price ?? ''}
                                                onFocus={(e) =>
                                                    e.target.select()
                                                }
                                                onValueChange={(values) =>
                                                    handleItemChange(
                                                        originalIndex,
                                                        'cost_price',
                                                        values.floatValue ??
                                                            null,
                                                    )
                                                }
                                                className={
                                                    itemError.cost_price
                                                        ? 'border-red-500'
                                                        : ''
                                                }
                                            />
                                            {itemError.cost_price && (
                                                <ErrorFormInfo
                                                    message={
                                                        itemError.cost_price
                                                    }
                                                />
                                            )}
                                        </div>

                                        {/* Selling Price */}
                                        <div>
                                            <label className="mb-1 block text-xs font-medium">
                                                {t(
                                                    'page.master_product.dialog_modal.add_products_dialog.price_label',
                                                    'Harga Jual',
                                                )}
                                                <span className="text-red-500">
                                                    {' '}
                                                    *
                                                </span>
                                            </label>
                                            <NumericFormat
                                                customInput={Input}
                                                thousandSeparator="."
                                                decimalSeparator=","
                                                prefix="Rp "
                                                placeholder="Rp 0"
                                                value={item.price ?? ''}
                                                onFocus={(e) =>
                                                    e.target.select()
                                                }
                                                onValueChange={(values) =>
                                                    handleItemChange(
                                                        originalIndex,
                                                        'price',
                                                        values.floatValue ??
                                                            null,
                                                    )
                                                }
                                                className={
                                                    itemError.price
                                                        ? 'border-red-500'
                                                        : ''
                                                }
                                            />
                                            {itemError.price && (
                                                <ErrorFormInfo
                                                    message={itemError.price}
                                                />
                                            )}
                                        </div>

                                        {/* Switches */}
                                        <div className="col-span-1 flex flex-wrap items-center gap-4 pt-1 sm:col-span-2 sm:pt-3 md:col-span-3 lg:col-span-5">
                                            <div className="flex items-center gap-2">
                                                <Switch
                                                    id={`active-${originalIndex}`}
                                                    checked={item.is_active}
                                                    onCheckedChange={(
                                                        checked,
                                                    ) =>
                                                        handleItemChange(
                                                            originalIndex,
                                                            'is_active',
                                                            checked,
                                                        )
                                                    }
                                                />
                                                <label
                                                    htmlFor={`active-${originalIndex}`}
                                                    className="cursor-pointer text-xs font-medium"
                                                >
                                                    {t(
                                                        'page.master_product.dialog_modal.add_products_dialog.is_active_label',
                                                        'Aktif',
                                                    )}
                                                </label>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Switch
                                                    id={`unlimited-${originalIndex}`}
                                                    checked={item.is_unlimited}
                                                    onCheckedChange={(
                                                        checked,
                                                    ) =>
                                                        handleItemChange(
                                                            originalIndex,
                                                            'is_unlimited',
                                                            checked,
                                                        )
                                                    }
                                                />
                                                <label
                                                    htmlFor={`unlimited-${originalIndex}`}
                                                    className="cursor-pointer text-xs font-medium"
                                                >
                                                    {t(
                                                        'page.master_product.dialog_modal.add_products_dialog.is_unlimited_label',
                                                        'Stok Unlimited',
                                                    )}
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Pagination Controls */}
                    {items.length > 0 && (
                        <div className="flex flex-col items-center justify-between gap-2 border-t border-border/40 px-1 pt-2 text-xs text-muted-foreground sm:flex-row">
                            <div>
                                {sprintf(
                                    t(
                                        'component.data_table.pagination_info',
                                        'Menampilkan %d - %d dari %d produk',
                                    ),
                                    startIndex + 1,
                                    endIndex,
                                    items.length,
                                )}
                            </div>
                            {totalPages > 1 && (
                                <div className="flex items-center gap-1">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => setCurrentPage(1)}
                                        disabled={safeCurrentPage === 1}
                                        title="Halaman pertama"
                                    >
                                        <ChevronsLeft className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() =>
                                            setCurrentPage((prev) =>
                                                Math.max(prev - 1, 1),
                                            )
                                        }
                                        disabled={safeCurrentPage === 1}
                                        title="Halaman sebelumnya"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <span className="px-2 font-medium text-foreground">
                                        {sprintf(
                                            t(
                                                'component.data_table.page_indicator',
                                                'Halaman %d dari %d',
                                            ),
                                            safeCurrentPage,
                                            totalPages,
                                        )}
                                    </span>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() =>
                                            setCurrentPage((prev) =>
                                                Math.min(prev + 1, totalPages),
                                            )
                                        }
                                        disabled={
                                            safeCurrentPage === totalPages
                                        }
                                        title="Halaman berikutnya"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() =>
                                            setCurrentPage(totalPages)
                                        }
                                        disabled={
                                            safeCurrentPage === totalPages
                                        }
                                        title="Halaman terakhir"
                                    >
                                        <ChevronsRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full sm:w-auto"
                            onClick={() => setOpen(false)}
                            disabled={loading}
                        >
                            {t('component.dialog.cancel_button', 'Batal')}
                        </Button>
                        <Button
                            type="submit"
                            className="w-full sm:w-auto"
                            disabled={loading || pendingCount === 0}
                        >
                            {loading && <Spinner />}
                            {sprintf(
                                t(
                                    'page.master_product.dialog_modal.bulk_add_products_dialog.confirm_button',
                                    'Simpan %d Produk',
                                ),
                                pendingCount,
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
