import React, { useState } from 'react';
import { useForm, Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { CheckCircle2, AlertCircle, Loader2, Database, Store, UserCheck, Rocket, ChevronDown, Settings2, Globe, Eye, EyeOff, Sun, Moon, Monitor, Upload, FileSpreadsheet, X, FileCheck, Check } from 'lucide-react';
import SetupController from '@/actions/App/Http/Controllers/SetupController';
import { login } from '@/routes';
import { useAppearance, Appearance } from '@/hooks/use-appearance';

export default function SetupWizard() {
    const { t, i18n } = useTranslation();
    const { appearance, updateAppearance } = useAppearance();
    const [currentStep, setCurrentStep] = useState<number>(1);
    const [dbTested, setDbTested] = useState<boolean>(false);
    const [dbLoading, setDbLoading] = useState<boolean>(false);
    const [dbMessage, setDbMessage] = useState<string | null>(null);
    const [isMigrated, setIsMigrated] = useState<boolean>(false);
    const [migrating, setMigrating] = useState<boolean>(false);
    const [isDbFormOpen, setIsDbFormOpen] = useState<boolean>(false);
    const [isUploadFormOpen, setIsUploadFormOpen] = useState<boolean>(false);
    const [showDbPassword, setShowDbPassword] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
    const [customFile, setCustomFile] = useState<{ name: string; size: string } | null>(null);
    const [uploadingFile, setUploadingFile] = useState<boolean>(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [isCompleted, setIsCompleted] = useState<boolean>(false);

    // Database Credentials State with requested defaults
    const [dbCredentials, setDbCredentials] = useState({
        db_connection: 'sqlite',
        db_host: '127.0.0.1',
        db_port: '5432',
        db_database: 'database/database.sqlite',
        db_username: 'postgres',
        db_password: 'admin',
    });

    const { data, setData, post, processing, errors } = useForm({
        store_name: '',
        store_address: '',
        store_phone: '',
        currency: 'Rp',
        timezone: 'Asia/Jakarta',
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const getCsrfToken = () => {
        const metaToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;
        if (metaToken) return metaToken;

        const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
        return match ? decodeURIComponent(match[1]) : '';
    };

    const handleDbCredentialChange = (field: string, value: string) => {
        setDbCredentials((prev) => {
            const next = { ...prev, [field]: value };
            if (field === 'db_connection') {
                if (value === 'sqlite') {
                    next.db_database = 'database/database.sqlite';
                } else {
                    next.db_database = 'praktis_pos';
                    if (value === 'mysql') {
                        next.db_port = '3306';
                        next.db_username = 'admin';
                    } else if (value === 'pgsql') {
                        next.db_port = '5432';
                        next.db_username = 'postgres';
                    }
                }
            }
            return next;
        });
    };


    const cycleTheme = () => {
        const nextTheme: Record<Appearance, Appearance> = {
            light: 'dark',
            dark: 'system',
            system: 'light',
        };
        updateAppearance(nextTheme[appearance] || 'light');
    };

    const handleTestDb = async () => {
        setDbLoading(true);
        setDbMessage(null);
        try {
            const res = await fetch(SetupController.testDatabase.url(), {
                method: SetupController.testDatabase.definition.methods[0].toUpperCase(),
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
                body: JSON.stringify(dbCredentials),
            });
            const result = await res.json();
            setDbTested(result.success);
            setDbMessage(result.message);
        } catch (e: any) {
            setDbTested(false);
            setDbMessage(e.message || 'Failed to connect to database');
        } finally {
            setDbLoading(false);
        }
    };

    const handleMigrate = async () => {
        setMigrating(true);
        setDbMessage(null);
        try {
            const res = await fetch(SetupController.runMigration.url(), {
                method: SetupController.runMigration.definition.methods[0].toUpperCase(),
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
            });
            const result = await res.json();
            setIsMigrated(result.success);
            setDbMessage(result.message);
        } catch (e: any) {
            setIsMigrated(false);
            setDbMessage(e.message || 'Migration failed');
        } finally {
            setMigrating(false);
        }
    };

    const handleCustomFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingFile(true);
        setUploadError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch(SetupController.uploadMasterProduct.url(), {
                method: SetupController.uploadMasterProduct.definition.methods[0].toUpperCase(),
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
                body: formData,
            });

            const result = await res.json();
            if (res.ok && result.success) {
                setCustomFile({ name: result.filename, size: result.size });
            } else {
                setUploadError(result.message || 'Gagal mengunggah file.');
            }
        } catch (err: any) {
            setUploadError(err.message || 'Terjadi kesalahan saat unggah file.');
        } finally {
            setUploadingFile(false);
        }
    };

    const handleCustomFileReset = async () => {
        try {
            await fetch(SetupController.resetMasterProduct.url(), {
                method: SetupController.resetMasterProduct.definition.methods[0].toUpperCase(),
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
            });
            setCustomFile(null);
            setUploadError(null);
        } catch (err) {
            console.error('Failed to reset custom file', err);
        }
    };

    const handleSubmitComplete = (e: React.FormEvent) => {
        e.preventDefault();
        post(SetupController.complete.url(), {
            onSuccess: () => {
                window.location.href = login.url();
            },
            onError: (errors) => {
                setCurrentStep(3);
                console.error('Setup completion errors:', errors);
            },
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-center items-center p-4 relative transition-colors duration-200">
            <Head title={t('setup.title')} />

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
                        <DropdownMenuItem onClick={() => i18n.changeLanguage('id')} className="flex items-center justify-between cursor-pointer">
                            <span>Bahasa Indonesia</span>
                            {i18n.language === 'id' && <Check className="w-4 h-4 text-primary" />}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => i18n.changeLanguage('en')} className="flex items-center justify-between cursor-pointer">
                            <span>English</span>
                            {i18n.language === 'en' && <Check className="w-4 h-4 text-primary" />}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="w-full max-w-2xl mb-3 text-center">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-1">{t('setup.title')}</h1>
                <p className="text-slate-600 dark:text-slate-400">{t('setup.subtitle')}</p>
            </div>

            {/* Stepper Navigation */}
            <div className="w-full max-w-2xl flex items-center justify-between mb-4 px-4">
                <div className={`flex items-center space-x-2 ${currentStep >= 1 ? 'text-primary' : 'text-slate-400 dark:text-slate-600'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${currentStep === 1 ? 'bg-primary text-primary-foreground' : currentStep > 1 ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                        1
                    </div>
                    <span className="font-medium hidden sm:inline">{t('setup.stepper.database')}</span>
                </div>
                <div className="flex-1 h-0.5 mx-4 bg-slate-200 dark:bg-slate-800">
                    <div className={`h-full bg-primary transition-all ${currentStep > 1 ? 'w-full' : 'w-0'}`} />
                </div>
                <div className={`flex items-center space-x-2 ${currentStep >= 2 ? 'text-primary' : 'text-slate-400 dark:text-slate-600'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${currentStep === 2 ? 'bg-primary text-primary-foreground' : currentStep > 2 ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                        2
                    </div>
                    <span className="font-medium hidden sm:inline">{t('setup.stepper.store')}</span>
                </div>
                <div className="flex-1 h-0.5 mx-4 bg-slate-200 dark:bg-slate-800">
                    <div className={`h-full bg-primary transition-all ${currentStep > 2 ? 'w-full' : 'w-0'}`} />
                </div>
                <div className={`flex items-center space-x-2 ${currentStep >= 3 ? 'text-primary' : 'text-slate-400 dark:text-slate-600'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${currentStep === 3 ? 'bg-primary text-primary-foreground' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                        3
                    </div>
                    <span className="font-medium hidden sm:inline">{t('setup.stepper.owner')}</span>
                </div>
            </div>

            <Card className="w-full max-w-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-sm dark:shadow-none">
                {currentStep === 1 && (
                    <>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center space-x-2">
                                <Database className="w-5 h-5 text-primary" />
                                <span>{t('setup.step1.title')}</span>
                            </CardTitle>
                            <CardDescription className="text-slate-600 dark:text-slate-400">{t('setup.step1.description')}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4">
                            {dbMessage && (
                                <Alert className={dbTested || isMigrated ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300' : 'bg-destructive/10 border-destructive/20 text-destructive'}>
                                    {dbTested || isMigrated ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                                    <AlertTitle>{dbTested || isMigrated ? 'Success' : 'Error'}</AlertTitle>
                                    <AlertDescription>{dbMessage}</AlertDescription>
                                </Alert>
                            )}

                            {/* SQLite Status Card */}
                            <div className="flex items-center justify-between p-3.5 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-lg text-sm">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 rounded-md">
                                        <Database className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-slate-800 dark:text-slate-200">{t('setup.step1.sqlite_info')}</h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">database/database.sqlite</p>
                                    </div>
                                </div>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300">
                                    Ready
                                </span>
                            </div>

                            {/* Custom Master Product File Upload (Optional) - Collapsible */}
                            <Collapsible open={isUploadFormOpen} onOpenChange={setIsUploadFormOpen} className="border border-slate-200 dark:border-slate-800 rounded-lg p-3 bg-slate-50 dark:bg-slate-950/50">
                                <CollapsibleTrigger asChild>
                                    <Button variant="ghost" className="w-full flex justify-between items-center text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white">
                                        <div className="flex items-center space-x-2">
                                            <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                            <span>{t('setup.step1.custom_catalog')}</span>
                                            {customFile && (
                                                <span className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                                                    <FileCheck className="w-3 h-3" /> {t('setup.step1.custom_catalog_active')}
                                                </span>
                                            )}
                                        </div>
                                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isUploadFormOpen ? 'rotate-180' : ''}`} />
                                    </Button>
                                </CollapsibleTrigger>
                                <CollapsibleContent className="space-y-3 pt-3 mt-2 border-t border-slate-200 dark:border-slate-800">
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {t('setup.step1.custom_catalog_desc')}
                                    </p>

                                    {uploadError && (
                                        <p className="text-xs text-destructive font-medium">{uploadError}</p>
                                    )}

                                    {customFile ? (
                                        <div className="flex items-center justify-between p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-md text-xs">
                                            <div className="flex items-center space-x-2 truncate">
                                                <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                                                <span className="font-medium text-emerald-900 dark:text-emerald-200 truncate">{customFile.name}</span>
                                                <span className="text-slate-400">({customFile.size})</span>
                                            </div>
                                            <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-slate-500 hover:text-destructive shrink-0" onClick={handleCustomFileReset}>
                                                <X className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center space-x-2 pt-1">
                                            <Label htmlFor="custom_master_file" className="cursor-pointer inline-flex items-center space-x-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 px-3 py-2 rounded-md font-medium text-slate-700 dark:text-slate-300 transition-colors shadow-xs">
                                                {uploadingFile ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : <Upload className="w-4 h-4 text-primary" />}
                                                <span>{uploadingFile ? t('setup.step1.uploading') : t('setup.step1.select_excel_file')}</span>
                                            </Label>
                                            <input id="custom_master_file" type="file" accept=".xlsx,.xls" className="hidden" onChange={handleCustomFileUpload} disabled={uploadingFile || migrating} />
                                        </div>
                                    )}
                                </CollapsibleContent>
                            </Collapsible>

                            <div className="pt-2">
                                <Button onClick={handleMigrate} disabled={migrating || isMigrated} className="w-full h-11 text-base font-semibold shadow-xs">
                                    {migrating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                    {isMigrated ? t('setup.step1.migrated_seeded') : t('setup.step1.run_migration')}
                                </Button>
                            </div>
                        </CardContent>
                        <CardFooter className="justify-end pt-4 border-t border-slate-200 dark:border-slate-800/50 mt-2">
                            <Button onClick={() => setCurrentStep(2)} disabled={!isMigrated}>
                                {t('setup.step1.next_step')}
                            </Button>
                        </CardFooter>
                    </>
                )}

                {currentStep === 2 && (
                    <>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center space-x-2">
                                <Store className="w-5 h-5 text-primary" />
                                <span>{t('setup.step2.title')}</span>
                            </CardTitle>
                            <CardDescription className="text-slate-600 dark:text-slate-400">{t('setup.step2.description')}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label htmlFor="store_name">{t('setup.step2.store_name')}</Label>
                                <Input id="store_name" value={data.store_name} onChange={(e) => setData('store_name', e.target.value)} placeholder="e.g. Toko Berkah POS" />
                                {errors.store_name && <p className="text-sm text-destructive">{errors.store_name}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="store_address">{t('setup.step2.store_address')}</Label>
                                <Input id="store_address" value={data.store_address} onChange={(e) => setData('store_address', e.target.value)} placeholder="Jl. Raya Utama No. 123" />
                            </div>
                        </CardContent>
                        <CardFooter className="justify-between pt-4 border-t border-slate-200 dark:border-slate-800/50 mt-2">
                            <Button variant="outline" onClick={() => setCurrentStep(1)}>
                                {t('setup.step2.back')}
                            </Button>
                            <Button onClick={() => setCurrentStep(3)} disabled={!data.store_name}>
                                {t('setup.step2.next_step')}
                            </Button>
                        </CardFooter>
                    </>
                )}

                {currentStep === 3 && (
                    <form onSubmit={handleSubmitComplete}>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center space-x-2">
                                <UserCheck className="w-5 h-5 text-primary" />
                                <span>{t('setup.step3.title')}</span>
                            </CardTitle>
                            <CardDescription className="text-slate-600 dark:text-slate-400">{t('setup.step3.description')}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4">
                            {Object.keys(errors).length > 0 && (
                                <Alert className="bg-destructive/10 border-destructive/20 text-destructive mb-4">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>{t('setup.step1.error_alert_title')}</AlertTitle>
                                    <AlertDescription>
                                        {Object.values(errors).join(', ')}
                                    </AlertDescription>
                                </Alert>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="name">{t('setup.step3.full_name')}</Label>
                                <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="John Doe" />
                                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">{t('setup.step3.email')}</Label>
                                <Input id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} placeholder="owner@example.com" />
                                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="password">{t('setup.step3.password')}</Label>
                                    <div className="relative">
                                        <Input id="password" type={showPassword ? 'text' : 'password'} value={data.password} onChange={(e) => setData('password', e.target.value)} placeholder="••••••••" className="pr-10" />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none">
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password_confirmation">{t('setup.step3.confirm_password')}</Label>
                                    <div className="relative">
                                        <Input id="password_confirmation" type={showConfirmPassword ? 'text' : 'password'} value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)} placeholder="••••••••" className="pr-10" />
                                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none">
                                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="justify-between pt-4 border-t border-slate-200 dark:border-slate-800/50 mt-2">
                            <Button type="button" variant="outline" onClick={() => setCurrentStep(2)}>
                                {t('setup.step3.back')}
                            </Button>
                            <Button
                                type={isCompleted ? 'button' : 'submit'}
                                disabled={processing}
                                onClick={isCompleted ? () => { window.location.href = login.url(); } : undefined}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white"
                            >
                                {processing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : (isCompleted ? <Check className="w-4 h-4 mr-2" /> : <Rocket className="w-4 h-4 mr-2" />)}
                                {isCompleted ? t('setup.step3.login_btn') : t('setup.step3.complete_launch')}
                            </Button>
                        </CardFooter>
                    </form>
                )}
            </Card>
        </div>
    );
}
