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
import { update as updateMasterProduct } from '@/routes/apiMasterProducts';
import type { MasterProduct } from '@/support/models/masterProduct';
import { useTranslation } from 'react-i18next';
import { Spinner } from '@/components/ui/spinner';
import axiosInstance from '@/lib/axios';
import { ResponseApi } from '@/support/interfaces/response/Response';
import { handleApiError, showSuccessToast, showWarningToast } from '@/lib/utils';
import { MasterProductErrorForm, MasterProductForm, MasterProductSchema } from '@/support/interfaces/request/master-product';
import ErrorFormInfo from '@/components/errorFormInfo';
import { NumericFormat } from 'react-number-format';
import { Textarea } from '@/components/ui/textarea';

interface EditDialogProps {
    isOpen: boolean;
    onSuccess: () => void;
    masterProduct: MasterProduct | null;
    setOpen: (open: boolean) => void;
}

export function EditDialog({
    isOpen,
    onSuccess,
    masterProduct,
    setOpen,
}: EditDialogProps) {
    const { t } = useTranslation();

    const [loading, setLoading] = useState<boolean>(false);

    const defaultErrorForm: MasterProductErrorForm = {
        category_name: '',
        unit_name: '',
        name: '',
        price: '',
        cost_price: '',
        desc: '',
        barcode: ''
    }

    const [formData, setFormData] = useState<MasterProductForm>({
        category_name: masterProduct?.category_name ?? '',
        unit_name: masterProduct?.unit_name ?? '',
        name: masterProduct?.name ?? '',
        price: Number(masterProduct?.price) ?? 0,
        cost_price: Number(masterProduct?.cost_price) ?? 0,
        desc: masterProduct?.desc ?? '',
        barcode: masterProduct?.barcode ?? '',
    });

    const [errorForm, setErrorForm] = useState<MasterProductErrorForm>(defaultErrorForm);

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



    const handleSubmit = async (e: React.SubmitEvent) => {

        e.preventDefault();

        console.log("formdata", formData);

        const resultValidation = MasterProductSchema.safeParse(formData);
        if (!resultValidation.success) {
            const fieldErrors: MasterProductErrorForm = defaultErrorForm;

            resultValidation.error.issues.forEach((error) => {
                const fieldName = error.path[0] as keyof MasterProductForm;

                fieldErrors[fieldName] = error.message;
            });

            setErrorForm(fieldErrors);

            return;
        }


        try {
            setLoading(true);

            const res = await axiosInstance.put<ResponseApi<MasterProduct>>(
                updateMasterProduct(masterProduct?.id || '').url,
                {
                    category_name: formData.category_name,
                    unit_name: formData.unit_name,
                    name: formData.name,
                    price: formData.price,
                    cost_price: formData.cost_price,
                    desc: formData.desc,
                    barcode: formData.barcode
                },
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            if (!res.data.success) {
                showWarningToast(res.data.message)
                return
            }

            showSuccessToast(res.data.message)
            setOpen(false);
            onSuccess();
        } catch (error) {
            console.error('Error updating product:', error);
            handleApiError(error)
        } finally {
            setLoading(false);
            setErrorForm(defaultErrorForm);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setOpen}>
            <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} className='max-w-250! max-h-[90vh] overflow-y-auto'>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <DialogHeader>
                        <DialogTitle>{t("page.master_product.dialog_modal.edit_dialog.dialog_title", "Edit Master Produk")}</DialogTitle>
                        <DialogDescription>
                            {t("page.master_product.dialog_modal.edit_dialog.dialog_desc", "Edit data master produk")}
                        </DialogDescription>
                    </DialogHeader>
                    <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Field>
                            <label htmlFor="name" className="text-sm">
                                {t("page.master_product.dialog_modal.edit_dialog.name_input_label", "Nama")}
                                <span className="text-red-500"> *</span>
                            </label>
                            <Input
                                id="name"
                                name="name"
                                placeholder={t("page.master_product.dialog_modal.edit_dialog.name_input_placeholder", "Masukkan nama master produk")}
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
                            <label htmlFor="category_name" className="text-sm">
                                {t("page.master_product.dialog_modal.create_dialog.category_name_input_label", "Kategori")}
                            </label>
                            <Input
                                id="category_name"
                                name="category_name"
                                placeholder={t("page.master_product.dialog_modal.create_dialog.category_name_input_placeholder", "Masukkan nama kategori master produk")}
                                value={formData.category_name}
                                onChange={handleChange}
                                disabled={loading}
                                className={`${errorForm.category_name && 'border-red-500'}`}
                            />
                            {errorForm.category_name && (
                                <ErrorFormInfo message={errorForm.category_name} />
                            )}
                        </Field>
                        <Field>
                            <label htmlFor="unit_name" className="text-sm">
                                {t("page.master_product.dialog_modal.create_dialog.unit_name_input_label", "Satuan")}
                            </label>
                            <Input
                                id="unit_name"
                                name="unit_name"
                                placeholder={t("page.master_product.dialog_modal.create_dialog.unit_name_input_placeholder", "Masukkan satuan master produk")}
                                value={formData.unit_name}
                                onChange={handleChange}
                                disabled={loading}
                                className={`${errorForm.unit_name && 'border-red-500'}`}
                            />
                            {errorForm.unit_name && (
                                <ErrorFormInfo message={errorForm.unit_name} />
                            )}
                        </Field>
                        <Field>
                            <label htmlFor="cost_price" className="text-sm">
                                {t("page.master_product.dialog_modal.edit_dialog.cost_price_input_label", "Harga Modal")}
                                <span className="text-red-500"> *</span>
                            </label>
                            <NumericFormat
                                id="cost_price"
                                name="cost_price"
                                customInput={Input}
                                thousandSeparator="."
                                decimalSeparator=","
                                prefix="Rp "
                                placeholder={t("page.master_product.dialog_modal.edit_dialog.cost_price_input_placeholder", "Masukkan harga modal master Produk")}
                                value={formData.cost_price}
                                disabled={loading}
                                onValueChange={(values) => {
                                    setFormData((prev) => ({
                                        ...prev,
                                        cost_price: values.floatValue ?? 0,
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
                                {t("page.master_product.dialog_modal.edit_dialog.price_input_label", "Harga Jual")}
                                <span className="text-red-500"> *</span>
                            </label>
                            <NumericFormat
                                id="price"
                                name="price"
                                customInput={Input}
                                thousandSeparator="."
                                decimalSeparator=","
                                prefix="Rp "
                                placeholder={t("page.master_product.dialog_modal.edit_dialog.price_input_placeholder", "Masukkan harga jual master Produk")}
                                value={formData.price}
                                disabled={loading}
                                onValueChange={(values) => {
                                    setFormData((prev) => ({
                                        ...prev,
                                        price: values.floatValue ?? 0,
                                    }));
                                }}
                                className={`${errorForm.price && 'border-red-500'}`}
                            />
                            {errorForm.price && (
                                <ErrorFormInfo message={errorForm.price} />
                            )}
                        </Field>

                        <Field>
                            <label htmlFor="barcode" className="text-sm">
                                {t("page.master_product.dialog_modal.edit_dialog.barcode_input_label", "Nama")}
                            </label>
                            <Input
                                id="barcode"
                                name="barcode"
                                placeholder={t("page.master_product.dialog_modal.edit_dialog.barcode_input_placeholder", "Masukkan barcode master Produk (Opsional)")}
                                value={formData.barcode}
                                onChange={handleChange}
                                disabled={loading}
                                className={`${errorForm.barcode && 'border-red-500'}`}
                            />
                            {errorForm.barcode && (
                                <ErrorFormInfo message={errorForm.barcode} />
                            )}
                        </Field>
                        <Field>
                            <label htmlFor="desc" className="text-sm">
                                {t("page.master_product.dialog_modal.edit_dialog.desc_input_label", "Deskripsi")}
                            </label>
                            <Textarea
                                id="desc"
                                name="desc"
                                placeholder={t("page.master_product.dialog_modal.edit_dialog.desc_input_placeholder", "Masukkan deskripsi master Produk (Opsional)")}
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
                                {t("page.master_product.dialog_modal.edit_dialog.cancel_button", "Batal")}
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={loading}>
                            {loading ? <Spinner /> : t("page.master_product.dialog_modal.edit_dialog.confirm_button", "Edit Master Produk")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
