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
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from 'react-i18next';
import { Spinner } from '@/components/ui/spinner';
import axiosInstance from '@/lib/axios';
import { inject as apiInject } from '@/routes/apiCapitalWallet';
import { NumericFormat } from 'react-number-format';
import { Input } from '@/components/ui/input';
import {
    handleApiError,
    showSuccessToast,
    showWarningToast,
} from '@/lib/utils';
import { PlusCircle } from 'lucide-react';
import z from 'zod';
import ErrorFormInfo from '@/components/errorFormInfo';

interface InjectDialogProps {
    onSuccess: () => void;
}

export function InjectDialog({ onSuccess }: InjectDialogProps) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [formData, setFormData] = useState({
        amount: 0,
        notes: '',
    });

    const [errorForm, setErrorForm] = useState({
        amount: '',
        notes: '',
    });

    const schema = z.object({
        amount: z.number().min(0.01, t('validation.capital_wallet.min_amount', 'Nominal suntikan minimal Rp 0.01')),
        notes: z.string().max(500, t('validation.capital_wallet.max_notes', 'Catatan maksimal 500 karakter')).optional(),
    });

    const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrorForm((prev) => ({ ...prev, [name]: '' }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const resultValidation = schema.safeParse(formData);
        if (!resultValidation.success) {
            const fieldErrors = { amount: '', notes: '' };
            resultValidation.error.issues.forEach((error) => {
                const fieldName = error.path[0] as 'amount' | 'notes';
                fieldErrors[fieldName] = error.message;
            });
            setErrorForm(fieldErrors);
            return;
        }

        try {
            setLoading(true);
            const res = await axiosInstance.post(apiInject().url, formData);

            if (!res.data.success) {
                showWarningToast(res.data.message);
                return;
            }

            showSuccessToast(res.data.message);
            setFormData({ amount: 0, notes: '' });
            setOpen(false);
            onSuccess();
        } catch (error) {
            console.error('Error injecting capital:', error);
            handleApiError(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl py-2.5 flex items-center justify-center gap-2 cursor-pointer">
                    <PlusCircle className="h-4 w-4" />
                    {t('page.capital_wallet.dialog_modal.inject.dialog_button', 'Suntik Modal')}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <DialogHeader>
                        <DialogTitle>
                            {t('page.capital_wallet.dialog_modal.inject.dialog_title', 'Suntik Modal')}
                        </DialogTitle>
                        <DialogDescription>
                            {t('page.capital_wallet.dialog_modal.inject.dialog_desc', 'Tambahkan dana segar ke dompet modal untuk membiayai operasional atau pembelian stok.')}
                        </DialogDescription>
                    </DialogHeader>
                    <FieldGroup>
                        <Field>
                            <label htmlFor="amount" className="text-sm font-medium text-foreground">
                                {t('page.capital_wallet.dialog_modal.inject.amount_label', 'Nominal Suntikan')}
                                <span className="text-red-500"> *</span>
                            </label>
                            <NumericFormat
                                thousandSeparator="."
                                decimalSeparator=","
                                prefix="Rp "
                                allowNegative={false}
                                customInput={Input}
                                id="amount"
                                placeholder={t('page.capital_wallet.dialog_modal.inject.amount_placeholder', 'Masukkan nominal modal baru')}
                                value={formData.amount === 0 ? '' : formData.amount}
                                onValueChange={(values) => {
                                    const { floatValue } = values;
                                    setFormData((prev) => ({ ...prev, amount: floatValue || 0 }));
                                    setErrorForm((prev) => ({ ...prev, amount: '' }));
                                }}
                                disabled={loading}
                                className={`${errorForm.amount && 'border-red-500'}`}
                            />
                            {errorForm.amount && <ErrorFormInfo message={errorForm.amount} />}
                        </Field>
                        <Field>
                            <label htmlFor="notes" className="text-sm font-medium text-foreground">
                                {t('page.capital_wallet.dialog_modal.inject.notes_label', 'Catatan')}
                            </label>
                            <Textarea
                                id="notes"
                                name="notes"
                                placeholder={t('page.capital_wallet.dialog_modal.inject.notes_placeholder', 'Masukkan catatan suntikan (misal: Setoran Modal Pemilik)')}
                                value={formData.notes}
                                onChange={handleNotesChange}
                                disabled={loading}
                                rows={3}
                                className={`${errorForm.notes && 'border-red-500'}`}
                            />
                            {errorForm.notes && <ErrorFormInfo message={errorForm.notes} />}
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
                                {t('page.capital_wallet.dialog_modal.inject.cancel_btn', 'Batal')}
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                            {loading ? <Spinner /> : t('page.capital_wallet.dialog_modal.inject.confirm_btn', 'Suntik')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
