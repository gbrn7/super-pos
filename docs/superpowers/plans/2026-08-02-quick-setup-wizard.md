# Quick Setup Wizard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a 3-step Quick Setup Wizard for application initialization (Database check & migration, Store settings, Owner Superadmin registration) with automatic middleware redirection based on `APP_INSTALLED` env flag.

**Architecture:** Laravel 13 backend with `EnsureAppIsNotInstalled` middleware and `SetupController`, paired with Inertia React v3 + Shadcn UI single-page multi-step wizard component.

**Tech Stack:** PHP 8.4, Laravel 13, Inertia.js v3 (React 19), Shadcn UI, Pest PHP v4.

## Global Constraints
- PHP Version: 8.4
- Laravel Version: 13
- Testing Framework: Pest PHP v4
- Frontend: Inertia React v3 with Tailwind CSS v4 and Shadcn UI
- Route helper: Wayfinder

---

### Task 1: Create Installation Middleware & Config Setup

**Files:**
- Modify: `config/app.php`
- Create: `app/Http/Middleware/EnsureAppIsNotInstalled.php`
- Modify: `bootstrap/app.php`
- Test: `tests/Feature/EnsureAppIsNotInstalledTest.php`

**Interfaces:**
- Consumes: `config('app.installed')` / `env('APP_INSTALLED', false)`
- Produces: Middleware `EnsureAppIsNotInstalled` (alias `app.not_installed`)

- [ ] **Step 1: Write the failing test for middleware**

```php
// tests/Feature/EnsureAppIsNotInstalledTest.php
<?php

use Illuminate\Support\Facades\Config;

test('redirects uninstalled app to setup route', function () {
    Config::set('app.installed', false);

    $response = $this->get('/dashboard');

    $response->assertRedirect(route('setup.index'));
});

test('allows setup route when app is not installed', function () {
    Config::set('app.installed', false);

    $response = $this->get(route('setup.index'));

    $response->assertStatus(200);
});

test('redirects setup route to dashboard when app is already installed', function () {
    Config::set('app.installed', true);

    $response = $this->get(route('setup.index'));

    $response->assertRedirect('/dashboard');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `php artisan test --compact --filter=EnsureAppIsNotInstalledTest`
Expected: FAIL (setup route not found or middleware not existing)

- [ ] **Step 3: Add `installed` config key & Create Middleware**

Add `'installed' => env('APP_INSTALLED', false),` in `config/app.php`.

Create `app/Http/Middleware/EnsureAppIsNotInstalled.php`:
```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAppIsNotInstalled
{
    public function handle(Request $request, Closure $next): Response
    {
        $isInstalled = (bool) config('app.installed', false);
        $isSetupRoute = $request->routeIs('setup.*');

        if (! $isInstalled && ! $isSetupRoute) {
            return redirect()->route('setup.index');
        }

        if ($isInstalled && $isSetupRoute) {
            return redirect()->to('/dashboard');
        }

        return $next($request);
    }
}
```

Register alias in `bootstrap/app.php`:
```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->alias([
        'app.not_installed' => \App\Http\Middleware\EnsureAppIsNotInstalled::class,
    ]);
})
```

- [ ] **Step 4: Run test to verify it passes**

Run: `php artisan test --compact --filter=EnsureAppIsNotInstalledTest`
Expected: PASS

- [ ] **Step 5: Run Pint code formatter & Commit**

```bash
vendor/bin/pint --dirty --format agent
git add config/app.php app/Http/Middleware/EnsureAppIsNotInstalled.php bootstrap/app.php tests/Feature/EnsureAppIsNotInstalledTest.php
git commit -m "feat: add EnsureAppIsNotInstalled middleware and app.installed config"
```

---

### Task 2: Create SetupController Backend Endpoints

**Files:**
- Create: `app/Http/Controllers/SetupController.php`
- Modify: `routes/web.php`
- Test: `tests/Feature/SetupControllerTest.php`

**Interfaces:**
- Consumes: Database connection status, Artisan commands (`migrate:fresh`)
- Produces:
  - `GET /setup` -> Inertia render `setup/index`
  - `POST /setup/test-db` -> JSON response PDO status
  - `POST /setup/migrate` -> JSON response migration success status
  - `POST /setup/complete` -> Store setting & User owner creation, write `.env`, login & redirect

- [ ] **Step 1: Write failing tests for SetupController**

```php
// tests/Feature/SetupControllerTest.php
<?php

use App\Models\User;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;

beforeEach(function () {
    Config::set('app.installed', false);
});

test('setup index page renders correctly', function () {
    $response = $this->get(route('setup.index'));

    $response->assertStatus(200);
});

test('test-db endpoint returns database connection status', function () {
    $response = $this->postJson(route('setup.test-db'));

    $response->assertOk()->assertJson(['success' => true]);
});

test('complete endpoint creates owner account and marks app installed', function () {
    $payload = [
        'store_name' => 'My POS Store',
        'store_address' => 'Jl. Merdeka No 1',
        'store_phone' => '081234567890',
        'currency' => 'Rp',
        'timezone' => 'Asia/Jakarta',
        'name' => 'Owner POS',
        'email' => 'owner@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ];

    $response = $this->post(route('setup.complete'), $payload);

    $response->assertRedirect('/dashboard');
    $this->assertDatabaseHas('users', ['email' => 'owner@example.com']);
    $this->assertAuthenticated();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `php artisan test --compact --filter=SetupControllerTest`
Expected: FAIL (Controller and routes not defined)

- [ ] **Step 3: Implement SetupController and Web Routes**

In `app/Http/Controllers/SetupController.php`:
```php
<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class SetupController extends Controller
{
    public function index(): InertiaResponse
    {
        return Inertia::render('setup/index');
    }

    public function testDatabase(): JsonResponse
    {
        try {
            DB::connection()->getPdo();
            return response()->json([
                'success' => true,
                'message' => 'Database connection successful.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Database connection failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function runMigration(): JsonResponse
    {
        try {
            Artisan::call('migrate:fresh', ['--force' => true]);
            Artisan::call('db:seed', ['--force' => true]);

            return response()->json([
                'success' => true,
                'message' => 'Database migrated and seeded successfully.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Migration failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function complete(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'store_name' => 'required|string|max:255',
            'store_address' => 'nullable|string|max:500',
            'store_phone' => 'nullable|string|max:50',
            'currency' => 'required|string|max:10',
            'timezone' => 'required|string|max:100',
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        DB::transaction(function () use ($validated) {
            // Save Store Settings if settings table exists or create superadmin user
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
            ]);

            if (method_exists($user, 'assignRole')) {
                $user->assignRole('superadmin');
            }

            // Write APP_INSTALLED=true to .env
            $envPath = base_path('.env');
            if (file_exists($envPath)) {
                $envContent = file_get_contents($envPath);
                if (str_contains($envContent, 'APP_INSTALLED=')) {
                    $envContent = preg_replace('/APP_INSTALLED=.*/', 'APP_INSTALLED=true', $envContent);
                } else {
                    $envContent .= "\nAPP_INSTALLED=true\n";
                }
                file_put_contents($envPath, $envContent);
            }

            config(['app.installed' => true]);
            Auth::login($user);
        });

        return redirect()->to('/dashboard');
    }
}
```

In `routes/web.php`:
```php
use App\Http\Controllers\SetupController;

Route::middleware(['web', 'app.not_installed'])->group(function () {
    Route::get('/setup', [SetupController::class, 'index'])->name('setup.index');
    Route::post('/setup/test-db', [SetupController::class, 'testDatabase'])->name('setup.test-db');
    Route::post('/setup/migrate', [SetupController::class, 'runMigration'])->name('setup.migrate');
    Route::post('/setup/complete', [SetupController::class, 'complete'])->name('setup.complete');
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `php artisan test --compact --filter=SetupControllerTest`
Expected: PASS

- [ ] **Step 5: Run Pint code formatter & Commit**

```bash
vendor/bin/pint --dirty --format agent
git add app/Http/Controllers/SetupController.php routes/web.php tests/Feature/SetupControllerTest.php
git commit -m "feat: add SetupController endpoints and routes for quick setup wizard"
```

---

### Task 3: Build Inertia React Quick Setup Wizard UI Component

**Files:**
- Create: `resources/js/pages/setup/index.tsx`
- Run Wayfinder: `php artisan wayfinder:generate`

**Interfaces:**
- Consumes: SetupController routes (`/setup/test-db`, `/setup/migrate`, `/setup/complete`)
- Produces: Interactive 3-step setup form with Shadcn UI cards, inputs, and buttons.

- [ ] **Step 1: Create Inertia setup page component `resources/js/pages/setup/index.tsx`**

```tsx
import React, { useState } from 'react';
import { useForm, Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle, Loader2, Database, Store, UserCheck, Rocket } from 'lucide-react';

export default function SetupWizard() {
    const [currentStep, setCurrentStep] = useState<number>(1);
    const [dbTested, setDbTested] = useState<boolean>(false);
    const [dbLoading, setDbLoading] = useState<boolean>(false);
    const [dbMessage, setDbMessage] = useState<string | null>(null);
    const [isMigrated, setIsMigrated] = useState<boolean>(false);
    const [migrating, setMigrating] = useState<boolean>(false);

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

    const handleTestDb = async () => {
        setDbLoading(true);
        setDbMessage(null);
        try {
            const res = await fetch('/setup/test-db', { method: 'POST', headers: { 'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '' } });
            const result = await res.json();
            setDbTested(result.success);
            setDbMessage(result.message);
        } catch (e: any) {
            setDbTested(false);
            setDbMessage(e.message || 'Failed to connect');
        } finally {
            setDbLoading(false);
        }
    };

    const handleMigrate = async () => {
        setMigrating(true);
        setDbMessage(null);
        try {
            const res = await fetch('/setup/migrate', { method: 'POST', headers: { 'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '' } });
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
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4">
            <Head title="Initial App Setup Wizard" />

            <div className="w-full max-w-2xl mb-6 text-center">
                <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Super POS Setup</h1>
                <p className="text-slate-400">Follow the quick setup guide to initialize your application.</p>
            </div>

            {/* Stepper Navigation */}
            <div className="w-full max-w-2xl flex items-center justify-between mb-8 px-4">
                <div className={`flex items-center space-x-2 ${currentStep >= 1 ? 'text-primary' : 'text-slate-600'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${currentStep === 1 ? 'bg-primary text-primary-foreground' : currentStep > 1 ? 'bg-emerald-600 text-white' : 'bg-slate-800'}`}>
                        1
                    </div>
                    <span className="font-medium hidden sm:inline">Database</span>
                </div>
                <div className="flex-1 h-0.5 mx-4 bg-slate-800">
                    <div className={`h-full bg-primary transition-all ${currentStep > 1 ? 'w-full' : 'w-0'}`} />
                </div>
                <div className={`flex items-center space-x-2 ${currentStep >= 2 ? 'text-primary' : 'text-slate-600'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${currentStep === 2 ? 'bg-primary text-primary-foreground' : currentStep > 2 ? 'bg-emerald-600 text-white' : 'bg-slate-800'}`}>
                        2
                    </div>
                    <span className="font-medium hidden sm:inline">Store Details</span>
                </div>
                <div className="flex-1 h-0.5 mx-4 bg-slate-800">
                    <div className={`h-full bg-primary transition-all ${currentStep > 2 ? 'w-full' : 'w-0'}`} />
                </div>
                <div className={`flex items-center space-x-2 ${currentStep >= 3 ? 'text-primary' : 'text-slate-600'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${currentStep === 3 ? 'bg-primary text-primary-foreground' : 'bg-slate-800'}`}>
                        3
                    </div>
                    <span className="font-medium hidden sm:inline">Owner Account</span>
                </div>
            </div>

            <Card className="w-full max-w-2xl bg-slate-900 border-slate-800 text-slate-100">
                {currentStep === 1 && (
                    <>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Database className="w-5 h-5 text-primary" />
                                <span>Step 1: Database Setup & Migration</span>
                            </CardTitle>
                            <CardDescription className="text-slate-400">Test database connection and initialize tables.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {dbMessage && (
                                <Alert className={dbTested || isMigrated ? 'bg-emerald-950/50 border-emerald-800 text-emerald-300' : 'bg-destructive/10 border-destructive/20 text-destructive'}>
                                    {dbTested || isMigrated ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                                    <AlertTitle>{dbTested || isMigrated ? 'Success' : 'Error'}</AlertTitle>
                                    <AlertDescription>{dbMessage}</AlertDescription>
                                </Alert>
                            )}
                            <div className="flex flex-col gap-3">
                                <Button onClick={handleTestDb} disabled={dbLoading || migrating} variant="outline">
                                    {dbLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                    Test Database Connection
                                </Button>
                                <Button onClick={handleMigrate} disabled={!dbTested || migrating || isMigrated} className="w-full">
                                    {migrating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                    {isMigrated ? 'Database Migrated & Seeded' : 'Run Migration & Seed Data'}
                                </Button>
                            </div>
                        </CardContent>
                        <CardFooter className="justify-end">
                            <Button onClick={() => setCurrentStep(2)} disabled={!isMigrated}>
                                Next Step
                            </Button>
                        </CardFooter>
                    </>
                )}

                {currentStep === 2 && (
                    <>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Store className="w-5 h-5 text-primary" />
                                <span>Step 2: Store Details</span>
                            </CardTitle>
                            <CardDescription className="text-slate-400">Enter your business information.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="store_name">Store Name *</Label>
                                <Input id="store_name" value={data.store_name} onChange={(e) => setData('store_name', e.target.value)} placeholder="e.g. Toko Berkah POS" />
                                {errors.store_name && <p className="text-sm text-destructive">{errors.store_name}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="store_address">Address</Label>
                                <Input id="store_address" value={data.store_address} onChange={(e) => setData('store_address', e.target.value)} placeholder="Jl. Raya Utama No. 123" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="currency">Currency Symbol</Label>
                                    <Input id="currency" value={data.currency} onChange={(e) => setData('currency', e.target.value)} placeholder="Rp" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="timezone">Timezone</Label>
                                    <Input id="timezone" value={data.timezone} onChange={(e) => setData('timezone', e.target.value)} placeholder="Asia/Jakarta" />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="justify-between">
                            <Button variant="outline" onClick={() => setCurrentStep(1)}>
                                Back
                            </Button>
                            <Button onClick={() => setCurrentStep(3)} disabled={!data.store_name}>
                                Next Step
                            </Button>
                        </CardFooter>
                    </>
                )}

                {currentStep === 3 && (
                    <form onSubmit={handleSubmitComplete}>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <UserCheck className="w-5 h-5 text-primary" />
                                <span>Step 3: Create Owner Account</span>
                            </CardTitle>
                            <CardDescription className="text-slate-400">Setup superadmin account for login access.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name *</Label>
                                <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="John Doe" />
                                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address *</Label>
                                <Input id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} placeholder="owner@example.com" />
                                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password *</Label>
                                    <Input id="password" type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} placeholder="••••••••" />
                                    {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password_confirmation">Confirm Password *</Label>
                                    <Input id="password_confirmation" type="password" value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)} placeholder="••••••••" />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="justify-between">
                            <Button type="button" variant="outline" onClick={() => setCurrentStep(2)}>
                                Back
                            </Button>
                            <Button type="submit" disabled={processing} className="bg-emerald-600 hover:bg-emerald-500">
                                {processing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Rocket className="w-4 h-4 mr-2" />}
                                Complete Setup & Launch POS
                            </Button>
                        </CardFooter>
                    </form>
                )}
            </Card>
        </div>
    );
}
```

- [ ] **Step 2: Commit Frontend Setup Wizard**

```bash
git add resources/js/pages/setup/index.tsx
git commit -m "feat: implement Inertia React Setup Wizard UI page component"
```

---

### Task 4: Integration & Full Test Verification

**Files:**
- Run: Pest tests for feature & middleware

- [ ] **Step 1: Run all feature tests**

Run: `php artisan test --compact`
Expected: ALL PASS

- [ ] **Step 2: Wayfinder route generation check**

Run: `php artisan wayfinder:generate`
Expected: Success

- [ ] **Step 3: Commit final setup**

```bash
git add .
git commit -m "feat: complete Quick Setup Wizard feature implementation"
```
