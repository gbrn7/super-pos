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
import { Textarea } from '@/components/ui/textarea';
import { update as updateCategory } from '@/routes/apiCategories';
import type { Category } from '@/support/models/category';
import { useTranslation } from 'react-i18next';
import { Spinner } from '@/components/ui/spinner';
import axiosInstance from '@/lib/axios';
import { ResponseApi } from '@/support/interfaces/response/Response';
import { handleApiError, showSuccessToast, showWarningToast } from '@/lib/utils';
import { CategoryForm } from '@/support/interfaces/request/category';
import z from 'zod';
import ErrorFormInfo from '@/components/errorFormInfo';

interface EditDialogProps {
    isOpen: boolean;
    onSuccess: () => void;
    category: Category | null;
    setOpen: (open: boolean) => void;
}

export function EditDialog({
    isOpen,
    onSuccess,
    category,
    setOpen,
}: EditDialogProps) {
    const { t } = useTranslation();

    const [loading, setLoading] = useState<boolean>(false);

    const [formData, setFormData] = useState({
        name: category?.name ?? '',
        desc: category?.desc ?? '',
    });

    const [errorForm, setErrorForm] = useState<CategoryForm>({
        name: "",
        desc: ""
    });

    const categorySchema = z.object({
        name: z.string().trim().min(1, t("validation.category.required.name", "Nama tidak boleh kosong")),
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

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();

        const resultValidation = categorySchema.safeParse(formData);

        if (!resultValidation.success) {
            const fieldErrors: CategoryForm = {
                name: "",
                desc: ""
            };

            resultValidation.error.issues.forEach((error) => {
                const fieldName = error.path[0] as keyof CategoryForm;

                fieldErrors[fieldName] = error.message;
            });

            setErrorForm(fieldErrors);

            return;
        }


        try {
            setLoading(true);


            const res = await axiosInstance.put<ResponseApi<Category>>(updateCategory(category?.id || '').url, formData);

            if (!res.data.success) {
                showWarningToast(res.data.message)
                return
            }

            showSuccessToast(res.data.message)
            onSuccess();
        } catch (error) {
            console.error('Error updating category:', error);
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
                        <DialogTitle>{t("page.category.dialog_modal.edit_dialog.dialog_title", "Edit Kategori")}</DialogTitle>
                        <DialogDescription>
                            {t("page.category.dialog_modal.edit_dialog.dialog_desc", "Edit data kategori")}
                        </DialogDescription>
                    </DialogHeader>
                    <FieldGroup>
                        <Field>
                            <label htmlFor="name" className="text-sm">
                                {t("page.category.dialog_modal.edit_dialog.name_input_label", "Nama")}
                                <span className="text-red-500"> *</span>
                            </label>
                            <Input
                                id="name"
                                name="name"
                                placeholder={t("page.category.dialog_modal.edit_dialog.name_input_placeholder", "Masukkan nama kategori")}
                                value={formData.name}
                                onChange={handleChange}
                                disabled={loading}
                            />
                            {errorForm.name && (
                                <ErrorFormInfo message={errorForm.name} />
                            )}
                        </Field>
                        <Field>
                            <label htmlFor="desc" className="text-sm">
                                {t("page.category.dialog_modal.edit_dialog.desc_input_label", "Deskripsi")}
                            </label>
                            <Textarea
                                id="desc"
                                name="desc"
                                placeholder={t("page.category.dialog_modal.edit_dialog.desc_input_placeholder", "Masukkan deskripsi kategori (Opsional)")}
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
                                {t("page.category.dialog_modal.edit_dialog.cancel_button", "Batal")}
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={loading}>
                            {loading ? <Spinner /> : t("page.category.dialog_modal.edit_dialog.confirm_button", "Edit Kategori")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
