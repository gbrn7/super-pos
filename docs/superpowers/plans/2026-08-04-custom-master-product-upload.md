# Optional Custom Master Product Upload Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Memungkinkan pengguna di Step 1 Quick Setup Wizard mengunggah file katalog master produk kustom (.xlsx / .xls) secara opsional, yang jika diunggah akan digunakan untuk seeding data produk awal, dan jika tidak diunggah akan fallback menggunakan file katalog default.

**Architecture:** Backend menambahkan endpoint `POST /setup/upload-master-product` dan `DELETE /setup/reset-master-product` di `SetupController` untuk mengelola file temporary `storage/app/temp/custom_master_products.xlsx`. `MasterProductSeeder` memeriksa keberadaan file temporary ini saat `db:seed` dijalankan. Frontend di `setup/index.tsx` menambahkan komponen UI upload file opsional di Step 1.

**Tech Stack:** PHP 8.4, Laravel 13, Inertia.js v3, React 19, TailwindCSS v4, Pest 4.

## Global Constraints

- PHP Version: 8.4
- Laravel Version: 13
- React Version: 19
- Inertia Version: v3
- File Mimes: `xlsx`, `xls`
- Temp File Location: `storage/app/temp/custom_master_products.xlsx`
- Default File Location: `public/imports/master-products-database.xlsx`

---

### Task 1: Backend Endpoint Upload & Reset Custom Master Product File

**Files:**
- Modify: `app/Http/Controllers/SetupController.php`
- Modify: `routes/web.php`
- Test: `tests/Feature/Setup/MasterProductUploadTest.php`

**Interfaces:**
- Consumes: HTTP request dengan payload file `file` (`.xlsx`/`.xls`)
- Produces: JSON response `{ success: true, message: string, filename: string, size: string }`

- [ ] **Step 1: Write failing feature test for file upload and reset**

```php
<?php

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('can upload custom master product file', function () {
    Storage::fake('local');
    $file = UploadedFile::fake()->create('custom_catalog.xlsx', 100, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

    $response = $this->postJson('/setup/upload-master-product', [
        'file' => $file,
    ]);

    $response->assertStatus(200)
        ->assertJson([
            'success' => true,
            'filename' => 'custom_catalog.xlsx',
        ]);

    expect(file_exists(storage_path('app/temp/custom_master_products.xlsx')))->toBeTrue();
});

test('rejects non-excel files', function () {
    $file = UploadedFile::fake()->create('document.pdf', 100, 'application/pdf');

    $response = $this->postJson('/setup/upload-master-product', [
        'file' => $file,
    ]);

    $response->assertStatus(422);
});

test('can reset uploaded custom master product file', function () {
    $tempPath = storage_path('app/temp/custom_master_products.xlsx');
    if (! is_dir(dirname($tempPath))) {
        mkdir(dirname($tempPath), 0755, true);
    }
    file_put_contents($tempPath, 'fake-content');

    $response = $this->deleteJson('/setup/reset-master-product');

    $response->assertStatus(200)
        ->assertJson(['success' => true]);

    expect(file_exists($tempPath))->toBeFalse();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `php artisan test --compact --filter=MasterProductUploadTest`
Expected: FAIL (Routes and Controller methods not found)

- [ ] **Step 3: Add routes in `routes/web.php`**

```php
Route::post('/setup/upload-master-product', [SetupController::class, 'uploadMasterProduct'])->name('setup.upload_master_product');
Route::delete('/setup/reset-master-product', [SetupController::class, 'resetMasterProduct'])->name('setup.reset_master_product');
```

- [ ] **Step 4: Implement controller methods in `app/Http/Controllers/SetupController.php`**

```php
    public function uploadMasterProduct(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls|max:20480',
        ]);

        $file = $request->file('file');
        $originalName = $file->getClientOriginalName();
        $fileSize = number_format($file->getSize() / 1024 / 1024, 2).' MB';

        $tempDir = storage_path('app/temp');
        if (! is_dir($tempDir)) {
            mkdir($tempDir, 0755, true);
        }

        $file->move($tempDir, 'custom_master_products.xlsx');

        return response()->json([
            'success' => true,
            'message' => __('File katalog kustom berhasil diunggah.'),
            'filename' => $originalName,
            'size' => $fileSize,
        ]);
    }

    public function resetMasterProduct(): JsonResponse
    {
        $tempPath = storage_path('app/temp/custom_master_products.xlsx');
        if (file_exists($tempPath)) {
            unlink($tempPath);
        }

        return response()->json([
            'success' => true,
            'message' => __('Kembali menggunakan file katalog default.'),
        ]);
    }
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `php artisan test --compact --filter=MasterProductUploadTest`
Expected: PASS

- [ ] **Step 6: Run Pint & Commit**

```bash
vendor/bin/pint --format agent
git add routes/web.php app/Http/Controllers/SetupController.php tests/Feature/Setup/MasterProductUploadTest.php
git commit -m "feat: add backend upload and reset endpoint for custom master product file"
```

---

### Task 2: Seeder Support for Custom Master Product File

**Files:**
- Modify: `database/seeders/MasterProductSeeder.php`
- Test: `tests/Feature/Setup/MasterProductSeederCustomFileTest.php`

**Interfaces:**
- Consumes: File `storage/app/temp/custom_master_products.xlsx` if present, else fallback to `public/imports/master-products-database.xlsx`
- Produces: Inserted records in `master_products` table

- [ ] **Step 1: Write failing test for Seeder custom file fallback**

```php
<?php

use Database\Seeders\MasterProductSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;

uses(RefreshDatabase::class);

test('master product seeder prioritizes custom file if exists', function () {
    $tempDir = storage_path('app/temp');
    if (! is_dir($tempDir)) {
        mkdir($tempDir, 0755, true);
    }
    $tempPath = $tempDir.'/custom_master_products.xlsx';
    
    // Copy sample default file as custom file for test
    copy(public_path('imports/master-products-database.xlsx'), $tempPath);

    $seeder = new MasterProductSeeder();
    $seeder->run();

    expect(DB::table('master_products')->count())->toBeGreaterThan(0);
    expect(file_exists($tempPath))->toBeFalse(); // Cleaned up after seed
});
```

- [ ] **Step 2: Run test to verify it fails/passes**

Run: `php artisan test --compact --filter=MasterProductSeederCustomFileTest`

- [ ] **Step 3: Modify `database/seeders/MasterProductSeeder.php`**

```php
        $customFilePath = storage_path('app/temp/custom_master_products.xlsx');
        $defaultFilePath = public_path('imports/master-products-database.xlsx');

        $publicFilePath = file_exists($customFilePath) ? $customFilePath : $defaultFilePath;

        if (! file_exists($publicFilePath)) {
            $this->command?->error("Import file not found: {$publicFilePath}");

            return;
        }

        $data = Excel::toArray(new MasterProductImport, $publicFilePath);
        $chunks = array_chunk($data[0], 1000);

        $now = now();

        DB::beginTransaction();
        foreach ($chunks as $chunk) {
            $newData = Collection::make();

            foreach ($chunk as $row) {
                $newMasterProduct = [
                    'name' => Str::upper($row['nama']),
                    'category_name' => $row['kategori'] ?? Constants::EMPTY_STRING_VALUE,
                    'unit_name' => $row['satuan'] ?? Constants::EMPTY_STRING_VALUE,
                    'barcode' => ! empty($row['barcode_opsional']) ? (string) $row['barcode_opsional'] : null,
                    'cost_price' => $row['harga_modal'] ?? Constants::EMPTY_NUMBER_VALUE,
                    'price' => $row['harga_jual'] ?? Constants::EMPTY_NUMBER_VALUE,
                    'desc' => $row['deskripsi_opsional'] ?? Constants::EMPTY_STRING_VALUE,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];

                $newData->push($newMasterProduct);
            }
            MasterProduct::insert($newData->toArray());
        }
        DB::commit();

        // Clean up temporary custom file if it was used
        if (file_exists($customFilePath)) {
            @unlink($customFilePath);
        }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `php artisan test --compact --filter=MasterProductSeederCustomFileTest`
Expected: PASS

- [ ] **Step 5: Run Pint & Commit**

```bash
vendor/bin/pint --format agent
git add database/seeders/MasterProductSeeder.php tests/Feature/Setup/MasterProductSeederCustomFileTest.php
git commit -m "feat: update MasterProductSeeder to support custom uploaded file"
```

---

### Task 3: Frontend Optional File Upload Component in Step 1 Quick Setup Wizard

**Files:**
- Modify: `resources/js/pages/setup/index.tsx`

**Interfaces:**
- Consumes: `/setup/upload-master-product` (POST) & `/setup/reset-master-product` (DELETE)
- Produces: Drag & Drop upload UI with custom file badge and status indicator in Step 1

- [ ] **Step 1: Add icons and states for optional custom master product file in `resources/js/pages/setup/index.tsx`**

Import icons `Upload`, `FileSpreadsheet`, `X`, `FileCheck`:
```tsx
import { CheckCircle2, AlertCircle, Loader2, Database, Store, UserCheck, Rocket, ChevronDown, Settings2, Globe, Eye, EyeOff, Sun, Moon, Monitor, Upload, FileSpreadsheet, X, FileCheck } from 'lucide-react';
```

Add states inside `SetupWizard`:
```tsx
const [customFile, setCustomFile] = useState<{ name: string; size: string } | null>(null);
const [uploadingFile, setUploadingFile] = useState<boolean>(false);
const [uploadError, setUploadError] = useState<string | null>(null);
```

- [ ] **Step 2: Add handleFileUpload and handleFileReset functions in `resources/js/pages/setup/index.tsx`**

```tsx
const handleCustomFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
        const res = await fetch('/setup/upload-master-product', {
            method: 'POST',
            headers: {
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
        await fetch('/setup/reset-master-product', {
            method: 'DELETE',
            headers: {
                'X-CSRF-TOKEN': getCsrfToken(),
            },
        });
        setCustomFile(null);
        setUploadError(null);
    } catch (err) {
        console.error('Failed to reset custom file', err);
    }
};
```

- [ ] **Step 3: Render Custom Master Product File Upload UI in Step 1 CardContent**

Di `CardContent` Step 1, tepat di bawah `Collapsible` DB Credentials dan di atas tombol aksi `Test Connection` & `Run Migration`:

```tsx
{/* Custom Master Product File Upload (Optional) */}
<div className="border border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-4 bg-slate-50/50 dark:bg-slate-950/30 space-y-2">
    <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm font-semibold">{t('Katalog Produk Master (Opsional)')}</span>
        </div>
        {customFile && (
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                <FileCheck className="w-3.5 h-3.5" /> File Kustom Aktif
            </span>
        )}
    </div>

    <p className="text-xs text-slate-500 dark:text-slate-400">
        Unggah file Excel (.xlsx / .xls) untuk katalog produk kustom Anda, atau biarkan kosong untuk menggunakan katalog default.
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
            <Label htmlFor="custom_master_file" className="cursor-pointer inline-flex items-center space-x-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 px-3 py-1.5 rounded-md font-medium text-slate-700 dark:text-slate-300 transition-colors">
                {uploadingFile ? <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" /> : <Upload className="w-3.5 h-3.5 text-primary" />}
                <span>{uploadingFile ? 'Mengunggah...' : 'Pilih File Excel (.xlsx / .xls)'}</span>
            </Label>
            <input id="custom_master_file" type="file" accept=".xlsx,.xls" className="hidden" onChange={handleCustomFileUpload} disabled={uploadingFile || migrating} />
        </div>
    )}
</div>
```

- [ ] **Step 4: Build Assets & Test UI**

Run: `npm run build`
Expected: Clean build success.

- [ ] **Step 5: Run Pint & Commit**

```bash
vendor/bin/pint --format agent
git add resources/js/pages/setup/index.tsx
git commit -m "feat: add optional custom master product file upload UI to Step 1 setup wizard"
```

---

## Plan Self-Review Check

1. **Spec Coverage:**
   - Upload API endpoint `/setup/upload-master-product` (Task 1)
   - Reset API endpoint `/setup/reset-master-product` (Task 1)
   - Fallback logic in `MasterProductSeeder` (Task 2)
   - Optional file upload UI in Step 1 Setup Wizard (Task 3)
2. **Placeholder scan:** No placeholders used, full code snippets provided.
3. **Type consistency:** Custom file path `storage/app/temp/custom_master_products.xlsx` and route names match everywhere.
