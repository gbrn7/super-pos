import React, { useState } from 'react';
import { useForm, Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { CheckCircle2, AlertCircle, Loader2, Database, Store, UserCheck, Rocket, ChevronDown, Settings2, Globe } from 'lucide-react';

export default function SetupWizard() {
    const { t, i18n } = useTranslation();
    const [currentStep, setCurrentStep] = useState<number>(1);
    const [dbTested, setDbTested] = useState<boolean>(false);
    const [dbLoading, setDbLoading] = useState<boolean>(false);
    const [dbMessage, setDbMessage] = useState<string | null>(null);
    const [isMigrated, setIsMigrated] = useState<boolean>(false);
    const [migrating, setMigrating] = useState<boolean>(false);
    const [isDbFormOpen, setIsDbFormOpen] = useState<boolean>(false);

    // Database Credentials State with requested defaults
    const [dbCredentials, setDbCredentials] = useState({
        db_connection: 'pgsql',
        db_host: '127.0.0.1',
        db_port: '5433',
        db_database: 'super_pos',
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
        return (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';
    };

    const handleDbCredentialChange = (field: string, value: string) => {
        setDbCredentials((prev) => ({ ...prev, [field]: value }));
    };

    const toggleLanguage = () => {
        const nextLang = i18n.language === 'id' ? 'en' : 'id';
        i18n.changeLanguage(nextLang);
    };

    const handleTestDb = async () => {
        setDbLoading(true);
        setDbMessage(null);
        try {
            const res = await fetch('/setup/test-db', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
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
            const res = await fetch('/setup/migrate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
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

    const handleSubmitComplete = (e: React.FormEvent) => {
        e.preventDefault();
        post('/setup/complete');
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 relative">
            <Head title={t('setup.title')} />

            {/* Language Switcher */}
            <div className="absolute top-4 right-4">
                <Button variant="outline" size="sm" onClick={toggleLanguage} className="bg-slate-900 border-slate-800 text-slate-300 hover:text-white flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-primary" />
                    <span className="font-semibold uppercase">{i18n.language === 'id' ? 'ID' : 'EN'}</span>
                </Button>
            </div>

            <div className="w-full max-w-2xl mb-6 text-center">
                <h1 className="text-3xl font-bold tracking-tight text-white mb-2">{t('setup.title')}</h1>
                <p className="text-slate-400">{t('setup.subtitle')}</p>
            </div>

            {/* Stepper Navigation */}
            <div className="w-full max-w-2xl flex items-center justify-between mb-8 px-4">
                <div className={`flex items-center space-x-2 ${currentStep >= 1 ? 'text-primary' : 'text-slate-600'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${currentStep === 1 ? 'bg-primary text-primary-foreground' : currentStep > 1 ? 'bg-emerald-600 text-white' : 'bg-slate-800'}`}>
                        1
                    </div>
                    <span className="font-medium hidden sm:inline">{t('setup.stepper.database')}</span>
                </div>
                <div className="flex-1 h-0.5 mx-4 bg-slate-800">
                    <div className={`h-full bg-primary transition-all ${currentStep > 1 ? 'w-full' : 'w-0'}`} />
                </div>
                <div className={`flex items-center space-x-2 ${currentStep >= 2 ? 'text-primary' : 'text-slate-600'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${currentStep === 2 ? 'bg-primary text-primary-foreground' : currentStep > 2 ? 'bg-emerald-600 text-white' : 'bg-slate-800'}`}>
                        2
                    </div>
                    <span className="font-medium hidden sm:inline">{t('setup.stepper.store')}</span>
                </div>
                <div className="flex-1 h-0.5 mx-4 bg-slate-800">
                    <div className={`h-full bg-primary transition-all ${currentStep > 2 ? 'w-full' : 'w-0'}`} />
                </div>
                <div className={`flex items-center space-x-2 ${currentStep >= 3 ? 'text-primary' : 'text-slate-600'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${currentStep === 3 ? 'bg-primary text-primary-foreground' : 'bg-slate-800'}`}>
                        3
                    </div>
                    <span className="font-medium hidden sm:inline">{t('setup.stepper.owner')}</span>
                </div>
            </div>

            <Card className="w-full max-w-2xl bg-slate-900 border-slate-800 text-slate-100">
                {currentStep === 1 && (
                    <>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Database className="w-5 h-5 text-primary" />
                                <span>{t('setup.step1.title')}</span>
                            </CardTitle>
                            <CardDescription className="text-slate-400">{t('setup.step1.description')}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {dbMessage && (
                                <Alert className={dbTested || isMigrated ? 'bg-emerald-950/50 border-emerald-800 text-emerald-300' : 'bg-destructive/10 border-destructive/20 text-destructive'}>
                                    {dbTested || isMigrated ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                                    <AlertTitle>{dbTested || isMigrated ? 'Success' : 'Error'}</AlertTitle>
                                    <AlertDescription>{dbMessage}</AlertDescription>
                                </Alert>
                            )}

                            {/* Collapsible Database Credentials Form */}
                            <Collapsible open={isDbFormOpen} onOpenChange={setIsDbFormOpen} className="border border-slate-800 rounded-lg p-3 bg-slate-950/50">
                                <CollapsibleTrigger asChild>
                                    <Button variant="ghost" className="w-full flex justify-between items-center text-sm font-medium text-slate-300 hover:text-white">
                                        <div className="flex items-center space-x-2">
                                            <Settings2 className="w-4 h-4 text-primary" />
                                            <span>{t('setup.step1.db_config')}</span>
                                        </div>
                                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isDbFormOpen ? 'rotate-180' : ''}`} />
                                    </Button>
                                </CollapsibleTrigger>
                                <CollapsibleContent className="space-y-3 pt-3 mt-2 border-t border-slate-800">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <Label htmlFor="db_connection" className="text-xs">{t('setup.step1.driver')}</Label>
                                            <Input id="db_connection" value={dbCredentials.db_connection} onChange={(e) => handleDbCredentialChange('db_connection', e.target.value)} placeholder="pgsql" />
                                        </div>
                                        <div className="space-y-1">
                                            <Label htmlFor="db_host" className="text-xs">{t('setup.step1.host')}</Label>
                                            <Input id="db_host" value={dbCredentials.db_host} onChange={(e) => handleDbCredentialChange('db_host', e.target.value)} placeholder="127.0.0.1" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <Label htmlFor="db_port" className="text-xs">{t('setup.step1.port')}</Label>
                                            <Input id="db_port" value={dbCredentials.db_port} onChange={(e) => handleDbCredentialChange('db_port', e.target.value)} placeholder="5433" />
                                        </div>
                                        <div className="space-y-1">
                                            <Label htmlFor="db_database" className="text-xs">{t('setup.step1.database_name')}</Label>
                                            <Input id="db_database" value={dbCredentials.db_database} onChange={(e) => handleDbCredentialChange('db_database', e.target.value)} placeholder="super_pos" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <Label htmlFor="db_username" className="text-xs">{t('setup.step1.username')}</Label>
                                            <Input id="db_username" value={dbCredentials.db_username} onChange={(e) => handleDbCredentialChange('db_username', e.target.value)} placeholder="postgres" />
                                        </div>
                                        <div className="space-y-1">
                                            <Label htmlFor="db_password" className="text-xs">{t('setup.step1.password')}</Label>
                                            <Input id="db_password" type="password" value={dbCredentials.db_password} onChange={(e) => handleDbCredentialChange('db_password', e.target.value)} placeholder="admin" />
                                        </div>
                                    </div>
                                </CollapsibleContent>
                            </Collapsible>

                            <div className="flex flex-col gap-3 pt-2">
                                <Button onClick={handleTestDb} disabled={dbLoading || migrating} variant="outline">
                                    {dbLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                    {t('setup.step1.test_connection')}
                                </Button>
                                <Button onClick={handleMigrate} disabled={!dbTested || migrating || isMigrated} className="w-full">
                                    {migrating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                    {isMigrated ? t('setup.step1.migrated_seeded') : t('setup.step1.run_migration')}
                                </Button>
                            </div>
                        </CardContent>
                        <CardFooter className="justify-end pt-6 border-t border-slate-800/50 mt-4">
                            <Button onClick={() => setCurrentStep(2)} disabled={!isMigrated}>
                                {t('setup.step1.next_step')}
                            </Button>
                        </CardFooter>
                    </>
                )}

                {currentStep === 2 && (
                    <>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Store className="w-5 h-5 text-primary" />
                                <span>{t('setup.step2.title')}</span>
                            </CardTitle>
                            <CardDescription className="text-slate-400">{t('setup.step2.description')}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="store_name">{t('setup.step2.store_name')}</Label>
                                <Input id="store_name" value={data.store_name} onChange={(e) => setData('store_name', e.target.value)} placeholder="e.g. Toko Berkah POS" />
                                {errors.store_name && <p className="text-sm text-destructive">{errors.store_name}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="store_address">{t('setup.step2.store_address')}</Label>
                                <Input id="store_address" value={data.store_address} onChange={(e) => setData('store_address', e.target.value)} placeholder="Jl. Raya Utama No. 123" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="currency">{t('setup.step2.currency')}</Label>
                                    <Input id="currency" value={data.currency} onChange={(e) => setData('currency', e.target.value)} placeholder="Rp" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="timezone">{t('setup.step2.timezone')}</Label>
                                    <Input id="timezone" value={data.timezone} onChange={(e) => setData('timezone', e.target.value)} placeholder="Asia/Jakarta" />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="justify-between pt-6 border-t border-slate-800/50 mt-4">
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
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <UserCheck className="w-5 h-5 text-primary" />
                                <span>{t('setup.step3.title')}</span>
                            </CardTitle>
                            <CardDescription className="text-slate-400">{t('setup.step3.description')}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
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
                                    <Input id="password" type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} placeholder="••••••••" />
                                    {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password_confirmation">{t('setup.step3.confirm_password')}</Label>
                                    <Input id="password_confirmation" type="password" value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)} placeholder="••••••••" />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="justify-between pt-6 border-t border-slate-800/50 mt-4">
                            <Button type="button" variant="outline" onClick={() => setCurrentStep(2)}>
                                {t('setup.step3.back')}
                            </Button>
                            <Button type="submit" disabled={processing} className="bg-emerald-600 hover:bg-emerald-500 text-white">
                                {processing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Rocket className="w-4 h-4 mr-2" />}
                                {t('setup.step3.complete_launch')}
                            </Button>
                        </CardFooter>
                    </form>
                )}
            </Card>
        </div>
    );
}
