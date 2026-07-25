import { useState } from 'react';
import { formatRupiah } from '@/lib/format-money';
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
import { withdrawCapital as apiWithdrawCapital } from '@/routes/apiProfitWallet';
import { NumericFormat } from 'react-number-format';
import { Input } from '@/components/ui/input';
import {
    handleApiError,
    showSuccessToast,
    showWarningToast,
} from '@/lib/utils';
import { Landmark } from 'lucide-react';
import z from 'zod';
import ErrorFormInfo from '@/components/errorFormInfo';

interface WithdrawCapitalDialogProps {
    onSuccess: () => void;
    currentBalance?: number;
}

export function WithdrawCapitalDialog({ onSuccess, currentBalance = 0 }: WithdrawCapitalDialogProps) {
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
        amount: z.number().min(0.01, t('validation.profit_wallet.min_amount', 'Nominal penarikan modal minimal Rp 0.01')),
        notes: z.string().max(500, t('validation.profit_wallet.max_notes', 'Catatan maksimal 500 karakter')).optional(),
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
            const res = await axiosInstance.post(apiWithdrawCapital().url, formData);

            if (!res.data.success) {
                showWarningToast(res.data.message);
                return;
            }

            showSuccessToast(res.data.message);
            setFormData({ amount: 0, notes: '' });
            setOpen(false);
            onSuccess();
        } catch (error) {
            console.error('Error withdrawing capital:', error);
            handleApiError(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="w-full bg-slate-600 hover:bg-slate-700 text-white font-medium rounded-xl py-2.5 flex items-center justify-center gap-2">
                    <Landmark className="h-4 w-4" />
                    {t('page.profit_wallet.dialog_modal.withdraw_capital.dialog_button', 'Tarik Modal')}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <DialogHeader>
                        <DialogTitle>
                            {t('page.profit_wallet.dialog_modal.withdraw_capital.dialog_title', 'Tarik Modal Kembali')}
                        </DialogTitle>
                        <DialogDescription>
                            {t('page.profit_wallet.dialog_modal.withdraw_capital.dialog_desc', 'Tarik profit bersih Anda untuk diinvestasikan kembali sebagai modal operasional.')}
                        </DialogDescription>
                    </DialogHeader>
                    <FieldGroup>
                        <Field>
                            <label htmlFor="amount" className="text-sm font-medium text-foreground">
                                {t('page.profit_wallet.dialog_modal.withdraw_capital.amount_label', 'Nominal Modal')}
                                <span className="text-red-500"> *</span>
                            </label>
                             <NumericFormat
                                thousandSeparator="."
                                decimalSeparator=","
                                prefix="Rp "
                                allowNegative={false}
                                customInput={Input}
                                id="amount"
                                placeholder={t('page.profit_wallet.dialog_modal.withdraw_capital.amount_placeholder', 'Masukkan nominal penarikan modal')}
                                value={formData.amount === 0 ? '' : formData.amount}
                                onValueChange={(values) => {
                                    const { floatValue } = values;
                                    setFormData((prev) => ({ ...prev, amount: floatValue || 0 }));
                                    setErrorForm((prev) => ({ ...prev, amount: '' }));
                                }}
                                disabled={loading}
                                className={`${errorForm.amount && 'border-red-500'}`}
                            />
                            <div className="flex flex-wrap gap-1.5 mt-2">
                                {[50000, 100000, 250000, 500000, 1000000, 5000000].map((val) => (
                                    <Button
                                        key={val}
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setFormData((prev) => ({ ...prev, amount: val }));
                                            setErrorForm((prev) => ({ ...prev, amount: '' }));
                                        }}
                                        className="h-7 text-[10px] font-normal px-2.5 rounded-lg border-dashed hover:bg-muted"
                                        disabled={loading}
                                    >
                                        {formatRupiah(val)}
                                    </Button>
                                ))}
                                {currentBalance > 0 && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setFormData((prev) => ({ ...prev, amount: currentBalance }));
                                            setErrorForm((prev) => ({ ...prev, amount: '' }));
                                        }}
                                        className="h-7 text-[10px] font-semibold px-2.5 rounded-lg border-solid border-slate-600 text-slate-600 dark:border-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-950/20"
                                        disabled={loading}
                                    >
                                        {t('page.profit_wallet.dialog_modal.withdraw_capital.all_preset', 'Semua ({{balance}})', { balance: formatRupiah(currentBalance) })}
                                    </Button>
                                )}
                            </div>
                            {errorForm.amount && <ErrorFormInfo message={errorForm.amount} />}
                        </Field>
                        <Field>
                            <label htmlFor="notes" className="text-sm font-medium text-foreground">
                                {t('page.profit_wallet.dialog_modal.withdraw_capital.notes_label', 'Catatan')}
                            </label>
                            <Textarea
                                id="notes"
                                name="notes"
                                placeholder={t('page.profit_wallet.dialog_modal.withdraw_capital.notes_placeholder', 'Masukkan catatan modal (misal: Reinvestasi Kas Toko)')}
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
                                {t('page.profit_wallet.dialog_modal.withdraw_capital.cancel_btn', 'Batal')}
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={loading} className="bg-slate-600 hover:bg-slate-700 text-white">
                            {loading ? <Spinner /> : t('page.profit_wallet.dialog_modal.withdraw_capital.confirm_btn', 'Tarik')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
