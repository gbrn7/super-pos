import { Form, Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useAppearance } from '@/hooks/use-appearance';
import { store } from '@/routes/login';
import i18next, { t } from 'i18next';
import { Check, ChevronDown, Globe, Monitor, Moon, Sun } from 'lucide-react';
import { localStorageKey } from '@/constants/Index';

type Props = {
    status?: string;
    canResetPassword?: boolean;
    canRegister?: boolean;
};

export default function Login({
    status,
}: Props) {
    const { i18n } = useTranslation();
    const { appearance, updateAppearance } = useAppearance();
    const [mode, setMode] = useState<'login' | 'recovery_code' | 'create_superadmin'>('login');
    const [recoveryCode, setRecoveryCode] = useState('');
    const [recoveryError, setRecoveryError] = useState('');
    const [isVerifyingCode, setIsVerifyingCode] = useState(false);

    const [superadminForm, setSuperadminForm] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });
    const [superadminErrors, setSuperadminErrors] = useState<Record<string, string>>({});
    const [isCreatingSuperadmin, setIsCreatingSuperadmin] = useState(false);

    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setRecoveryError('');
        setIsVerifyingCode(true);

        try {
            const response = await fetch('/api/recovery/verify-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
                body: JSON.stringify({ recovery_code: recoveryCode }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setMode('create_superadmin');
            } else {
                setRecoveryError(data.errors?.recovery_code?.[0] || data.message || t('recovery.code_invalid', 'Kode pemulihan salah'));
            }
        } catch (error) {
            setRecoveryError(t('recovery.network_error', 'Gagal terhubung ke server'));
        } finally {
            setIsVerifyingCode(false);
        }
    };

    const handleCreateSuperadmin = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuperadminErrors({});
        setIsCreatingSuperadmin(true);

        try {
            const response = await fetch('/api/recovery/create-superadmin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
                body: JSON.stringify(superadminForm),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                router.visit(data.redirect || '/dashboard');
            } else if (response.status === 422 && data.errors) {
                const formattedErrors: Record<string, string> = {};
                Object.keys(data.errors).forEach((key) => {
                    formattedErrors[key] = data.errors[key][0];
                });
                setSuperadminErrors(formattedErrors);
            } else {
                setSuperadminErrors({ general: data.message || t('recovery.failed', 'Gagal membuat superadmin') });
            }
        } catch (error) {
            setSuperadminErrors({ general: t('recovery.network_error', 'Gagal terhubung ke server') });
        } finally {
            setIsCreatingSuperadmin(false);
        }
    };

    const handleLanguageChange = (lang: string) => {
        i18n.changeLanguage(lang);
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(localStorageKey.LanguageKey, lang);
        }
    };

    return (
        <>
            <Head title={
                mode === 'login'
                    ? t('page.auth.login.title', 'Masuk ke akun Anda')
                    : mode === 'recovery_code'
                        ? t('recovery.step1_title', 'Pemulihan Akun Owner')
                        : t('recovery.step2_title', 'Buat Akun Owner Baru')
            } />

            {/* Top Bar Actions: Language & Theme Switcher */}
            <div className="absolute top-4 right-4 flex items-center space-x-3">
                {/* Appearance Segmented Toggle Tab */}
                <div className="inline-flex gap-1 rounded-lg bg-slate-200 dark:bg-slate-800 p-1 border border-slate-300 dark:border-slate-700">
                    <button
                        type="button"
                        onClick={() => updateAppearance('light')}
                        className={`flex items-center rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${appearance === 'light'
                            ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                            : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                            }`}
                        title="Light Mode"
                    >
                        <Sun className="h-3.5 w-3.5 mr-1 text-amber-500" />
                        <span>{t('theme.light', 'Terang')}</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => updateAppearance('dark')}
                        className={`flex items-center rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${appearance === 'dark'
                            ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                            : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                            }`}
                        title="Dark Mode"
                    >
                        <Moon className="h-3.5 w-3.5 mr-1 text-indigo-400" />
                        <span>{t('theme.dark', 'Gelap')}</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => updateAppearance('system')}
                        className={`flex items-center rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${appearance === 'system'
                            ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                            : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                            }`}
                        title="System Mode"
                    >
                        <Monitor className="h-3.5 w-3.5 mr-1 text-primary" />
                        <span>{t('theme.system', 'Sistem')}</span>
                    </button>
                </div>

                {/* Language Selection Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center space-x-1.5">
                            <Globe className="w-4 h-4 text-primary" />
                            <span className="font-semibold">{i18n.language === 'id' ? 'Indonesia' : 'English'}</span>
                            <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                        <DropdownMenuItem onClick={() => handleLanguageChange('id')} className="flex items-center justify-between cursor-pointer">
                            <span>Bahasa Indonesia</span>
                            {i18n.language === 'id' && <Check className="w-4 h-4 text-primary" />}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleLanguageChange('en')} className="flex items-center justify-between cursor-pointer">
                            <span>English</span>
                            {i18n.language === 'en' && <Check className="w-4 h-4 text-primary" />}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {status && mode === 'login' && (
                <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-center text-sm font-medium text-green-700 dark:bg-green-950/30 dark:border-green-800 dark:text-green-400">
                    {status}
                </div>
            )}

            {mode === 'login' && (
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
                                    <Label htmlFor="email" className="text-sm font-medium text-foreground">
                                        {t('page.auth.login.form.email_input_label', 'Email')}
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
                                        <Label htmlFor="password" className="text-sm font-medium text-foreground">
                                            {t('page.auth.login.form.password_input_label', 'Password')}
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
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2.5">
                                        <Checkbox
                                            id="remember"
                                            name="remember"
                                            tabIndex={3}
                                            className="border-border data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                                        />
                                        <Label htmlFor="remember" className="cursor-pointer text-sm text-muted-foreground select-none">
                                            {t('page.auth.login.remember_me', 'Ingat saya')}
                                        </Label>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setMode('recovery_code')}
                                        className="text-xs text-orange-500 hover:text-orange-600 font-medium underline underline-offset-4 cursor-pointer"
                                    >
                                        {t('recovery.forgot_link', 'Lupa Email / Password?')}
                                    </button>
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
            )}

            {mode === 'recovery_code' && (
                <form onSubmit={handleVerifyCode} className="flex flex-col gap-5">
                    <div className="grid gap-4 text-center mb-1">
                        <h2 className="text-xl font-bold text-foreground">
                            {t('recovery.step1_title', 'Verifikasi Kode Pemulihan')}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            {t('recovery.step1_desc', 'Masukkan kode pemulihan')}
                        </p>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="recovery_code" className="text-sm font-medium text-foreground">
                            {t('recovery.code_label', 'Kode Pemulihan')}
                        </Label>
                        <Input
                            id="recovery_code"
                            type="password"
                            value={recoveryCode}
                            onChange={(e) => setRecoveryCode(e.target.value)}
                            required
                            autoFocus
                            placeholder="******"
                            className="h-11 transition-shadow focus-visible:ring-orange-500/50"
                        />
                        <InputError message={recoveryError} />
                    </div>

                    <Button
                        type="submit"
                        className="mt-2 h-11 w-full bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700 transition-colors font-semibold shadow-sm cursor-pointer"
                        disabled={isVerifyingCode}
                    >
                        {isVerifyingCode && <Spinner className="mr-2" />}
                        {t('recovery.verify_btn', 'Verifikasi Kode')}
                    </Button>

                    <button
                        type="button"
                        onClick={() => {
                            setMode('login');
                            setRecoveryError('');
                        }}
                        className="text-sm text-muted-foreground hover:text-foreground font-medium text-center cursor-pointer mt-1"
                    >
                        ← {t('recovery.back_to_login', 'Kembali ke Login')}
                    </button>
                </form>
            )}

            {mode === 'create_superadmin' && (
                <form onSubmit={handleCreateSuperadmin} className="flex flex-col gap-4">
                    <div className="grid gap-1 text-center mb-1">
                        <h2 className="text-xl font-bold text-foreground">
                            {t('recovery.step2_title', 'Buat Superadmin Baru')}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            {t('recovery.step2_desc', 'Isi data berikut untuk membuat akun Superadmin baru.')}
                        </p>
                    </div>

                    {superadminErrors.general && (
                        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-center text-sm font-medium text-red-700 dark:bg-red-950/30 dark:border-red-800 dark:text-red-400">
                            {superadminErrors.general}
                        </div>
                    )}

                    <div className="grid gap-2">
                        <Label htmlFor="name" className="text-sm font-medium text-foreground">
                            {t('recovery.name_label', 'Nama Lengkap')}
                        </Label>
                        <Input
                            id="name"
                            type="text"
                            value={superadminForm.name}
                            onChange={(e) => setSuperadminForm({ ...superadminForm, name: e.target.value })}
                            required
                            autoFocus
                            placeholder="Superadmin"
                            className="h-11 transition-shadow focus-visible:ring-orange-500/50"
                        />
                        <InputError message={superadminErrors.name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="superadmin_email" className="text-sm font-medium text-foreground">
                            {t('recovery.email_label', 'Email')}
                        </Label>
                        <Input
                            id="superadmin_email"
                            type="email"
                            value={superadminForm.email}
                            onChange={(e) => setSuperadminForm({ ...superadminForm, email: e.target.value })}
                            required
                            placeholder="admin@example.com"
                            className="h-11 transition-shadow focus-visible:ring-orange-500/50"
                        />
                        <InputError message={superadminErrors.email} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="superadmin_password" className="text-sm font-medium text-foreground">
                            {t('recovery.password_label', 'Password Baru')}
                        </Label>
                        <PasswordInput
                            id="superadmin_password"
                            value={superadminForm.password}
                            onChange={(e) => setSuperadminForm({ ...superadminForm, password: e.target.value })}
                            required
                            placeholder="Password"
                            className="h-11 transition-shadow focus-visible:ring-orange-500/50"
                        />
                        <InputError message={superadminErrors.password} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation" className="text-sm font-medium text-foreground">
                            {t('recovery.confirm_password_label', 'Konfirmasi Password')}
                        </Label>
                        <PasswordInput
                            id="password_confirmation"
                            value={superadminForm.password_confirmation}
                            onChange={(e) => setSuperadminForm({ ...superadminForm, password_confirmation: e.target.value })}
                            required
                            placeholder="Konfirmasi Password"
                            className="h-11 transition-shadow focus-visible:ring-orange-500/50"
                        />
                        <InputError message={superadminErrors.password_confirmation} />
                    </div>

                    <Button
                        type="submit"
                        className="mt-2 h-11 w-full bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700 transition-colors font-semibold shadow-sm cursor-pointer"
                        disabled={isCreatingSuperadmin}
                    >
                        {isCreatingSuperadmin && <Spinner className="mr-2" />}
                        {t('recovery.submit_btn', 'Buat & Masuk Akun')}
                    </Button>
                </form>
            )}
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
