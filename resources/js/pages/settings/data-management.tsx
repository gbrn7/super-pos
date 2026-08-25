import React, { useState } from 'react';
import { useForm, Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { edit as editDataManagement } from '@/routes/data-management';
import DataManagementController from '@/actions/App/Http/Controllers/Settings/DataManagementController';

export default function DataManagement() {
    const { t } = useTranslation();
    const [confirmOpen, setConfirmOpen] = useState(false);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        modules: [] as string[],
        retention_period: '6_months',
        password: '',
    });

    const handleCheckboxChange = (moduleName: string, checked: boolean) => {
        if (checked) {
            setData('modules', [...data.modules, moduleName]);
        } else {
            setData('modules', data.modules.filter((m) => m !== moduleName));
        }
    };

    const handlePurgeSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(DataManagementController.purge.url(), {
            preserveScroll: true,
            onSuccess: () => {
                setConfirmOpen(false);
                reset('password');
                clearErrors();
            },
            onError: () => {
                // Keep dialog open if validation / password fails
            },
        });
    };

    const modulesList = [
        { id: 'transactions', label: t('page.data_management.module_transactions', 'Transaksi Penjualan') },
        { id: 'returns', label: t('page.data_management.module_returns', 'Retur Barang') },
        { id: 'profit_wallet', label: t('page.data_management.module_profit_wallet', 'Riwayat Dompet Profit') },
        { id: 'capital_wallet', label: t('page.data_management.module_capital_wallet', 'Riwayat Dompet Modal') },
    ];

    const periodOptions = [
        { value: '1_month', label: t('page.data_management.period_options.1_month', '1 Bulan Terakhir') },
        { value: '3_months', label: t('page.data_management.period_options.3_months', '3 Bulan Terakhir') },
        { value: '6_months', label: t('page.data_management.period_options.6_months', '6 Bulan Terakhir') },
        { value: '12_months', label: t('page.data_management.period_options.12_months', '1 Tahun Terakhir') },
    ];

    return (
        <>
            <Head title={t('page.data_management.title', 'Manajemen Data')} />

            <h1 className="sr-only">
                {t('page.data_management.title', 'Manajemen Data')}
            </h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title={t('page.data_management.title', 'Manajemen Data')}
                    description={t(
                        'page.data_management.subtitle',
                        'Bersihkan data lama untuk mengoptimalkan kinerja aplikasi.',
                    )}
                />

                <div className="space-y-6 max-w-xl">
                    {/* Retention Period Selection */}
                    <div className="grid gap-2">
                        <Label htmlFor="retention_period">
                            {t('page.data_management.retention_period_label', 'Pertahankan Data Sejak')}
                        </Label>
                        <Select
                            value={data.retention_period}
                            onValueChange={(val) => setData('retention_period', val)}
                        >
                            <SelectTrigger id="retention_period" className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {periodOptions.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.retention_period && <InputError message={errors.retention_period} />}
                    </div>

                    {/* Modules Checklist */}
                    <div className="space-y-3">
                        <Label>{t('page.data_management.modules_label', 'Pilih Kategori Data yang Akan Dihapus')}</Label>
                        <div className="space-y-2.5">
                            {modulesList.map((mod) => (
                                <div key={mod.id} className="flex items-center space-x-3">
                                    <Checkbox
                                        id={mod.id}
                                        checked={data.modules.includes(mod.id)}
                                        onCheckedChange={(checked) => handleCheckboxChange(mod.id, !!checked)}
                                    />
                                    <label
                                        htmlFor={mod.id}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer select-none"
                                    >
                                        {mod.label}
                                    </label>
                                </div>
                            ))}
                        </div>
                        {errors.modules && <InputError message={errors.modules} />}
                    </div>

                    {/* Trigger Button */}
                    <div className="pt-2">
                        <Button
                            variant="destructive"
                            onClick={() => {
                                clearErrors();
                                setConfirmOpen(true);
                            }}
                            disabled={data.modules.length === 0}
                        >
                            {t('page.data_management.purge_button', 'Bersihkan Data Usang')}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Confirmation Dialog */}
            <Dialog open={confirmOpen} onOpenChange={(open) => {
                if (!open) {
                    setConfirmOpen(false);
                    reset('password');
                    clearErrors();
                }
            }}>
                <DialogContent className="sm:max-w-md">
                    <form onSubmit={handlePurgeSubmit}>
                        <DialogHeader>
                            <DialogTitle className="text-destructive">
                                {t('page.data_management.confirm_title', 'Konfirmasi Penghapusan Permanen')}
                            </DialogTitle>
                            <DialogDescription className="pt-2 text-sm text-muted-foreground leading-normal">
                                {t(
                                    'page.data_management.confirm_desc',
                                    'Tindakan ini tidak dapat dibatalkan. Seluruh data terpilih yang lebih lama dari jangka waktu yang ditentukan akan dihapus secara permanen. Masukkan kata sandi Anda untuk melanjutkan.',
                                )}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="py-4 space-y-2">
                            <Label htmlFor="purge_password">
                                {t('page.settings.security.current_password_input_label', 'Kata sandi saat ini')}
                            </Label>
                            <PasswordInput
                                id="purge_password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className="w-full"
                                autoComplete="current-password"
                                placeholder={t(
                                    'page.settings.security.current_password_input_label',
                                    'Masukkan kata sandi saat ini',
                                )}
                            />
                            {errors.password && <InputError message={errors.password} />}
                        </div>

                        <DialogFooter className="gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setConfirmOpen(false);
                                    reset('password');
                                    clearErrors();
                                }}
                                disabled={processing}
                            >
                                {t('common.cancel', 'Batal')}
                            </Button>
                            <Button
                                type="submit"
                                variant="destructive"
                                disabled={processing || !data.password}
                            >
                                {t('page.data_management.confirm_submit', 'Ya, Hapus Permanen')}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

DataManagement.layout = {
    breadcrumbs: [
        {
            title: i18next.t('page.data_management.title', 'Manajemen Data'),
            href: editDataManagement(),
        },
    ],
};
