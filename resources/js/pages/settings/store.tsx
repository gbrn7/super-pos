import StoreSettingController from '@/actions/App/Http/Controllers/Settings/StoreSettingController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { edit as editStore } from '@/routes/store';
import { Form, Head } from '@inertiajs/react';
import i18next from 'i18next';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { formatRupiah } from '@/lib/format-money';

interface StoreSetting {
    id: number;
    name: string;
    address: string;
    phone: string;
    email: string | null;
    tax_number: string | null;
    receipt_header: string | null;
    receipt_footer: string | null;
}

export default function Store({ storeSetting }: { storeSetting: StoreSetting }) {
    const { t } = useTranslation();

    // Local state to bind fields for real-time receipt preview
    const [name, setName] = useState(storeSetting.name);
    const [address, setAddress] = useState(storeSetting.address);
    const [phone, setPhone] = useState(storeSetting.phone);
    const [receiptHeader, setReceiptHeader] = useState(storeSetting.receipt_header || '');
    const [receiptFooter, setReceiptFooter] = useState(storeSetting.receipt_footer || '');

    // Helper to format price inside receipt
    const formatPrice = (val: number) => {
        return formatRupiah(val).replace('Rp', '').trim();
    };

    return (
        <>
            <Head
                title={t('page.settings.store.title', 'Pengaturan Toko')}
            />

            <h1 className="sr-only">
                {t('page.settings.store.title', 'Pengaturan Toko')}
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Form Section */}
                <div className="lg:col-span-7 space-y-6">
                    <Heading
                        variant="small"
                        title={t(
                            'page.settings.store.form.title',
                            'Informasi Toko',
                        )}
                        description={t(
                            'page.settings.store.description',
                            'Perbarui detail informasi toko Anda',
                        )}
                    />

                    <Form
                        {...StoreSettingController.update.form()}
                        options={{
                            preserveScroll: true,
                        }}
                        className="space-y-6"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="name">
                                        {t(
                                            'page.settings.store.form.name_input_label',
                                            'Nama Toko',
                                        )}
                                    </Label>

                                    <Input
                                        id="name"
                                        className="mt-1 block w-full"
                                        defaultValue={storeSetting.name}
                                        onChange={(e) => setName(e.target.value)}
                                        name="name"
                                        required
                                        placeholder={t(
                                            'page.settings.store.form.name_input_placeholder',
                                            'Masukkan nama toko',
                                        )}
                                    />

                                    <InputError
                                        className="mt-2"
                                        message={errors.name}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="address">
                                        {t(
                                            'page.settings.store.form.address_input_label',
                                            'Alamat',
                                        )}
                                    </Label>

                                    <Textarea
                                        id="address"
                                        className="mt-1 block w-full min-h-[80px]"
                                        defaultValue={storeSetting.address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        name="address"
                                        required
                                        placeholder={t(
                                            'page.settings.store.form.address_input_placeholder',
                                            'Masukkan alamat toko',
                                        )}
                                    />

                                    <InputError
                                        className="mt-2"
                                        message={errors.address}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="phone">
                                        {t(
                                            'page.settings.store.form.phone_input_label',
                                            'No. Telepon',
                                        )}
                                    </Label>

                                    <Input
                                        id="phone"
                                        className="mt-1 block w-full"
                                        defaultValue={storeSetting.phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        name="phone"
                                        required
                                        placeholder={t(
                                            'page.settings.store.form.phone_input_placeholder',
                                            'Masukkan nomor telepon toko',
                                        )}
                                    />

                                    <InputError
                                        className="mt-2"
                                        message={errors.phone}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email">
                                        {t(
                                            'page.settings.store.form.email_input_label',
                                            'Email',
                                        )}
                                    </Label>

                                    <Input
                                        id="email"
                                        type="email"
                                        className="mt-1 block w-full"
                                        defaultValue={storeSetting.email ?? ''}
                                        name="email"
                                        placeholder={t(
                                            'page.settings.store.form.email_input_placeholder',
                                            'Masukkan email toko',
                                        )}
                                    />

                                    <InputError
                                        className="mt-2"
                                        message={errors.email}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="tax_number">
                                        {t(
                                            'page.settings.store.form.tax_number_input_label',
                                            'NPWP / No. Pajak',
                                        )}
                                    </Label>

                                    <Input
                                        id="tax_number"
                                        className="mt-1 block w-full"
                                        defaultValue={storeSetting.tax_number ?? ''}
                                        name="tax_number"
                                        placeholder={t(
                                            'page.settings.store.form.tax_number_input_placeholder',
                                            'Masukkan NPWP toko',
                                        )}
                                    />

                                    <InputError
                                        className="mt-2"
                                        message={errors.tax_number}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="receipt_header">
                                        {t(
                                            'page.settings.store.form.receipt_header_input_label',
                                            'Header Struk',
                                        )}
                                    </Label>

                                    <Textarea
                                        id="receipt_header"
                                        className="mt-1 block w-full min-h-[60px]"
                                        defaultValue={storeSetting.receipt_header ?? ''}
                                        onChange={(e) => setReceiptHeader(e.target.value)}
                                        name="receipt_header"
                                        placeholder={t(
                                            'page.settings.store.form.receipt_header_input_placeholder',
                                            'Masukkan teks header struk',
                                        )}
                                    />

                                    <InputError
                                        className="mt-2"
                                        message={errors.receipt_header}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="receipt_footer">
                                        {t(
                                            'page.settings.store.form.receipt_footer_input_label',
                                            'Footer Struk',
                                        )}
                                    </Label>

                                    <Textarea
                                        id="receipt_footer"
                                        className="mt-1 block w-full min-h-[60px]"
                                        defaultValue={storeSetting.receipt_footer ?? ''}
                                        onChange={(e) => setReceiptFooter(e.target.value)}
                                        name="receipt_footer"
                                        placeholder={t(
                                            'page.settings.store.form.receipt_footer_input_placeholder',
                                            'Masukkan teks footer struk',
                                        )}
                                    />

                                    <InputError
                                        className="mt-2"
                                        message={errors.receipt_footer}
                                    />
                                </div>

                                <div className="flex items-center gap-4">
                                    <Button
                                        disabled={processing}
                                        data-test="update-store-button"
                                    >
                                        {t(
                                            'page.settings.store.form.save_btn',
                                            'Simpan',
                                        )}
                                    </Button>
                                </div>
                            </>
                        )}
                    </Form>
                </div>

                {/* Receipt Preview Section */}
                <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-6 border-t border-border pt-6 lg:border-t-0 lg:pt-0">
                    <Heading
                        variant="small"
                        title={t('page.settings.store.receipt_preview_label', 'Pratinjau Struk')}
                        description={t(
                            'page.settings.store.receipt_preview_desc',
                            'Pratinjau tampilan struk belanja cetak.',
                        )}
                    />

                    {/* Paper Receipt Styling matching receipt-modal.tsx */}
                    <div
                        id="printable-receipt"
                        className="w-full max-w-xs mx-auto space-y-4 rounded-xl border bg-card p-5 font-sans text-xs leading-relaxed shadow-xs"
                    >
                        {/* Store Header */}
                        <div className="space-y-1 text-center">
                            <h3 className="text-sm font-extrabold tracking-tight text-foreground uppercase truncate">
                                {name || t('page.settings.store.receipt_preview.mock_name', 'NAMA TOKO')}
                            </h3>
                            <p className="text-[10px] leading-normal text-muted-foreground/80 whitespace-pre-line">
                                {address || t('page.settings.store.receipt_preview.mock_address', 'Alamat Toko')}
                                {phone && `\nTelp: ${phone}`}
                            </p>
                        </div>

                        <div className="my-1 border-t border-border/50 select-none" />

                        {/* Transaction Details */}
                        <div className="space-y-1.5 text-xs text-muted-foreground">
                            <div className="flex items-center justify-between">
                                <span>
                                    {t(
                                        'page.kasir.receipt_transaction_code',
                                        'Kode Transaksi',
                                    )}
                                </span>
                                <span className="font-bold text-foreground tabular-nums">
                                    INV/20260723/0001
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>
                                    {t(
                                        'page.kasir.receipt_payment_method',
                                        'Metode Pembayaran',
                                    )}
                                </span>
                                <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-semibold text-foreground uppercase">
                                    Cash
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>
                                    {t(
                                        'page.kasir.receipt_cashier',
                                        'Kasir',
                                    )}
                                </span>
                                <span className="font-medium text-foreground">
                                    {t('page.settings.store.receipt_preview.mock_cashier', 'Admin')}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>
                                    {t('page.kasir.receipt_date', 'Tanggal')}
                                </span>
                                <span className="font-medium text-foreground tabular-nums">
                                    23/07/2026 08:42
                                </span>
                            </div>
                        </div>

                        <div className="my-1 border-t border-border/50 select-none" />

                        {/* Table Column Headers */}
                        <div className="flex justify-between text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                            <span className="flex-1 text-left">
                                {t('page.kasir.receipt_item_name', 'Nama Barang')}
                            </span>
                            <span className="w-8 text-right">
                                {t('page.kasir.receipt_qty', 'Qty')}
                            </span>
                            <span className="w-16 text-right">
                                {t('page.kasir.receipt_price', 'Harga')}
                            </span>
                            <span className="w-20 text-right">
                                {t('page.kasir.receipt_total', 'Total')}
                            </span>
                        </div>

                        <div className="my-1 border-t border-dashed border-border/50 select-none" />

                        {/* Items List */}
                        <div className="space-y-3">
                            <div className="flex items-start justify-between gap-2 text-xs">
                                <div className="min-w-0 flex-1">
                                    <span className="block leading-snug font-semibold break-words text-foreground">
                                        {t('page.settings.store.receipt_preview.mock_item_1', 'Kopi Susu Gula Aren')}
                                    </span>
                                </div>
                                <span className="w-8 pt-0.5 text-right font-medium text-muted-foreground tabular-nums">
                                    1
                                </span>
                                <span className="w-16 pt-0.5 text-right font-medium text-muted-foreground tabular-nums">
                                    {formatPrice(18000)}
                                </span>
                                <span className="w-20 pt-0.5 text-right font-bold text-foreground tabular-nums">
                                    {formatPrice(18000)}
                                </span>
                            </div>
                            <div className="flex items-start justify-between gap-2 text-xs">
                                <div className="min-w-0 flex-1">
                                    <span className="block leading-snug font-semibold break-words text-foreground">
                                        {t('page.settings.store.receipt_preview.mock_item_2', 'Roti Bakar Cokelat')}
                                    </span>
                                </div>
                                <span className="w-8 pt-0.5 text-right font-medium text-muted-foreground tabular-nums">
                                    2
                                </span>
                                <span className="w-16 pt-0.5 text-right font-medium text-muted-foreground tabular-nums">
                                    {formatPrice(15000)}
                                </span>
                                <span className="w-20 pt-0.5 text-right font-bold text-foreground tabular-nums">
                                    {formatPrice(30000)}
                                </span>
                            </div>
                        </div>

                        <div className="my-1 border-t border-dashed border-border/50 select-none" />

                        {/* Totals Summary */}
                        <div className="space-y-2 border-t border-border/50 pt-3 text-xs">
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-foreground">
                                    {t('page.kasir.receipt_total', 'TOTAL')}
                                </span>
                                <span className="text-sm font-extrabold text-foreground tabular-nums">
                                    {formatPrice(48000)}
                                </span>
                            </div>

                            <div className="flex items-center justify-between text-muted-foreground">
                                <span>{t('page.kasir.receipt_pay', 'Bayar')}</span>
                                <span className="font-semibold text-foreground tabular-nums">
                                    {formatPrice(50000)}
                                </span>
                            </div>

                            <div className="flex items-center justify-between border-t border-border/20 pt-1">
                                <span className="font-bold text-foreground">
                                    {t('page.kasir.receipt_change', 'Kembalian')}
                                </span>
                                <span className="text-sm font-extrabold text-foreground tabular-nums">
                                    {formatPrice(2000)}
                                </span>
                            </div>
                        </div>

                        <div className="my-1 border-t border-border/50 select-none" />

                        {/* Receipt Custom Header / Footer */}
                        <div className="text-center space-y-2 text-zinc-500 dark:text-zinc-400">
                            {receiptHeader && (
                                <p className="whitespace-pre-wrap border-b border-dotted border-border/20 pb-1.5 leading-normal">
                                    {receiptHeader}
                                </p>
                            )}
                            <div className="pt-1 text-center">
                                <p className="text-[10px] font-bold tracking-wider text-muted-foreground/80 uppercase">
                                    {t(
                                        'page.kasir.receipt_thank_you',
                                        'TERIMA KASIH. SELAMAT BELANJA KEMBALI',
                                    )}
                                </p>
                            </div>
                            {receiptFooter && (
                                <p className="whitespace-pre-wrap border-t border-dotted border-border/20 pt-1.5 leading-normal">
                                    {receiptFooter}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

Store.layout = {
    breadcrumbs: [
        {
            title: i18next.t(
                'page.settings.store.title',
                'Pengaturan toko',
            ),
            href: editStore(),
        },
    ],
};
