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
import { update as updateUnit } from '@/routes/apiUnits';
import type { Unit } from '@/support/models/unit';
import { useTranslation } from 'react-i18next';
import { Spinner } from '@/components/ui/spinner';
import axiosInstance from '@/lib/axios';
import { ResponseApi } from '@/support/interfaces/response/Response';
import { handleApiError, showSuccessToast, showWarningToast } from '@/lib/utils';
import { UnitForm } from '@/support/interfaces/request/unit';
import z from 'zod';
import ErrorFormInfo from '@/components/errorFormInfo';

interface EditDialogProps {
    isOpen: boolean;
    onSuccess: () => void;
    unit: Unit | null;
    setOpen: (open: boolean) => void;
}

export function EditDialog({
    isOpen,
    onSuccess,
    unit,
    setOpen,
}: EditDialogProps) {
    const { t } = useTranslation();

    const [loading, setLoading] = useState<boolean>(false);

    const [formData, setFormData] = useState({
        name: unit?.name ?? ''
    });

    const [errorForm, setErrorForm] = useState<UnitForm>({
        name: ""
    });

    const unitSchema = z.object({
        name: z.string().trim().min(1, t("validation.unit.required.name", "Nama tidak boleh kosong"))
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
                name: ""
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


            const res = await axiosInstance.put<ResponseApi<Unit>>(updateUnit(unit?.id || '').url, formData);

            if (!res.data.success) {
                showWarningToast(res.data.message)
                return
            }

            showSuccessToast(res.data.message)
            onSuccess();
        } catch (error) {
            console.error('Error updating unit:', error);
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
                        <DialogTitle>{t("page.unit.dialog_modal.edit_dialog.dialog_title", "Edit Unit")}</DialogTitle>
                        <DialogDescription>
                            {t("page.unit.dialog_modal.edit_dialog.dialog_desc", "Edit data unit")}
                        </DialogDescription>
                    </DialogHeader>
                    <FieldGroup>
                        <Field>
                            <label htmlFor="name" className="text-sm">
                                {t("page.unit.dialog_modal.edit_dialog.name_input_label", "Nama")}
                            </label>
                            <Input
                                id="name"
                                name="name"
                                placeholder={t("page.unit.dialog_modal.edit_dialog.name_input_placeholder", "Masukkan nama unit")}
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
                                {t("page.unit.dialog_modal.edit_dialog.cancel_button", "Batal")}
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={loading}>
                            {loading ? <Spinner /> : t("page.unit.dialog_modal.edit_dialog.confirm_button", "Edit Unit")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
