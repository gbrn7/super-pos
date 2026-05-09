// Components
import { Form, Head } from '@inertiajs/react';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { logout } from '@/routes';
import { send } from '@/routes/verification';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';

export default function VerifyEmail({ status }: { status?: string }) {
    const { t } = useTranslation()
    return (
        <>
            <Head title={t("page.auth.email_verification.title", "Verifikasi Email")} />

            {status === 'verification-link-sent' && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">{t("page.auth.email_verification.info", "Tautan verifikasi baru telah dikirim ke alamat email yang Anda berikan saat pendaftaran.")}</div>
            )}

            <Form {...send.form()} className="space-y-6 text-center">
                {({ processing }) => (
                    <>
                        <Button disabled={processing} variant="secondary">
                            {processing && <Spinner />}
                            {t("page.auth.email_verification.form.resend_email_btn", "Kirim ulang email verifikasi")}
                        </Button>

                        <TextLink
                            href={logout()}
                            className="mx-auto block text-sm"
                        >
                            {t("page.auth.email_verification.form.logout_btn", "Log out")}
                        </TextLink>
                    </>
                )}
            </Form>
        </>
    );
}

VerifyEmail.layout = {
    title: i18next.t("page.auth.email_verification.title", "Verifikasi Email"),
    description:
        i18next.t("page.auth.email_verification.description", "Silakan verifikasi alamat email Anda dengan mengklik tautan yang baru saja kami kirimkan melalui email."),
};
