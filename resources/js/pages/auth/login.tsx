import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import i18next, { t } from 'i18next';

type Props = {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
};

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: Props) {
    return (
        <>
            <Head title={t('page.auth.login.title', 'Masuk ke akun Anda')} />

            {status && (
                <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-center text-sm font-medium text-green-700 dark:bg-green-950/30 dark:border-green-800 dark:text-green-400">
                    {status}
                </div>
            )}

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-5"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-5">
                            {/* Email */}
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="email"
                                    className="text-sm font-medium text-foreground"
                                >
                                    {t(
                                        'page.auth.login.form.email_input_label',
                                        'Email',
                                    )}
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="email@example.com"
                                    className="h-11 transition-shadow focus-visible:ring-orange-500/50"
                                />
                                <InputError message={errors.email} />
                            </div>

                            {/* Password */}
                            <div className="grid gap-2">
                                <div className="flex items-center justify-between">
                                    <Label
                                        htmlFor="password"
                                        className="text-sm font-medium text-foreground"
                                    >
                                        {t(
                                            'page.auth.login.form.password_input_label',
                                            'Password',
                                        )}
                                    </Label>
                                </div>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="Password"
                                    className="h-11 transition-shadow focus-visible:ring-orange-500/50"
                                />
                                <InputError message={errors.password} />
                            </div>

                            {/* Remember me */}
                            <div className="flex items-center space-x-2.5">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                    className="border-border data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                                />
                                <Label
                                    htmlFor="remember"
                                    className="cursor-pointer text-sm text-muted-foreground select-none"
                                >
                                    {t(
                                        'page.auth.login.remember_me',
                                        'Ingat saya',
                                    )}
                                </Label>
                            </div>

                            {/* Submit */}
                            <Button
                                type="submit"
                                className="mt-2 h-11 w-full bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700 transition-colors font-semibold shadow-sm cursor-pointer"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing && <Spinner className="mr-2" />}
                                {t('page.auth.login.form.login_btn', 'Masuk')}
                            </Button>
                        </div>

                    </>
                )}
            </Form>
        </>
    );
}

Login.layout = {
    title: i18next.t('page.auth.login.title', 'Selamat datang kembali!'),
    description: i18next.t(
        'page.auth.login.description',
        'Masuk ke akun Anda untuk mengelola transaksi dan laporan bisnis.',
    ),
};
