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
    DialogTrigger,
} from '@/components/ui/dialog';
import { Field, FieldGroup } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { store as storeCategory } from '@/routes/apiCategories';
import type { CategoryForm } from '@/support/interfaces/request/createCategory';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { Spinner } from '@/components/ui/spinner';

interface CreateDialogProps {
    onSuccess: () => void;
}

export function CreateDialog({ onSuccess }: CreateDialogProps) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [formData, setFormData] = useState<CategoryForm>({
        name: '',
        desc: '',
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            return alert('Category name is required');
        }

        try {
            setLoading(true);

            await axios.post(storeCategory().url, formData);

            setFormData({ name: '', desc: '' });
            toast.success("Create category successfully")
            onSuccess();
        } catch (error) {
            console.error('Error creating category:', error);
            toast.error("Failed to edit category")
        } finally {
            setLoading(false);
            setOpen(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">{t("page.category.dialog_modal.create_dialog.dialog_button", "Tambah Kategori")}</Button>
            </DialogTrigger>
            <DialogContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <DialogHeader>
                        <DialogTitle>{t("page.category.dialog_modal.create_dialog.dialog_title", "Tambah Kategori")}</DialogTitle>
                        <DialogDescription>
                            {t("page.category.dialog_modal.create_dialog.dialog_desc", "Tambahkan kategori baru produk anda")}
                        </DialogDescription>
                    </DialogHeader>
                    <FieldGroup>
                        <Field>
                            <label htmlFor="name" className="text-sm">
                                {t("page.category.dialog_modal.create_dialog.name_input_label", "Nama")}
                            </label>
                            <Input
                                id="name"
                                name="name"
                                placeholder={t("page.category.dialog_modal.create_dialog.name_input_placeholder", "Masukkan nama kategori")}
                                value={formData.name}
                                onChange={handleChange}
                                disabled={loading}
                                required
                            />
                        </Field>
                        <Field>
                            <label htmlFor="desc" className="text-sm">
                                {t("page.category.dialog_modal.create_dialog.desc_input_label", "Deskripsi")}
                            </label>
                            <Textarea
                                id="desc"
                                name="desc"
                                placeholder={t("page.category.dialog_modal.create_dialog.desc_input_placeholder", "Masukkan deskripsi kategori (Opsional)")}
                                value={formData.desc}
                                onChange={handleChange}
                                disabled={loading}
                                rows={4}
                            />
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
                                {t("page.category.dialog_modal.create_dialog.cancel_button", "Batal")}
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={loading}>
                            {loading ? <Spinner /> : t("page.category.dialog_modal.create_dialog.confirm_button", "Tambah")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
