# Store Settings Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a store information settings page where users can manage store name, address, contact details, tax ID, and receipt header/footer settings.

**Architecture:** We will implement a `StoreSetting` database table and model designed for a single configuration row. The backend will expose edit and update routes managed by `StoreSettingController` and validated by `StoreSettingUpdateRequest`. The frontend will use Inertia + React with Laravel Wayfinder integration, rendering the setting form inside the standard settings page layout structure.

**Tech Stack:** Laravel 13, PHP 8.4, Inertia.js v3, React 19, TailwindCSS v4, Pest v4, Wayfinder.

## Global Constraints

- php - 8.4
- laravel/framework - v13
- @inertiajs/react - v3
- react - v19
- tailwindcss - v4
- laravel/boost - v2

---

### Task 1: Store Setting Database Migration, Model, Seeder, and Database Test

**Files:**
- Create: `database/migrations/2026_07_23_000000_create_store_settings_table.php`
- Create: `app/Models/StoreSetting.php`
- Create: `database/factories/StoreSettingFactory.php`
- Create: `database/seeders/StoreSettingSeeder.php`
- Modify: `database/seeders/DatabaseSeeder.php`
- Create: `tests/Feature/Settings/StoreSettingDatabaseTest.php`

**Interfaces:**
- Consumes: None
- Produces: `App\Models\StoreSetting` model and database table schema

- [ ] **Step 1: Write the failing test**

Create the file `tests/Feature/Settings/StoreSettingDatabaseTest.php` with:

```php
<?php

use App\Models\StoreSetting;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('store settings table is seeded with default values', function () {
    $this->seed(\Database\Seeders\StoreSettingSeeder::class);

    $this->assertDatabaseHas('store_settings', [
        'name' => 'PRAKTIS POS',
        'address' => 'Jl. Jenderal Sudirman No. 123, Jakarta',
        'phone' => '021-5551234',
        'email' => 'info@superpos.com',
        'tax_number' => '12.345.678.9-012.000',
        'receipt_header' => 'Terima Kasih Atas Kunjungan Anda',
        'receipt_footer' => 'Barang yang sudah dibeli tidak dapat ditukar',
    ]);

    $setting = StoreSetting::first();
    expect($setting)->not->toBeNull();
    expect($setting->name)->toBe('PRAKTIS POS');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `php artisan test --filter=StoreSettingDatabaseTest --compact`
Expected output: FAIL (Class "Database\Seeders\StoreSettingSeeder" not found)

- [ ] **Step 3: Write minimal implementation**

Create model `app/Models/StoreSetting.php`:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StoreSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'address',
        'phone',
        'email',
        'tax_number',
        'receipt_header',
        'receipt_footer',
    ];
}
```

Create migration `database/migrations/2026_07_23_000000_create_store_settings_table.php`:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('store_settings', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('address');
            $table->string('phone');
            $table->string('email')->nullable();
            $table->string('tax_number')->nullable();
            $table->text('receipt_header')->nullable();
            $table->text('receipt_footer')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('store_settings');
    }
};
```

Create factory `database/factories/StoreSettingFactory.php`:

```php
<?php

namespace Database\Factories;

use App\Models\StoreSetting;
use Illuminate\Database\Eloquent\Factories\Factory;

class StoreSettingFactory extends Factory
{
    protected $model = StoreSetting::class;

    public function definition(): array
    {
        return [
            'name' => 'PRAKTIS POS Store',
            'address' => 'Jl. Jenderal Sudirman No. 123, Jakarta',
            'phone' => '021-5551234',
            'email' => 'store@example.com',
            'tax_number' => '12.345.678.9-012.000',
            'receipt_header' => 'Terima Kasih Atas Kunjungan Anda',
            'receipt_footer' => 'Barang yang sudah dibeli tidak dapat ditukar',
        ];
    }
}
```

Create seeder `database/seeders/StoreSettingSeeder.php`:

```php
<?php

namespace Database\Seeders;

use App\Models\StoreSetting;
use Illuminate\Database\Seeder;

class StoreSettingSeeder extends Seeder
{
    public function run(): void
    {
        StoreSetting::firstOrCreate(
            ['id' => 1],
            [
                'name' => 'PRAKTIS POS',
                'address' => 'Jl. Jenderal Sudirman No. 123, Jakarta',
                'phone' => '021-5551234',
                'email' => 'info@superpos.com',
                'tax_number' => '12.345.678.9-012.000',
                'receipt_header' => 'Terima Kasih Atas Kunjungan Anda',
                'receipt_footer' => 'Barang yang sudah dibeli tidak dapat ditukar',
            ]
        );
    }
}
```

Modify `database/seeders/DatabaseSeeder.php` to include the seeder:

```diff
@@ -22,2 +22,3 @@
             ProductSeeder::class,
             PaymentMethodSeeder::class,
             TransactionSeeder::class,
+            StoreSettingSeeder::class,
         ]);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `php artisan migrate:fresh --seed && php artisan test --filter=StoreSettingDatabaseTest --compact`
Expected output: PASS

- [ ] **Step 5: Commit**

```bash
git add database/migrations/2026_07_23_000000_create_store_settings_table.php app/Models/StoreSetting.php database/factories/StoreSettingFactory.php database/seeders/StoreSettingSeeder.php database/seeders/DatabaseSeeder.php tests/Feature/Settings/StoreSettingDatabaseTest.php
git commit -m "feat: add store settings database migration, model, factory, and seeder"
```

---

### Task 2: Store Setting Controller, Request Validation, Routes, and Message Translations

**Files:**
- Create: `app/Http/Requests/Settings/StoreSettingUpdateRequest.php`
- Create: `app/Http/Controllers/Settings/StoreSettingController.php`
- Modify: `routes/settings.php`
- Modify: `lang/id/message.php`
- Modify: `lang/en/message.php`
- Create: `tests/Feature/Settings/StoreSettingTest.php`

**Interfaces:**
- Consumes: `App\Models\StoreSetting`
- Produces: Backend routes `store.edit` (GET) and `store.update` (PATCH) resolved by Laravel Wayfinder

- [ ] **Step 1: Write the failing test**

Create the file `tests/Feature/Settings/StoreSettingTest.php` with:

```php
<?php

use App\Models\StoreSetting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('store setting page is displayed for authenticated user', function () {
    $user = User::factory()->create();
    $storeSetting = StoreSetting::factory()->create();

    $response = $this
        ->actingAs($user)
        ->get(route('store.edit'));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('settings/store')
        ->has('storeSetting', fn (Assert $page) => $page
            ->where('name', $storeSetting->name)
            ->where('address', $storeSetting->address)
            ->where('phone', $storeSetting->phone)
            ->etc()
        )
    );
});

test('store setting can be updated', function () {
    $user = User::factory()->create();
    StoreSetting::factory()->create();

    $response = $this
        ->actingAs($user)
        ->patch(route('store.update'), [
            'name' => 'Updated Store Name',
            'address' => 'Updated Address Road 456',
            'phone' => '081234567890',
            'email' => 'updated@store.com',
            'tax_number' => '99.999.999.9-999.000',
            'receipt_header' => 'New Header Text',
            'receipt_footer' => 'New Footer Text',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('store.edit'));

    $setting = StoreSetting::first();
    expect($setting->name)->toBe('Updated Store Name');
    expect($setting->address)->toBe('Updated Address Road 456');
    expect($setting->phone)->toBe('081234567890');
    expect($setting->email)->toBe('updated@store.com');
    expect($setting->tax_number)->toBe('99.999.999.9-999.000');
    expect($setting->receipt_header)->toBe('New Header Text');
    expect($setting->receipt_footer)->toBe('New Footer Text');
});

test('store setting update requires validation', function () {
    $user = User::factory()->create();
    StoreSetting::factory()->create();

    $response = $this
        ->actingAs($user)
        ->from(route('store.edit'))
        ->patch(route('store.update'), [
            'name' => '',
            'address' => '',
            'phone' => '',
        ]);

    $response
        ->assertSessionHasErrors(['name', 'address', 'phone'])
        ->assertRedirect(route('store.edit'));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `php artisan test --filter=StoreSettingTest --compact`
Expected output: FAIL (Route "store.edit" not defined)

- [ ] **Step 3: Write minimal implementation**

Create form request `app/Http/Requests/Settings/StoreSettingUpdateRequest.php`:

```php
<?php

namespace App\Http\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;

class StoreSettingUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'address' => ['required', 'string'],
            'phone' => ['required', 'string', 'max:20'],
            'email' => ['nullable', 'email', 'max:255'],
            'tax_number' => ['nullable', 'string', 'max:50'],
            'receipt_header' => ['nullable', 'string'],
            'receipt_footer' => ['nullable', 'string'],
        ];
    }
}
```

Create controller `app/Http/Controllers/Settings/StoreSettingController.php`:

```php
<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\StoreSettingUpdateRequest;
use App\Models\StoreSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StoreSettingController extends Controller
{
    public function edit(Request $request): Response
    {
        $storeSetting = StoreSetting::first() ?? new StoreSetting([
            'name' => 'PRAKTIS POS',
            'address' => '-',
            'phone' => '-',
        ]);

        return Inertia::render('settings/store', [
            'storeSetting' => $storeSetting,
        ]);
    }

    public function update(StoreSettingUpdateRequest $request): RedirectResponse
    {
        $storeSetting = StoreSetting::first();

        if (!$storeSetting) {
            $storeSetting = new StoreSetting();
        }

        $storeSetting->fill($request->validated());
        $storeSetting->save();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => trans('message.success.store_settings_updated'),
        ]);

        return to_route('store.edit');
    }
}
```

Modify `routes/settings.php` to define the routes:

```diff
@@ -4,6 +4,7 @@
 use App\Http\Controllers\Settings\ProfileController;
 use App\Http\Controllers\Settings\SecurityController;
+use App\Http\Controllers\Settings\StoreSettingController;
 use Illuminate\Support\Facades\Route;
 
 Route::middleware(['auth'])->group(function () {
@@ -24,2 +25,5 @@
     Route::inertia('settings/appearance', 'settings/appearance')->name('appearance.edit');
     Route::inertia('settings/language', 'settings/language')->name('language.edit');
+
+    Route::get('settings/store', [StoreSettingController::class, 'edit'])->name('store.edit');
+    Route::patch('settings/store', [StoreSettingController::class, 'update'])->name('store.update');
 });
```

Modify translations inside `lang/id/message.php`:

```diff
@@ -14,2 +14,3 @@
         'password_updated' => 'Password diperbarui',
+        'store_settings_updated' => 'Pengaturan toko berhasil diperbarui',
     ],
```

Modify translations inside `lang/en/message.php`:

```diff
@@ -14,2 +14,3 @@
         'password_updated' => 'Password updated',
+        'store_settings_updated' => 'Store settings successfully updated',
     ],
```

Generate Laravel Wayfinder route files so the routes are registered on the frontend:
Run: `php artisan wayfinder:generate`

- [ ] **Step 4: Run test to verify it passes**

Run: `php artisan test --filter=StoreSettingTest --compact`
Expected output: PASS

- [ ] **Step 5: Commit**

```bash
git add app/Http/Requests/Settings/StoreSettingUpdateRequest.php app/Http/Controllers/Settings/StoreSettingController.php routes/settings.php lang/id/message.php lang/en/message.php tests/Feature/Settings/StoreSettingTest.php
git commit -m "feat: add store settings request validation, controller, routes and messages"
```

---

### Task 3: React Settings Layout Menu, Localization Files, and Store View Form

**Files:**
- Modify: `resources/js/layouts/settings/layout.tsx`
- Modify: `resources/js/locales/id/translation.json`
- Modify: `resources/js/locales/en/translation.json`
- Create: `resources/js/pages/settings/store.tsx`

**Interfaces:**
- Consumes: Generated Wayfinder routes for `@/routes/store` and `@/actions/App/Http/Controllers/Settings/StoreSettingController`
- Produces: Visual Store Settings management view in Settings tab

- [ ] **Step 1: Write the failing test / check types error**

Modify `resources/js/layouts/settings/layout.tsx` to add "Store Settings" sidebar navigation:

```diff
@@ -10,3 +10,4 @@
 import { edit } from '@/routes/profile';
 import { edit as editSecurity } from '@/routes/security';
+import { edit as editStore } from '@/routes/store';
 import type { NavItem } from '@/types';
@@ -39,2 +40,7 @@
             icon: null,
         },
+        {
+            title: t('page.settings.store.label', 'Informasi Toko'),
+            href: editStore(),
+            icon: null,
+        },
     ];
```

Verify that building the types fails because `resources/js/pages/settings/store.tsx` does not exist yet.
Run: `npm run types:check`
Expected output: FAIL (Module not found or similar page import/resolution issues)

- [ ] **Step 2: Add localization keys**

Insert localization keys into `resources/js/locales/id/translation.json` under `"settings"` object:

```diff
@@ -994,2 +994,21 @@
             }
+        },
+        "store": {
+            "label": "Informasi Toko",
+            "title": "Pengaturan Toko",
+            "description": "Perbarui detail informasi toko Anda",
+            "form": {
+                "title": "Informasi Toko",
+                "name_input_label": "Nama Toko",
+                "name_input_placeholder": "Masukkan nama toko",
+                "address_input_label": "Alamat",
+                "address_input_placeholder": "Masukkan alamat toko",
+                "phone_input_label": "No. Telepon",
+                "phone_input_placeholder": "Masukkan nomor telepon toko",
+                "email_input_label": "Email",
+                "email_input_placeholder": "Masukkan email toko",
+                "tax_number_input_label": "NPWP / No. Pajak",
+                "tax_number_input_placeholder": "Masukkan NPWP toko",
+                "receipt_header_input_label": "Header Struk",
+                "receipt_header_input_placeholder": "Masukkan teks header struk",
+                "receipt_footer_input_label": "Footer Struk",
+                "receipt_footer_input_placeholder": "Masukkan teks footer struk",
+                "save_btn": "Simpan"
+            }
         }
```

Insert localization keys into `resources/js/locales/en/translation.json` under `"settings"` object:

```json
        "store": {
            "label": "Store Information",
            "title": "Store Settings",
            "description": "Update your store information details",
            "form": {
                "title": "Store Information",
                "name_input_label": "Store Name",
                "name_input_placeholder": "Enter store name",
                "address_input_label": "Address",
                "address_input_placeholder": "Enter store address",
                "phone_input_label": "Phone Number",
                "phone_input_placeholder": "Enter store phone number",
                "email_input_label": "Email",
                "email_input_placeholder": "Enter store email address",
                "tax_number_input_label": "Tax Number",
                "tax_number_input_placeholder": "Enter store tax number",
                "receipt_header_input_label": "Receipt Header",
                "receipt_header_input_placeholder": "Enter receipt header text",
                "receipt_footer_input_label": "Receipt Footer",
                "receipt_footer_input_placeholder": "Enter receipt footer text",
                "save_btn": "Save"
            }
        }
```

- [ ] **Step 3: Create React view page**

Create view page at `resources/js/pages/settings/store.tsx`:

```typescript
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

interface StoreSetting {
    id: number;
    name: string;
    address: string;
    phone: string;
    email: string | null;
    tax_number: string | null;
    receipt_header: string | null;
    receipt_footer: string | null;
}

export default function Store({ storeSetting }: { storeSetting: StoreSetting }) {
    const { t } = useTranslation();

    return (
        <>
            <Head
                title={t('page.settings.store.title', 'Pengaturan Toko')}
            />

            <h1 className="sr-only">
                {t('page.settings.store.title', 'Pengaturan Toko')}
            </h1>

            <div className="space-y-6">
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
                                <Label htmlFor="receipt_header">
                                    {t(
                                        'page.settings.store.form.receipt_header_input_label',
                                        'Header Struk',
                                    )}
                                </Label>

                                <Textarea
                                    id="receipt_header"
                                    className="mt-1 block w-full min-h-[60px]"
                                    defaultValue={storeSetting.receipt_header ?? ''}
                                    name="receipt_header"
                                    placeholder={t(
                                        'page.settings.store.form.receipt_header_input_placeholder',
                                        'Masukkan teks header struk',
                                    )}
                                />

                                <InputError
                                    className="mt-2"
                                    message={errors.receipt_header}
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
```

- [ ] **Step 4: Run type checks and validation builds**

Run: `npm run types:check && npm run build`
Expected output: SUCCESS (no TypeScript errors, Vite compiles successfully)

- [ ] **Step 5: Commit**

```bash
git add resources/js/layouts/settings/layout.tsx resources/js/locales/id/translation.json resources/js/locales/en/translation.json resources/js/pages/settings/store.tsx
git commit -m "feat: implement store settings view page, layout link and translations"
```
