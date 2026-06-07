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
import { update as updateRole } from '@/routes/apiRoles';
import type { Role } from '@/support/models/role';
import { useTranslation } from 'react-i18next';
import { Spinner } from '@/components/ui/spinner';
import axiosInstance from '@/lib/axios';
import { ResponseApi } from '@/support/interfaces/response/Response';
import { handleApiError, showSuccessToast, showWarningToast } from '@/lib/utils';
import { RoleForm } from '@/support/interfaces/request/role';
import z from 'zod';
import ErrorFormInfo from '@/components/errorFormInfo';

interface EditDialogProps {
    isOpen: boolean;
    onSuccess: () => void;
    role: Role | null;
    setOpen: (open: boolean) => void;
}

export function EditDialog({
    isOpen,
    onSuccess,
    role,
    setOpen,
}: EditDialogProps) {
    const { t } = useTranslation();

    const [loading, setLoading] = useState<boolean>(false);

    const [formData, setFormData] = useState({
        name: role?.name ?? '',
    });

    const [errorForm, setErrorForm] = useState<RoleForm>({
        name: "",
    });

    const roleSchema = z.object({
        name: z.string().trim().min(1, t("validation.role.required.name", "Nama tidak boleh kosong"))
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

        const resultValidation = roleSchema.safeParse(formData);

        if (!resultValidation.success) {
            const fieldErrors: RoleForm = {
                name: "",
            };

            resultValidation.error.issues.forEach((error) => {
                const fieldName = error.path[0] as keyof RoleForm;

                fieldErrors[fieldName] = error.message;
            });

            setErrorForm(fieldErrors);

            return;
        }


        try {
            setLoading(true);


            const res = await axiosInstance.put<ResponseApi<Role>>(updateRole(role?.id || '').url, formData);

            if (!res.data.success) {
                showWarningToast(res.data.message)
                return
            }

            showSuccessToast(res.data.message)
            onSuccess();
        } catch (error) {
            console.error('Error updating role:', error);
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
                        <DialogTitle>{t("page.role.dialog_modal.edit_dialog.dialog_title", "Edit Peran")}</DialogTitle>
                        <DialogDescription>
                            {t("page.role.dialog_modal.edit_dialog.dialog_desc", "Edit data peran")}
                        </DialogDescription>
                    </DialogHeader>
                    <FieldGroup>
                        <Field>
                            <label htmlFor="name" className="text-sm">
                                {t("page.role.dialog_modal.edit_dialog.name_input_label", "Nama")}
                                <span className="text-red-500"> *</span>
                            </label>
                            <Input
                                id="name"
                                name="name"
                                placeholder={t("page.role.dialog_modal.edit_dialog.name_input_placeholder", "Masukkan nama peran")}
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
                                {t("page.role.dialog_modal.edit_dialog.cancel_button", "Batal")}
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={loading}>
                            {loading ? <Spinner /> : t("page.role.dialog_modal.edit_dialog.confirm_button", "Edit Peran")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
