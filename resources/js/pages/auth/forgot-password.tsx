// Components
import { Form, Head } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { login } from '@/routes';
import { email } from '@/routes/password';
import i18next from 'i18next';
import { useTranslation } from 'react-i18next';

export default function ForgotPassword({ status }: { status?: string }) {
    const { t } = useTranslation();
    return (
        <>
            <Head title={t("page.auth.forgot_password.title", "Lupa Password")} />

            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <div className="space-y-6">
                <Form {...email.form()}>
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="email">{t("page.auth.forgot_password.form.email_input_label", "Email")}</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    autoComplete="off"
                                    autoFocus
                                    placeholder="email@example.com"
                                />

                                <InputError message={errors.email} />
                            </div>

                            <div className="my-6 flex items-center justify-start">
                                <Button
                                    className="w-full"
                                    disabled={processing}
                                    data-test="email-password-reset-link-button"
                                >
                                    {processing && (
                                        <LoaderCircle className="h-4 w-4 animate-spin" />
                                    )}
                                    {t("page.auth.forgot_password.form.confirm_forgot_password_btn", "Tautan setel ulang password email")}
                                </Button>
                            </div>
                        </>
                    )}
                </Form>

                <div className="space-x-1 text-center text-sm text-muted-foreground">
                    <span>{t("page.auth.forgot_password.or_return_to", "Atau, kembali ke")}</span>
                    <TextLink href={login()}>{t("page.auth.forgot_password.login_btn", "Log in")}</TextLink>
                </div>
            </div>
        </>
    );
}

ForgotPassword.layout = {
    title: i18next.t("page.auth.forgot_password.title", "Konfirmasi password anda"),
    description: i18next.t("page.auth.forgot_password.description", "Ini adalah area aman dalam aplikasi. Harap konfirmasi kata sandi Anda sebelum melanjutkan."),
};
