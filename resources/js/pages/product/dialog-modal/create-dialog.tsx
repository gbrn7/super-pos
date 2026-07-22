import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Field, FieldGroup } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { store as storeProduct } from '@/routes/apiProducts';
import {
    type ProductForm,
    type ProductErrorForm,
    ProductSchema,
} from '@/support/interfaces/request/product';
import { useTranslation } from 'react-i18next';
import { Spinner } from '@/components/ui/spinner';
import axiosInstance from '@/lib/axios';
import { ResponseApi } from '@/support/interfaces/response/Response';
import { Product } from '@/support/models/product';
import { MasterProduct } from '@/support/models/masterProduct';
import {
    handleApiError,
    showSuccessToast,
    showWarningToast,
} from '@/lib/utils';
import { PlusCircle, Search } from 'lucide-react';
import ErrorFormInfo from '@/components/errorFormInfo';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Unit } from '@/support/models/unit';
import { Category } from '@/support/models/category';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { NumericFormat } from 'react-number-format';

interface CreateDialogProps {
    onSuccess: () => void;
    units: Unit[];
    categories: Category[];
}

export function CreateDialog({
    onSuccess,
    units,
    categories,
}: CreateDialogProps) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [searchingBarcode, setSearchingBarcode] = useState<boolean>(false);
    const [imagePreview, setImagePreview] = useState<string>('');

    const defaultFormData: ProductForm = {
        category_id: null,
        unit_id: null,
        name: '',
        is_active: true,
        is_unlimited: false,
        stock: null,
        price: null,
        cost_price: null,
        image: null,
        desc: '',
        barcode: '',
    };

    const defaultErrorForm: ProductErrorForm = {
        category_id: '',
        unit_id: '',
        name: '',
        is_active: '',
        is_unlimited: '',
        stock: '',
        price: '',
        cost_price: '',
        image: '',
        desc: '',
        barcode: '',
    };
    const [formData, setFormData] = useState<ProductForm>(defaultFormData);

    const [errorForm, setErrorForm] =
        useState<ProductErrorForm>(defaultErrorForm);

    const categoryOptions = useMemo(
        () =>
            categories.map((item) => ({
                label: item.name,
                value: item.id.toString(),
            })),
        [categories],
    );

    const unitOptions = useMemo(
        () =>
            units.map((item) => ({
                label: item.name,
                value: item.id.toString(),
            })),
        [units],
    );

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        setErrorForm({
            ...errorForm,
            [name]: '',
        });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            setFormData((prev) => ({
                ...prev,
                image: file,
            }));
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSearchBarcode = async () => {
        const searchBarcode = formData.barcode?.trim();
        if (!searchBarcode) {
            showWarningToast(
                t(
                    'page.product.dialog_modal.create_dialog.barcode_empty_warning',
                    'Silakan masukkan barcode terlebih dahulu.',
                ),
            );
            return;
        }

        try {
            setSearchingBarcode(true);
            const res = await axiosInstance.get<ResponseApi<MasterProduct>>(
                `/api/master-product/barcode/${encodeURIComponent(searchBarcode)}`,
            );

            if (res.data.success && res.data.data) {
                const masterData = res.data.data;
                const matchedCategory = categories.find(
                    (c) =>
                        c.name.trim().toLowerCase() ===
                        masterData.category_name?.trim().toLowerCase(),
                );
                const matchedUnit = units.find(
                    (u) =>
                        u.name.trim().toLowerCase() ===
                        masterData.unit_name?.trim().toLowerCase(),
                );

                const costPriceVal = Number(masterData.cost_price);
                const priceVal = Number(masterData.price);

                const parsedCostPrice =
                    !isNaN(costPriceVal) && costPriceVal > 0
                        ? costPriceVal
                        : null;
                const parsedPrice =
                    !isNaN(priceVal) && priceVal > 0 ? priceVal : null;

                setFormData((prev) => ({
                    ...prev,
                    name: masterData.name || prev.name,
                    barcode: masterData.barcode || prev.barcode,
                    category_id: matchedCategory
                        ? matchedCategory.id
                        : prev.category_id,
                    unit_id: matchedUnit ? matchedUnit.id : prev.unit_id,
                    cost_price: parsedCostPrice,
                    price: parsedPrice,
                    desc: masterData.desc || prev.desc,
                }));

                setErrorForm(defaultErrorForm);

                showSuccessToast(
                    t(
                        'page.product.dialog_modal.create_dialog.master_product_found',
                        'Data master produk ditemukan dan berhasil terisi otomatis.',
                    ),
                );
            } else {
                showWarningToast(
                    res.data.message ||
                        t(
                            'page.product.dialog_modal.create_dialog.master_product_not_found',
                            'Data master produk tidak ditemukan.',
                        ),
                );
            }
        } catch (error) {
            console.error('Error searching barcode:', error);
            showWarningToast(
                t(
                    'page.product.dialog_modal.create_dialog.master_product_not_found',
                    'Data master produk tidak ditemukan.',
                ),
            );
        } finally {
            setSearchingBarcode(false);
        }
    };

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();

        const resultValidation = ProductSchema.safeParse(formData);

        if (!resultValidation.success) {
            const fieldErrors: ProductErrorForm = defaultErrorForm;

            resultValidation.error.issues.forEach((error) => {
                const fieldName = error.path[0] as keyof ProductForm;

                fieldErrors[fieldName] = error.message;
            });

            setErrorForm(fieldErrors);

            return;
        }

        try {
            setLoading(true);

            const res = await axiosInstance.post<ResponseApi<Product>>(
                storeProduct().url,
                {
                    category_id: formData.category_id,
                    unit_id: formData.unit_id,
                    name: formData.name,
                    is_active: formData.is_active ? '1' : '0',
                    is_unlimited: formData.is_unlimited ? '1' : '0',
                    stock: formData.stock,
                    price: formData.price,
                    cost_price: formData.cost_price,
                    image: formData.image,
                    desc: formData.desc,
                    barcode: formData.barcode,
                },
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
            setFormData(defaultFormData);
            setImagePreview('');
            setOpen(false);
            onSuccess();
        } catch (error) {
            console.error('Error creating product:', error);
            handleApiError(error);
        } finally {
            setLoading(false);
            setErrorForm(defaultErrorForm);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <PlusCircle className="h-4" />
                    {t(
                        'page.product.dialog_modal.create_dialog.dialog_button',
                        'Tambah Produk',
                    )}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] max-w-250! overflow-y-auto">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <DialogHeader>
                        <DialogTitle>
                            {t(
                                'page.product.dialog_modal.create_dialog.dialog_title',
                                'Tambah Produk',
                            )}
                        </DialogTitle>
                        <DialogDescription>
                            {t(
                                'page.product.dialog_modal.create_dialog.dialog_desc',
                                'Tambahkan produk baru anda',
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <FieldGroup className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <Field className="md:col-span-2">
                            <label htmlFor="barcode" className="text-sm">
                                {t(
                                    'page.product.dialog_modal.create_dialog.barcode_input_label',
                                    'Barcode',
                                )}
                            </label>
                            <div className="flex gap-2">
                                <Input
                                    id="barcode"
                                    name="barcode"
                                    placeholder={t(
                                        'page.product.dialog_modal.create_dialog.barcode_input_placeholder',
                                        'Masukkan barcode produk (Opsional)',
                                    )}
                                    value={formData.barcode}
                                    onChange={handleChange}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleSearchBarcode();
                                        }
                                    }}
                                    disabled={loading || searchingBarcode}
                                    className={`${errorForm.barcode && 'border-red-500'}`}
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleSearchBarcode}
                                    disabled={
                                        loading ||
                                        searchingBarcode ||
                                        !formData.barcode?.trim()
                                    }
                                    title={t(
                                        'page.product.dialog_modal.create_dialog.search_barcode_button',
                                        'Cari Master Product',
                                    )}
                                >
                                    {searchingBarcode ? (
                                        <Spinner className="h-4 w-4" />
                                    ) : (
                                        <Search className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                            {errorForm.barcode && (
                                <ErrorFormInfo message={errorForm.barcode} />
                            )}
                        </Field>
                        <Field>
                            <label htmlFor="name" className="text-sm">
                                {t(
                                    'page.product.dialog_modal.create_dialog.name_input_label',
                                    'Nama',
                                )}
                                <span className="text-red-500"> *</span>
                            </label>
                            <Input
                                id="name"
                                name="name"
                                placeholder={t(
                                    'page.product.dialog_modal.create_dialog.name_input_placeholder',
                                    'Masukkan nama produk',
                                )}
                                value={formData.name}
                                onChange={handleChange}
                                disabled={loading}
                                className={`${errorForm.name && 'border-red-500'}`}
                            />
                            {errorForm.name && (
                                <ErrorFormInfo message={errorForm.name} />
                            )}
                        </Field>
                        <Field>
                            <label htmlFor="unit_id" className="text-sm">
                                {t(
                                    'page.product.dialog_modal.create_dialog.unit_id_input_label',
                                    'Satuan',
                                )}
                                <span className="text-red-500"> *</span>
                            </label>
                            <SearchableSelect
                                options={unitOptions}
                                value={formData.unit_id?.toString() || ''}
                                onValueChange={(value) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        unit_id: value ? Number(value) : null,
                                    }))
                                }
                                placeholder={t(
                                    'page.product.dialog_modal.create_dialog.unit_id_input_placeholder',
                                    'Pilih satuan produk',
                                )}
                                searchPlaceholder={t(
                                    'page.product.dialog_modal.create_dialog.search_unit_placeholder',
                                    'Cari satuan...',
                                )}
                                emptyMessage={t(
                                    'page.product.dialog_modal.create_dialog.no_unit_found',
                                    'Satuan tidak ditemukan.',
                                )}
                                disabled={loading}
                                className={`${errorForm.unit_id && 'border-red-500'}`}
                            />
                            {errorForm.unit_id && (
                                <ErrorFormInfo message={errorForm.unit_id} />
                            )}
                        </Field>
                        <Field>
                            <label htmlFor="stock" className="text-sm">
                                {t(
                                    'page.product.dialog_modal.create_dialog.stock_input_label',
                                    'Stok',
                                )}
                                <span className="text-red-500"> *</span>
                            </label>
                            <NumericFormat
                                id="stock"
                                name="stock"
                                customInput={Input}
                                placeholder={t(
                                    'page.product.dialog_modal.create_dialog.stock_input_placeholder',
                                    'Masukkan stok produk',
                                )}
                                value={formData.stock}
                                disabled={loading}
                                onValueChange={(values) => {
                                    setFormData((prev) => ({
                                        ...prev,
                                        stock: values.floatValue ?? 0,
                                    }));
                                }}
                                className={`${errorForm.stock && 'border-red-500'}`}
                            />
                            {errorForm.stock && (
                                <ErrorFormInfo message={errorForm.stock} />
                            )}
                        </Field>
                        <Field>
                            <label htmlFor="category_id" className="text-sm">
                                {t(
                                    'page.product.dialog_modal.create_dialog.category_id_input_label',
                                    'Kategori',
                                )}
                                <span className="text-red-500"> *</span>
                            </label>
                            <SearchableSelect
                                options={categoryOptions}
                                value={formData.category_id?.toString() || ''}
                                onValueChange={(value) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        category_id: value
                                            ? Number(value)
                                            : null,
                                    }))
                                }
                                placeholder={t(
                                    'page.product.dialog_modal.create_dialog.category_id_input_placeholder',
                                    'Pilih kategori Produk',
                                )}
                                searchPlaceholder={t(
                                    'page.product.dialog_modal.create_dialog.search_category_placeholder',
                                    'Cari kategori...',
                                )}
                                emptyMessage={t(
                                    'page.product.dialog_modal.create_dialog.no_category_found',
                                    'Kategori tidak ditemukan.',
                                )}
                                disabled={loading}
                                className={`${errorForm.category_id && 'border-red-500'}`}
                            />
                            {errorForm.category_id && (
                                <ErrorFormInfo
                                    message={errorForm.category_id}
                                />
                            )}
                        </Field>
                        <Field>
                            <label htmlFor="cost_price" className="text-sm">
                                {t(
                                    'page.product.dialog_modal.create_dialog.cost_price_input_label',
                                    'Harga Modal',
                                )}
                                <span className="text-red-500"> *</span>
                            </label>
                            <NumericFormat
                                id="cost_price"
                                name="cost_price"
                                customInput={Input}
                                thousandSeparator="."
                                decimalSeparator=","
                                prefix="Rp "
                                placeholder={t(
                                    'page.product.dialog_modal.create_dialog.cost_price_input_placeholder',
                                    'Masukkan harga modal produk',
                                )}
                                value={formData.cost_price ?? ''}
                                onFocus={(e) => e.target.select()}
                                disabled={loading}
                                onValueChange={(values) => {
                                    setFormData((prev) => ({
                                        ...prev,
                                        cost_price: values.floatValue ?? null,
                                    }));
                                    setErrorForm((prev) => ({
                                        ...prev,
                                        cost_price: '',
                                    }));
                                }}
                                className={`${errorForm.cost_price && 'border-red-500'}`}
                            />
                            {errorForm.cost_price && (
                                <ErrorFormInfo message={errorForm.cost_price} />
                            )}
                        </Field>
                        <Field>
                            <label htmlFor="price" className="text-sm">
                                {t(
                                    'page.product.dialog_modal.create_dialog.price_input_label',
                                    'Harga Jual',
                                )}
                                <span className="text-red-500"> *</span>
                            </label>
                            <NumericFormat
                                id="price"
                                name="price"
                                customInput={Input}
                                thousandSeparator="."
                                decimalSeparator=","
                                prefix="Rp "
                                placeholder={t(
                                    'page.product.dialog_modal.create_dialog.price_input_placeholder',
                                    'Masukkan harga jual produk',
                                )}
                                value={formData.price ?? ''}
                                onFocus={(e) => e.target.select()}
                                disabled={loading}
                                onValueChange={(values) => {
                                    setFormData((prev) => ({
                                        ...prev,
                                        price: values.floatValue ?? null,
                                    }));
                                    setErrorForm((prev) => ({
                                        ...prev,
                                        price: '',
                                    }));
                                }}
                                className={`${errorForm.price && 'border-red-500'}`}
                            />
                            {errorForm.price && (
                                <ErrorFormInfo message={errorForm.price} />
                            )}
                        </Field>
                        <Field>
                            <label htmlFor="is_active" className="text-sm">
                                {t(
                                    'page.product.dialog_modal.create_dialog.is_active_input_label',
                                    'Status',
                                )}
                                <span className="text-red-500"> *</span>
                            </label>
                            <Switch
                                checked={formData.is_active}
                                id="is_active_input_label"
                                name="is_active"
                                onCheckedChange={(value) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        is_active: value,
                                    }))
                                }
                                className={`${errorForm.is_active && 'border-red-500'}`}
                            />
                            {errorForm.is_active && (
                                <ErrorFormInfo message={errorForm.is_active} />
                            )}
                        </Field>
                        <Field>
                            <label htmlFor="is_unlimited" className="text-sm">
                                {t(
                                    'page.product.dialog_modal.create_dialog.is_unlimited_input_label',
                                    'Stok Tidak Terbatas',
                                )}
                                <span className="text-red-500"> *</span>
                            </label>
                            <Switch
                                checked={formData.is_unlimited}
                                id="is_unlimited_input_label"
                                name="is_unlimited"
                                onCheckedChange={(value) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        is_unlimited: value,
                                    }))
                                }
                                className={`${errorForm.is_unlimited && 'border-red-500'}`}
                            />
                            {errorForm.is_unlimited && (
                                <ErrorFormInfo
                                    message={errorForm.is_unlimited}
                                />
                            )}
                        </Field>
                        <Field>
                            <label htmlFor="image" className="text-sm">
                                {t(
                                    'page.product.dialog_modal.create_dialog.image_input_label',
                                    'Gambar',
                                )}
                            </label>
                            <Input
                                id="image"
                                name="image"
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                disabled={loading}
                                className={`${errorForm.image && 'border-red-500'}`}
                            />
                            {imagePreview && (
                                <div className="mt-2">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="h-32 w-32 rounded object-cover"
                                    />
                                </div>
                            )}
                            {errorForm.image && (
                                <ErrorFormInfo message={errorForm.image} />
                            )}
                        </Field>
                        <Field>
                            <label htmlFor="desc" className="text-sm">
                                {t(
                                    'page.product.dialog_modal.create_dialog.desc_input_label',
                                    'Deskripsi',
                                )}
                            </label>
                            <Textarea
                                id="desc"
                                name="desc"
                                placeholder={t(
                                    'page.product.dialog_modal.create_dialog.desc_input_placeholder',
                                    'Masukkan deskripsi produk (Opsional)',
                                )}
                                value={formData.desc}
                                onChange={handleChange}
                                disabled={loading}
                                rows={4}
                            />
                            {errorForm.desc && (
                                <ErrorFormInfo message={errorForm.desc} />
                            )}
                        </Field>
                    </FieldGroup>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button
                                variant="outline"
                                type="button"
                                onClick={() => setOpen(false)}
                                disabled={loading}
                            >
                                {t(
                                    'page.product.dialog_modal.create_dialog.cancel_button',
                                    'Batal',
                                )}
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={loading}>
                            {loading ? (
                                <Spinner />
                            ) : (
                                t(
                                    'page.product.dialog_modal.create_dialog.confirm_button',
                                    'Tambah',
                                )
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
