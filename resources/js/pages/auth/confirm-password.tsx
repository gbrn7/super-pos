import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/password/confirm';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';

export default function ConfirmPassword() {
    const { t } = useTranslation()

    return (
        <>
            <Head title={t("page.auth.confirm_password.title", "Konfirmasi Password")} />

            <Form {...store.form()} resetOnSuccess={['password']}>
                {({ processing, errors }) => (
                    <div className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="password">{t("page.auth.confirm_password.form.password_input_label", "Password")}</Label>
                            <PasswordInput
                                id="password"
                                name="password"
                                placeholder="Password"
                                autoComplete="current-password"
                                autoFocus
                            />

                            <InputError message={errors.password} />
                        </div>

                        <div className="flex items-center">
                            <Button
                                className="w-full"
                                disabled={processing}
                                data-test="confirm-password-button"
                            >
                                {processing && <Spinner />}
                                {t("page.auth.confirm_password.form.confirm_password_btn", "Konfirmasi Password")}
                            </Button>
                        </div>
                    </div>
                )}
            </Form>
        </>
    );
}

ConfirmPassword.layout = {
    title: i18next.t("page.auth.confirm_password.title", "Konfirmasi password anda"),
    description:
        i18next.t("page.auth.confirm_password.description", "Ini adalah area aman dalam aplikasi. Harap konfirmasi kata sandi Anda sebelum melanjutkan."),
};
