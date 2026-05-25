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
import { store as storeUnit } from '@/routes/apiUnits';
import type { UnitForm } from '@/support/interfaces/request/unit';
import { useTranslation } from 'react-i18next';
import { Spinner } from '@/components/ui/spinner';
import axiosInstance from '@/lib/axios';
import { ResponseApi } from '@/support/interfaces/response/Response';
import { Unit } from '@/support/models/unit';
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
    const [formData, setFormData] = useState<UnitForm>({
        name: '',
    });

    const [errorForm, setErrorForm] = useState<UnitForm>({
        name: "",
    });

    const unitSchema = z.object({
        name: z.string().trim().min(1, t("validation.unit.required.name", "Nama tidak boleh kosong")),
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

        const resultValidation = unitSchema.safeParse(formData);

        if (!resultValidation.success) {
            const fieldErrors: UnitForm = {
                name: "",
            };

            resultValidation.error.issues.forEach((error) => {
                const fieldName = error.path[0] as keyof UnitForm;

                fieldErrors[fieldName] = error.message;
            });

            setErrorForm(fieldErrors);

            return;
        }

        try {
            setLoading(true);

            const res = await axiosInstance.post<ResponseApi<Unit>>(storeUnit().url, formData);


            if (!res.data.success) {
                showWarningToast(res.data.message)
                return
            }

            showSuccessToast(res.data.message)
            setFormData({ name: '' });
            setOpen(false);
            onSuccess();
        } catch (error) {
            console.error('Error creating unit:', error);
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
                    {t("page.unit.dialog_modal.create_dialog.dialog_button", "Tambah Satuan")}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <DialogHeader>
                        <DialogTitle>{t("page.unit.dialog_modal.create_dialog.dialog_title", "Tambah Satuan")}</DialogTitle>
                        <DialogDescription>
                            {t("page.unit.dialog_modal.create_dialog.dialog_desc", "Tambahkan satuan baru produk anda")}
                        </DialogDescription>
                    </DialogHeader>
                    <FieldGroup>
                        <Field>
                            <label htmlFor="name" className="text-sm">
                                {t("page.unit.dialog_modal.create_dialog.name_input_label", "Nama")}
                            </label>
                            <Input
                                id="name"
                                name="name"
                                placeholder={t("page.unit.dialog_modal.create_dialog.name_input_placeholder", "Masukkan nama satuan")}
                                value={formData.name}
                                onChange={handleChange}
                                disabled={loading}
                            />
                            {errorForm.name && (
                                <ErrorFormInfo message={errorForm.name} />

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
                                {t("page.unit.dialog_modal.create_dialog.cancel_button", "Batal")}
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={loading}>
                            {loading ? <Spinner /> : t("page.unit.dialog_modal.create_dialog.confirm_button", "Tambah")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
