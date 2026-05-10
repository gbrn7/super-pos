import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import DeleteUser from '@/components/delete-user';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { edit } from '@/routes/profile';
import { send } from '@/routes/verification';
import { Form, Head, Link, usePage } from '@inertiajs/react';
import i18next from 'i18next';
import { useTranslation } from 'react-i18next';

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { t } = useTranslation();
    const { auth } = usePage().props;

    return (
        <>
            <Head title={t("page.settings.profile.title", "Pengaturan profile")} />

            <h1 className="sr-only">{t("page.settings.profile.title", "Pengaturan profile")}</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title={t("page.settings.profile.heading_title", "Informasi Profil")}
                    description={t("page.settings.profile.description", "Perbarui nama dan alamat email Anda")}
                />

                <Form
                    {...ProfileController.update.form()}
                    options={{
                        preserveScroll: true,
                    }}
                    className="space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="name">{t("page.settings.profile.form.name_input_label", "Nama")}</Label>

                                <Input
                                    id="name"
                                    className="mt-1 block w-full"
                                    defaultValue={auth.user.name}
                                    name="name"
                                    required
                                    autoComplete="name"
                                    placeholder={t("page.settings.profile.form.name_input_placeholder", "Masukkan nama")}
                                />

                                <InputError
                                    className="mt-2"
                                    message={errors.name}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">{t("page.settings.profile.form.email_input_label", "Email")}</Label>

                                <Input
                                    id="email"
                                    type="email"
                                    className="mt-1 block w-full"
                                    defaultValue={auth.user.email}
                                    name="email"
                                    required
                                    autoComplete="username"
                                    placeholder={t("page.settings.profile.form.email_input_placeholder", "Masukkan alamat email")}
                                />

                                <InputError
                                    className="mt-2"
                                    message={errors.email}
                                />
                            </div>

                            {mustVerifyEmail &&
                                auth.user.email_verified_at === null && (
                                    <div>
                                        <p className="-mt-4 text-sm text-muted-foreground">
                                            {t("page.settings.profile.form.your_email_unverified", "Alamat email Anda belum terverifikasi.")} {' '}
                                            <Link
                                                href={send()}
                                                as="button"
                                                className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                            >
                                                {t("page.settings.profile.form.click_to_resend_verification_email", "Klik di sini untuk mengirim ulang email verifikasi.")}
                                            </Link>
                                        </p>

                                        {status ===
                                            'verification-link-sent' && (
                                                <div className="mt-2 text-sm font-medium text-green-600">
                                                    {t("page.settings.profile.form.verification_status", "Tautan verifikasi baru telah dikirim ke alamat email Anda.")}
                                                </div>
                                            )}
                                    </div>
                                )}

                            <div className="flex items-center gap-4">
                                <Button
                                    disabled={processing}
                                    data-test="update-profile-button"
                                >
                                    {t("page.settings.profile.form.save_btn", "Simpan")}
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>

            <DeleteUser />
        </>
    );
}

Profile.layout = {
    breadcrumbs: [
        {
            title: i18next.t("page.settings.profile.title", "Pengaturan profil"),
            href: edit(),
        },
    ],
};
