import { useEffect, useState } from 'react';
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
import { store as storeUser } from '@/routes/apiUsers';
import type { UserForm } from '@/support/interfaces/request/user';
import { useTranslation } from 'react-i18next';
import { Spinner } from '@/components/ui/spinner';
import axiosInstance from '@/lib/axios';
import { ResponseApi } from '@/support/interfaces/response/Response';
import { User } from '@/support/models/user';
import { handleApiError, showSuccessToast, showWarningToast } from '@/lib/utils';
import { PlusCircle } from 'lucide-react';
import z from 'zod';
import ErrorFormInfo from '@/components/errorFormInfo';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Role } from '@/support/models/role';

interface CreateDialogProps {
    onSuccess: () => void;
    roles: Role[];
}

export function CreateDialog({ onSuccess, roles }: CreateDialogProps) {
    const { t } = useTranslation();

    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [formData, setFormData] = useState<UserForm>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: '',
    });

    const [errorForm, setErrorForm] = useState<UserForm>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: '',
    });



    const userSchema = z.object({
        name: z.string().trim().min(1, t("validation.user.required.name", "Nama tidak boleh kosong")),
        email: z.email(t("validation.user.invalid.email", "Email tidak valid")),
        password: z.string().min(6, t("validation.user.required.password", "Password minimal 6 karakter")),
        password_confirmation: z.string().min(6, t("validation.user.required.password_confirmation", "Konfirmasi password minimal 6 karakter")),
        role: z.string().trim().min(1, t("validation.user.required.role", "Role tidak boleh kosong")),
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

        const resultValidation = userSchema.safeParse(formData);

        if (!resultValidation.success) {
            const fieldErrors: UserForm = {
                name: '',
                email: '',
                password: '',
                password_confirmation: '',
                role: ''
            };

            resultValidation.error.issues.forEach((error) => {
                const fieldName = error.path[0] as keyof UserForm;

                fieldErrors[fieldName] = error.message;
            });

            setErrorForm(fieldErrors);

            return;
        }

        try {
            setLoading(true);

            const res = await axiosInstance.post<ResponseApi<User>>(storeUser().url, formData);

            if (!res.data.success) {
                showWarningToast(res.data.message)
                return
            }

            showSuccessToast(res.data.message)
            setFormData({ name: '', email: '', password: '', password_confirmation: '', role: '' });
            setOpen(false);
            onSuccess();
        } catch (error) {
            console.error('Error creating user:', error);
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
                    {t("page.user.dialog_modal.create_dialog.dialog_button", "Tambah User")}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <DialogHeader>
                        <DialogTitle>{t("page.user.dialog_modal.create_dialog.dialog_title", "Tambah User")}</DialogTitle>
                        <DialogDescription>
                            {t("page.user.dialog_modal.create_dialog.dialog_desc", "Tambahkan user baru")}
                        </DialogDescription>
                    </DialogHeader>
                    <FieldGroup className="gap-3">
                        <Field>
                            <label htmlFor="name" className="text-sm">
                                {t("page.user.dialog_modal.create_dialog.name_input_label", "Nama")}
                            </label>
                            <Input
                                id="name"
                                name="name"
                                placeholder={t("page.user.dialog_modal.create_dialog.name_input_placeholder", "Masukkan nama user")}
                                value={formData.name}
                                onChange={handleChange}
                                disabled={loading}
                            />
                            {errorForm.name && (
                                <ErrorFormInfo message={errorForm.name} />

                            )}
                        </Field>
                        <Field>
                            <label htmlFor="email" className="text-sm">
                                {t("page.user.dialog_modal.create_dialog.email_input_label", "Email")}
                            </label>
                            <Input
                                id="email"
                                name="email"
                                placeholder={t("page.user.dialog_modal.create_dialog.email_input_placeholder", "Masukkan email user")}
                                value={formData.email}
                                onChange={handleChange}
                                disabled={loading}
                            />
                            {errorForm.email && (
                                <ErrorFormInfo message={errorForm.email} />

                            )}
                        </Field>
                        <Field>
                            <label htmlFor="password" className="text-sm">
                                {t("page.user.dialog_modal.create_dialog.password_input_label", "Password")}
                            </label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder={t("page.user.dialog_modal.create_dialog.password_input_placeholder", "Masukkan password user")}
                                value={formData.password}
                                onChange={handleChange}
                                disabled={loading}
                            />
                            {errorForm.password && (
                                <ErrorFormInfo message={errorForm.password} />

                            )}
                        </Field>
                        <Field>
                            <label htmlFor="password_confirmation" className="text-sm">
                                {t("page.user.dialog_modal.create_dialog.password_confirmation_input_label", "Password_confirmation")}
                            </label>
                            <Input
                                id="password_confirmation"
                                name="password_confirmation"
                                type="password"
                                placeholder={t("page.user.dialog_modal.create_dialog.password_confirmation_input_placeholder", "Masukkan password_confirmation user")}
                                value={formData.password_confirmation}
                                onChange={handleChange}
                                disabled={loading}
                            />
                            {errorForm.password_confirmation && (
                                <ErrorFormInfo message={errorForm.password_confirmation} />
                            )}
                        </Field>
                        <Field>
                            <label htmlFor="role" className="text-sm">
                                {t("page.user.dialog_modal.create_dialog.role_input_label", "Peran")}
                            </label>
                            <Select
                                onValueChange={(value) => setFormData((prev) => ({ ...prev, role: value }))}
                                disabled={loading}
                                value={formData.role}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder={t("page.user.dialog_modal.create_dialog.role_input_placeholder", "Pilih peran user")} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel> {t("page.user.dialog_modal.create_dialog.role_input_label", "Peran")}</SelectLabel>
                                        {roles.map((item) => (
                                            <SelectItem key={item.id} value={item.name}>{item.name}</SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            {errorForm.role && (
                                <ErrorFormInfo message={errorForm.role} />
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
                                {t("page.user.dialog_modal.create_dialog.cancel_button", "Batal")}
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={loading}>
                            {loading ? <Spinner /> : t("page.user.dialog_modal.create_dialog.confirm_button", "Tambah")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
