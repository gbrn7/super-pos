import { UploadCloud } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ErrorFormInfo from '@/components/errorFormInfo';
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
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import axiosInstance from '@/lib/axios';
import { handleApiError, showSuccessToast } from '@/lib/utils';
import {
    getPaymentMethodImportTemplate,
    importPaymentMethodsExcelData,
} from '@/routes/apiPaymentMethods';
import type { ResponseApi } from '@/support/interfaces/response/Response';

interface ImportExcelDialogProps {
    onSuccess?: () => void;
}

export function ImportExcelDialog({ onSuccess }: ImportExcelDialogProps) {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [errorForm, setErrorForm] = useState<{ file: string }>({ file: '' });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.MouseEvent) => {
        e.preventDefault();

        if (!file) {
            setErrorForm({
                file: t(
                    'validation.payment_method.required.file',
                    'File impor tidak boleh kosong',
                ),
            });

            return;
        }

        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append('file_import', file);

            const res = await axiosInstance.post<ResponseApi<number>>(
                importPaymentMethodsExcelData().url,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                },
            );

            showSuccessToast(res.data.message);
            setIsOpen(false);
            setFile(null);
            onSuccess?.();
        } catch (error) {
            console.error('Error importing payment methods:', error);
            handleApiError(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <UploadCloud className="h-4" />
                    {t(
                        'page.payment_method.dialog_modal.import_excel_dialog.dialog_button',
                        'Impor Excel',
                    )}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm">
                <DialogHeader>
                    <DialogTitle>
                        {t(
                            'page.payment_method.dialog_modal.import_excel_dialog.dialog_title',
                            'Impor Excel',
                        )}
                    </DialogTitle>
                    <DialogDescription>
                        {t(
                            'page.payment_method.dialog_modal.import_excel_dialog.dialog_desc',
                            'Import Excel',
                        )}
                    </DialogDescription>
                </DialogHeader>
                <FieldGroup>
                    <Field>
                        <Label htmlFor="file-import">
                            {t(
                                'page.payment_method.dialog_modal.import_excel_dialog.template_label',
                                'Templat',
                            )}
                        </Label>
                        <p className="text-blue-500">
                            <a href={getPaymentMethodImportTemplate().url}>
                                {t(
                                    'page.payment_method.dialog_modal.import_excel_dialog.payment_method_template_file',
                                    'File templat impor data metode pembayaran',
                                )}
                            </a>
                        </p>
                    </Field>
                    <Field>
                        <Label htmlFor="file_import">
                            {t(
                                'page.payment_method.dialog_modal.import_excel_dialog.file_excel_label',
                                'File Excel',
                            )}
                        </Label>
                        <Input
                            type="file"
                            id="file_import"
                            name="file_import"
                            accept=".xlsx,.xls"
                            onChange={handleFileChange}
                            disabled={isLoading}
                        />
                        {errorForm.file && (
                            <ErrorFormInfo message={errorForm.file} />
                        )}
                    </Field>
                </FieldGroup>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline" disabled={isLoading}>
                            {t(
                                'page.payment_method.dialog_modal.import_excel_dialog.cancel_button',
                                'Batal',
                            )}
                        </Button>
                    </DialogClose>
                    <Button onClick={handleSubmit} disabled={isLoading}>
                        {isLoading ? (
                            <Spinner />
                        ) : (
                            t(
                                'page.payment_method.dialog_modal.import_excel_dialog.confirm_button',
                                'Impor',
                            )
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
