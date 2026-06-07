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
    DialogTrigger,
} from '@/components/ui/dialog';
import { Field, FieldGroup } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { store as storePaymentMethod } from '@/routes/apiPaymentMethods';
import type { PaymentMethodForm } from '@/support/interfaces/request/paymentMethod';
import { useTranslation } from 'react-i18next';
import { Spinner } from '@/components/ui/spinner';
import axiosInstance from '@/lib/axios';
import { ResponseApi } from '@/support/interfaces/response/Response';
import { PaymentMethod } from '@/support/models/paymentMethod';
import { handleApiError, showSuccessToast, showWarningToast } from '@/lib/utils';
import { PlusCircle } from 'lucide-react';
import z from 'zod';
import ErrorFormInfo from '@/components/errorFormInfo';

interface CreateDialogProps {
    onSuccess: () => void;
}

export function CreateDialog({ onSuccess }: CreateDialogProps) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [formData, setFormData] = useState<PaymentMethodForm>({
        name: '',
        image: '',
        desc: '',
    });

    const [errorForm, setErrorForm] = useState<PaymentMethodForm>({
        name: "",
        image: '',
        desc: ""
    });

    const paymentMethodSchema = z.object({
        name: z.string().trim().min(1, t("validation.paymentMethod.required.name", "Nama tidak boleh kosong")),
        desc: z.string().trim(),
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

        const resultValidation = paymentMethodSchema.safeParse(formData);

        if (!resultValidation.success) {
            const fieldErrors: PaymentMethodForm = {
                name: "",
                image: '',
                desc: ""
            };

            resultValidation.error.issues.forEach((error) => {
                const fieldName = error.path[0] as keyof PaymentMethodForm;

                fieldErrors[fieldName] = error.message;
            });

            setErrorForm(fieldErrors);

            return;
        }

        try {
            setLoading(true);

            const submitData = new FormData();
            submitData.append('name', formData.name);
            submitData.append('desc', formData.desc);
            if (imageFile) {
                submitData.append('image', imageFile);
            }

            const res = await axiosInstance.post<ResponseApi<PaymentMethod>>(storePaymentMethod().url, submitData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });


            if (!res.data.success) {
                showWarningToast(res.data.message)
                return
            }

            showSuccessToast(res.data.message)
            setFormData({ name: '', image: '', desc: '' });
            setImageFile(null);
            setImagePreview('');
            setOpen(false);
            onSuccess();
        } catch (error) {
            console.error('Error creating paymentMethod:', error);
            handleApiError(error)
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <PlusCircle className="h-4" />
                    {t("page.payment_method.dialog_modal.create_dialog.dialog_button", "Tambah Metode Pembayaran")}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <DialogHeader>
                        <DialogTitle>{t("page.payment_method.dialog_modal.create_dialog.dialog_title", "Tambah Metode Pembayaran")}</DialogTitle>
                        <DialogDescription>
                            {t("page.payment_method.dialog_modal.create_dialog.dialog_desc", "Tambahkan metode pembayaran baru produk anda")}
                        </DialogDescription>
                    </DialogHeader>
                    <FieldGroup>
                        <Field>
                            <label htmlFor="name" className="text-sm">
                                {t("page.payment_method.dialog_modal.create_dialog.name_input_label", "Nama")}
                                <span className="text-red-500"> *</span>
                            </label>
                            <Input
                                id="name"
                                name="name"
                                placeholder={t("page.payment_method.dialog_modal.create_dialog.name_input_placeholder", "Masukkan nama metode pembayaran")}
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
                                {t("page.payment_method.dialog_modal.create_dialog.image_input_label", "Gambar")}
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
                            <label htmlFor="desc" className="text-sm">
                                {t("page.payment_method.dialog_modal.create_dialog.desc_input_label", "Deskripsi")}
                            </label>
                            <Textarea
                                id="desc"
                                name="desc"
                                placeholder={t("page.payment_method.dialog_modal.create_dialog.desc_input_placeholder", "Masukkan deskripsi metode pembayaran (Opsional)")}
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
                                {t("page.payment_method.dialog_modal.create_dialog.cancel_button", "Batal")}
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={loading}>
                            {loading ? <Spinner /> : t("page.payment_method.dialog_modal.create_dialog.confirm_button", "Tambah")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
