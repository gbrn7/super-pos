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
import ReceiptCard from '@/components/receipt-card';

interface StoreSetting {
    id: number;
    name: string;
    address: string;
    phone: string;
    email: string | null;
    tax_number: string | null;
    receipt_footer: string | null;
}

export default function Store({ storeSetting }: { storeSetting: StoreSetting }) {
    const { t } = useTranslation();

    // Local state to bind fields for real-time receipt preview
    const [name, setName] = useState(storeSetting.name);
    const [address, setAddress] = useState(storeSetting.address);
    const [phone, setPhone] = useState(storeSetting.phone);
    const [receiptFooter, setReceiptFooter] = useState(storeSetting.receipt_footer || '');

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
                    <ReceiptCard
                        storeName={name}
                        storeAddress={address}
                        storePhone={phone}
                        storeReceiptFooter={receiptFooter}
                        isPreview={true}
                    />
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
