import axios from 'axios';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldGroup } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { update as updateProduct } from '@/routes/apiProducts';
import type { Product } from '@/support/models/product';
import { useTranslation } from 'react-i18next';
import { Spinner } from '@/components/ui/spinner';
import axiosInstance from '@/lib/axios';
import { ResponseApi } from '@/support/interfaces/response/Response';
import { handleApiError, showSuccessToast, showWarningToast } from '@/lib/utils';
import { ProductErrorForm, ProductForm } from '@/support/interfaces/request/product';
import z from 'zod';
import ErrorFormInfo from '@/components/errorFormInfo';
import { SelectLabel } from '@radix-ui/react-select';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Unit } from '@/support/models/unit';
import { Category } from '@/support/models/category';

interface EditDialogProps {
    isOpen: boolean;
    onSuccess: () => void;
    product: Product | null;
    setOpen: (open: boolean) => void;
    units: Unit[];
    categories: Category[];
}

export function EditDialog({
    isOpen,
    onSuccess,
    product,
    setOpen,
    units,
    categories
}: EditDialogProps) {
    const { t } = useTranslation();

    const [loading, setLoading] = useState<boolean>(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>(product?.image ?? '');


    const [formData, setFormData] = useState({
        category_id: product?.category_id ?? 0,
        unit_id: product?.unit_id ?? 0,
        name: product?.name ?? '',
        is_active: product?.is_active ?? true,
        stock: product?.stock ?? 0,
        price: product?.price ?? 0,
        cost_price: product?.cost_price ?? 0,
        image: product?.image ?? ''
    });

    const [errorForm, setErrorForm] = useState<ProductErrorForm>({
        category_id: '',
        unit_id: '',
        name: '',
        is_active: '',
        stock: '',
        price: '',
        cost_price: '',
        image: ''
    });

    const productSchema = z.object({
        category_id: z.number().min(1, t("validation.product.required.category_id", "Kategori tidak boleh kosong")),
        unit_id: z.number().min(1, t("validation.product.required.unit_id", "Satuan tidak boleh kosong")),
        name: z.string().trim().min(1, t("validation.product.required.name", "Nama tidak boleh kosong")),
        is_active: z.boolean(),
        stock: z.coerce.number().min(0),
        price: z.coerce.number().min(0, t("validation.product.required.price", "Harga tidak boleh kosong")),
        cost_price: z.coerce.number().min(0, t("validation.product.required.cost_price", "Harga modal tidak boleh kosong")),
        image: z.file().nullable(),
    });

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
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();

        const resultValidation = productSchema.safeParse(formData);

        if (!resultValidation.success) {
            const fieldErrors: ProductErrorForm = {
                category_id: '',
                unit_id: '',
                name: '',
                is_active: '',
                stock: '',
                price: '',
                cost_price: '',
                image: ''
            };

            resultValidation.error.issues.forEach((error) => {
                const fieldName = error.path[0] as keyof ProductForm;

                fieldErrors[fieldName] = error.message;
            });

            setErrorForm(fieldErrors);

            return;
        }


        try {
            setLoading(true);

            const submitData = new FormData();
            submitData.append('name', formData.name);
            if (imageFile) {
                submitData.append('image', imageFile);
            }

            const res = await axiosInstance.put<ResponseApi<Product>>(updateProduct(product?.id || '').url, submitData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (!res.data.success) {
                showWarningToast(res.data.message)
                return
            }

            showSuccessToast(res.data.message)
            onSuccess();
        } catch (error) {
            console.error('Error updating product:', error);
            handleApiError(error)
        } finally {
            setLoading(false);
            setOpen(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setOpen}>
            <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <DialogHeader>
                        <DialogTitle>{t("page.product.dialog_modal.edit_dialog.dialog_title", "Edit Produk")}</DialogTitle>
                        <DialogDescription>
                            {t("page.product.dialog_modal.edit_dialog.dialog_desc", "Edit data produk")}
                        </DialogDescription>
                    </DialogHeader>
                    <FieldGroup>
                        <Field>
                            <label htmlFor="name" className="text-sm">
                                {t("page.product.dialog_modal.create_dialog.name_input_label", "Nama")}
                                <span className="text-red-500"> *</span>
                            </label>
                            <Input
                                id="name"
                                name="name"
                                placeholder={t("page.product.dialog_modal.create_dialog.name_input_placeholder", "Masukkan nama produk")}
                                value={formData.name}
                                onChange={handleChange}
                                disabled={loading}
                            />
                            {errorForm.name && (
                                <ErrorFormInfo message={errorForm.name} />
                            )}
                        </Field>
                        <Field>
                            <label htmlFor="image" className="text-sm">
                                {t("page.product.dialog_modal.create_dialog.image_input_label", "Gambar")}
                            </label>
                            <Input
                                id="image"
                                name="image"
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                disabled={loading}
                            />
                            {imagePreview && (
                                <div className="mt-2">
                                    <img src={imagePreview} alt="Preview" className="h-32 w-32 object-cover rounded" />
                                </div>
                            )}
                            {errorForm.image && (
                                <ErrorFormInfo message={errorForm.image} />
                            )}
                        </Field>
                        <Field>
                            <label htmlFor="unit_id" className="text-sm">
                                {t("page.product.dialog_modal.create_dialog.unit_id_input_label", "Satuan")}
                                <span className="text-red-500"> *</span>
                            </label>
                            <Select
                                onValueChange={(value) => setFormData((prev) => ({ ...prev, unit_id: Number(value) }))}
                                disabled={loading}
                                value={formData.unit_id?.toString() || ''}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder={t("page.product.dialog_modal.create_dialog.unit_id_input_placeholder", "Pilih satuan user")} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel> {t("page.product.dialog_modal.create_dialog.unit_id_input_label", "Satuan")}</SelectLabel>
                                        {units.map((item) => (
                                            <SelectItem key={item.id} value={item.id.toString()}>{item.name}</SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            {errorForm.unit_id && (
                                <ErrorFormInfo message={errorForm.unit_id} />
                            )}
                        </Field>
                        <Field>
                            <label htmlFor="category_id" className="text-sm">
                                {t("page.product.dialog_modal.create_dialog.category_id_input_label", "Kategori")}
                                <span className="text-red-500"> *</span>
                            </label>
                            <Select
                                onValueChange={(value) => setFormData((prev) => ({ ...prev, category_id: Number(value) }))}
                                disabled={loading}
                                value={formData.category_id.toString()}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder={t("page.product.dialog_modal.create_dialog.category_id_input_placeholder", "Pilih kategori user")} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel> {t("page.product.dialog_modal.create_dialog.category_id_input_label", "Kategori")}</SelectLabel>
                                        {categories.map((item) => (
                                            <SelectItem key={item.id} value={item.id.toString()}>{item.name}</SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            {errorForm.category_id && (
                                <ErrorFormInfo message={errorForm.category_id} />
                            )}
                        </Field>
                        <Field>
                            <label htmlFor="stock" className="text-sm">
                                {t("page.product.dialog_modal.create_dialog.stock_input_label", "Stok")}
                                <span className="text-red-500"> *</span>
                            </label>
                            <Input
                                id="stock"
                                name="stock"
                                placeholder={t("page.product.dialog_modal.create_dialog.stock_input_placeholder", "Masukkan stok produk")}
                                type='number'
                                value={formData.stock}
                                onChange={handleChange}
                                disabled={loading}
                            />
                            {errorForm.stock && (
                                <ErrorFormInfo message={errorForm.stock} />
                            )}
                        </Field>
                        <Field>
                            <label htmlFor="cost_price" className="text-sm">
                                {t("page.product.dialog_modal.create_dialog.cost_price_input_label", "Harga Modal")}
                                <span className="text-red-500"> *</span>
                            </label>
                            <Input
                                id="cost_price"
                                name="cost_price"
                                placeholder={t("page.product.dialog_modal.create_dialog.cost_price_input_placeholder", "Masukkan harga modal produk")}
                                value={formData.cost_price}
                                onChange={handleChange}
                                disabled={loading}
                            />
                            {errorForm.cost_price && (
                                <ErrorFormInfo message={errorForm.cost_price} />
                            )}
                        </Field>
                        <Field>
                            <label htmlFor="price" className="text-sm">
                                {t("page.product.dialog_modal.create_dialog.price_input_label", "Harga Jual")}
                                <span className="text-red-500"> *</span>
                            </label>
                            <Input
                                id="price"
                                name="price"
                                placeholder={t("page.product.dialog_modal.create_dialog.price_input_placeholder", "Masukkan harga jual produk")}
                                value={formData.price}
                                onChange={handleChange}
                                disabled={loading}
                            />
                            {errorForm.price && (
                                <ErrorFormInfo message={errorForm.price} />
                            )}
                        </Field>
                        <Field>
                            <label htmlFor="price" className="text-sm">
                                {t("page.product.dialog_modal.create_dialog.price_input_label", "Harga Jual")}
                                <span className="text-red-500"> *</span>
                            </label>
                            <Input
                                id="price"
                                name="price"
                                placeholder={t("page.product.dialog_modal.create_dialog.price_input_placeholder", "Masukkan harga jual produk")}
                                value={formData.price}
                                onChange={handleChange}
                                disabled={loading}
                            />
                            {errorForm.price && (
                                <ErrorFormInfo message={errorForm.price} />
                            )}
                        </Field>
                        <Field>
                            <label htmlFor="is_active" className="text-sm">
                                {t("page.product.dialog_modal.create_dialog.is_active_input_label", "Peran")}
                                <span className="text-red-500"> *</span>
                            </label>
                            <Select
                                onValueChange={(value) => setFormData((prev) => ({ ...prev, is_active: value === 'true' }))}
                                disabled={loading}
                                value={formData.is_active.toString()}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder={t("page.product.dialog_modal.create_dialog.is_active_input_placeholder", "Pilih Status")} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>
                                            {t("page.product.dialog_modal.create_dialog.is_active_input_label", "Peran")}
                                        </SelectLabel>
                                        <SelectItem
                                            value={"true"}
                                        >
                                            {t("page.product.dialog_modal.create_dialog.status.active", "Aktif")}
                                        </SelectItem>
                                        <SelectItem
                                            value={"false"}
                                        >
                                            {t("page.product.dialog_modal.create_dialog.status.inactive", "Tidak Aktif")}
                                        </SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            {errorForm.is_active && (
                                <ErrorFormInfo message={errorForm.is_active} />
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
                                {t("page.product.dialog_modal.edit_dialog.cancel_button", "Batal")}
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={loading}>
                            {loading ? <Spinner /> : t("page.product.dialog_modal.edit_dialog.confirm_button", "Edit Produk")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
