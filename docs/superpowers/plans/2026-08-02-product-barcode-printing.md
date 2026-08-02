# Product Barcode Printing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a feature to generate and print product barcode labels in PDF format directly from the Product data table action menu with customizable print quantity, complete with Service-Repository backend architecture and i18n support.

**Architecture:** Add a print barcode endpoint to `ApiProductController`, which delegates to `ProductService` & `ProductRepository`. The service validates the presence of the product's barcode string (returning 422 with translated error if absent), generates barcode HTML/SVG elements using `picqer/php-barcode-generator` (or DNS1D/DomPDF HTML barcode), and renders a multi-column PDF via `barryvdh/laravel-dompdf` (or `mdf-dompdf`). In the frontend (React), add a "Print Barcode" action item in `columns.tsx` above the "Delete" item, which opens `PrintBarcodeModal.tsx` for quantity input and PDF preview/download.

**Tech Stack:** Laravel 13, PHP 8.4, Inertia React, TailwindCSS v4, i18next, DomPDF / Barcode generator package, Pest PHP.

## Global Constraints

- **Barcode Validation**: Return HTTP 422 with translated message `message.error.barcode_not_found` when `$product->barcode` is null/empty.
- **Action Button Placement**: In `resources/js/pages/product/columns.tsx`, place "Print Barcode" menu item above "Delete data".
- **Architecture**: Follow Service-Repository pattern strictly across `ProductRepositoryInterface`, `ProductRepository`, `ProductServiceInterface`, and `ProductService`.
- **Multi-language**: All backend response strings must use `trans()` / `message.php` keys. All frontend text must use `t()` from `useTranslation()`.

---

### Task 1: Backend Error Message & Route Setup

**Files:**
- Modify: `lang/id/message.php:31-64`
- Modify: `lang/en/message.php:31-65`
- Modify: `routes/api.php`
- Modify: `app/Http/Requests/Product/PrintBarcodeProductRequest.php`

**Interfaces:**
- Consumes: None
- Produces: `PrintBarcodeProductRequest` validation request for `quantity` (integer, min 1, max 500).

- [ ] **Step 1: Write Form Request for Print Barcode**

```php
<?php

namespace App\Http\Requests\Product;

use Illuminate\Foundation\Http\FormRequest;

class PrintBarcodeProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'quantity' => ['required', 'integer', 'min:1', 'max:500'],
        ];
    }
}
```

- [ ] **Step 2: Add translation keys for barcode error**

In `lang/id/message.php`:
```php
'barcode_not_found' => 'Barcode tidak ditemukan pada produk ini.',
```

In `lang/en/message.php`:
```php
'barcode_not_found' => 'Barcode not found for this product.',
```

- [ ] **Step 3: Register route in `routes/api.php`**

```php
Route::post('products/{id}/print-barcode', [ApiProductController::class, 'printBarcode'])->name('products.print-barcode');
```

- [ ] **Step 4: Commit**

```bash
git add lang/id/message.php lang/en/message.php routes/api.php app/Http/Requests/Product/PrintBarcodeProductRequest.php
git commit -m "feat: add barcode print request and translation messages"
```

---

### Task 2: Service & Repository Method Implementation

**Files:**
- Modify: `app/Support/Interfaces/Services/ProductServiceInterface.php`
- Modify: `app/Services/ProductService.php`
- Create: `resources/views/pdf/barcode.blade.php`
- Test: `tests/Feature/Api/Product/PrintBarcodeTest.php`

**Interfaces:**
- Consumes: `ProductRepositoryInterface::getById($id)`
- Produces: `ProductServiceInterface::printBarcode(string $id, int $quantity): \Illuminate\Http\Response`

- [ ] **Step 1: Write Pest Feature Test for Barcode Printing**

Create `tests/Feature/Api/Product/PrintBarcodeTest.php`:

```php
<?php

use App\Models\Product;
use App\Models\User;
use Spatie\Permission\Models\Permission;
use App\Support\Enums\ProductPermissionEnums;

beforeEach(function () {
    $this->user = User::factory()->create();
    Permission::firstOrCreate(['name' => ProductPermissionEnums::READ_PRODUCT->value]);
    $this->user->givePermissionTo(ProductPermissionEnums::READ_PRODUCT->value);
});

test('it returns 422 if product does not have barcode', function () {
    $product = Product::factory()->create(['barcode' => null]);

    $response = $this->actingAs($this->user)
        ->postJson(route('api.products.print-barcode', $product->id), [
            'quantity' => 5,
        ]);

    $response->assertStatus(422)
        ->assertJson([
            'success' => false,
        ]);
});

test('it returns PDF stream when product has valid barcode', function () {
    $product = Product::factory()->create(['barcode' => '123456789012']);

    $response = $this->actingAs($this->user)
        ->postJson(route('api.products.print-barcode', $product->id), [
            'quantity' => 10,
        ]);

    $response->assertOk();
    expect($response->headers->get('content-type'))->toContain('application/pdf');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `php artisan test --compact --filter=PrintBarcodeTest`
Expected: FAIL (route / method not found)

- [ ] **Step 3: Add `printBarcode` to `ProductServiceInterface` & `ProductService`**

In `ProductServiceInterface.php`:
```php
public function printBarcode(string $id, int $quantity);
```

In `ProductService.php`:
```php
public function printBarcode(string $id, int $quantity)
{
    $product = $this->productRepository->getById($id);

    if (empty($product->barcode)) {
        throw new \Exception(trans('message.error.barcode_not_found'), 422);
    }

    $generator = new \Picqer\Barcode\BarcodeGeneratorPNG();
    $barcodeBase64 = base64_encode($generator->getBarcode($product->barcode, $generator::TYPE_CODE_128));

    $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.barcode', [
        'product' => $product,
        'quantity' => $quantity,
        'barcodeBase64' => $barcodeBase64,
    ]);

    return $pdf->stream("barcode-{$product->barcode}.pdf");
}
```

- [ ] **Step 4: Create Blade template `resources/views/pdf/barcode.blade.php`**

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Barcode {{ $product->name }}</title>
    <style>
        @page { margin: 10px; }
        body { font-family: sans-serif; font-size: 10px; margin: 0; padding: 0; }
        .grid { width: 100%; }
        .barcode-card {
            display: inline-block;
            width: 31%;
            margin: 1%;
            padding: 6px;
            border: 1px dashed #ccc;
            box-sizing: border-box;
            text-align: center;
            vertical-align: top;
        }
        .product-name { font-weight: bold; font-size: 10px; height: 22px; overflow: hidden; }
        .barcode-img { width: 90%; height: 35px; margin: 4px 0; }
        .barcode-code { font-size: 9px; font-family: monospace; }
        .product-price { font-weight: bold; font-size: 10px; margin-top: 2px; }
    </style>
</head>
<body>
    <div class="grid">
        @for ($i = 0; $i < $quantity; $i++)
            <div class="barcode-card">
                <div class="product-name">{{ $product->name }}</div>
                <img src="data:image/png;base64,{{ $barcodeBase64 }}" class="barcode-img" />
                <div class="barcode-code">{{ $product->barcode }}</div>
                <div class="product-price">Rp {{ number_format($product->price, 0, ',', '.') }}</div>
            </div>
        @endfor
    </div>
</body>
</html>
```

- [ ] **Step 5: Implement `printBarcode` in `ApiProductController`**

```php
public function printBarcode(PrintBarcodeProductRequest $request, string $id)
{
    try {
        return $this->productService->printBarcode($id, $request->validated('quantity'));
    } catch (\Throwable $th) {
        return ResponseApi::make(false, $th->getMessage(), null, $th->getCode() ?: 400);
    }
}
```

Add permission middleware in `middleware()` method:
```php
new Middleware(
    'permission:'.ProductPermissionEnums::READ_PRODUCT->value,
    only: ['index', 'show', 'getByBarcode', 'exportProductExcelData', 'exportProductPdfData', 'printBarcode']
),
```

- [ ] **Step 6: Run tests to verify it passes**

Run: `php artisan test --compact --filter=PrintBarcodeTest`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add app/Support/Interfaces/Services/ProductServiceInterface.php app/Services/ProductService.php app/Http/Controllers/Api/ApiProductController.php resources/views/pdf/barcode.blade.php tests/Feature/Api/Product/PrintBarcodeTest.php
git commit -m "feat: implement printBarcode service, controller method, and PDF template"
```

---

### Task 3: Frontend Modal & Action Button Integration

**Files:**
- Create: `resources/js/pages/product/dialog-modal/PrintBarcodeModal.tsx`
- Modify: `resources/js/pages/product/columns.tsx`
- Modify: `resources/js/pages/product/index.tsx`
- Modify: `resources/js/locales/id/translation.json`
- Modify: `resources/js/locales/en/translation.json`

**Interfaces:**
- Consumes: `Product` object from row action.
- Produces: React Modal for Barcode Print Quantity Input + PDF Blob display/download.

- [ ] **Step 1: Add frontend locale strings**

In `resources/js/locales/id/translation.json`:
```json
"page": {
  "product": {
    "print_barcode_modal": {
      "title": "Cetak Barcode Produk",
      "description": "Masukkan jumlah barcode yang ingin dicetak.",
      "quantity_label": "Jumlah Barcode",
      "submit_btn": "Cetak PDF",
      "cancel_btn": "Batal",
      "no_barcode_error": "Produk ini belum memiliki kode barcode."
    }
  }
}
```

In `resources/js/locales/en/translation.json`:
```json
"page": {
  "product": {
    "print_barcode_modal": {
      "title": "Print Product Barcode",
      "description": "Enter the quantity of barcode labels to print.",
      "quantity_label": "Barcode Quantity",
      "submit_btn": "Print PDF",
      "cancel_btn": "Cancel",
      "no_barcode_error": "This product does not have a barcode code."
    }
  }
}
```

- [ ] **Step 2: Create `PrintBarcodeModal.tsx`**

```tsx
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Printer, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { Product } from '@/support/models/product';

interface PrintBarcodeModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product: Product | null;
}

export function PrintBarcodeModal({
    open,
    onOpenChange,
    product,
}: PrintBarcodeModalProps) {
    const { t } = useTranslation();
    const [quantity, setQuantity] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handlePrint = async () => {
        if (!product) return;

        if (!product.barcode) {
            setErrorMessage(
                t(
                    'page.product.print_barcode_modal.no_barcode_error',
                    'Produk ini belum memiliki kode barcode.',
                ),
            );
            return;
        }

        try {
            setLoading(true);
            setErrorMessage(null);

            const response = await fetch(
                `/api/products/${product.id}/print-barcode`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/pdf, application/json',
                        'X-CSRF-TOKEN':
                            (
                                document.querySelector(
                                    'meta[name="csrf-token"]',
                                ) as HTMLMetaElement
                            )?.content || '',
                    },
                    body: JSON.stringify({ quantity }),
                },
            );

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Error generating PDF');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank');
            onOpenChange(false);
        } catch (error: any) {
            setErrorMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Printer className="h-5 w-5" />
                        {t(
                            'page.product.print_barcode_modal.title',
                            'Cetak Barcode Produk',
                        )}
                    </DialogTitle>
                    <DialogDescription>
                        {t(
                            'page.product.print_barcode_modal.description',
                            'Masukkan jumlah barcode yang ingin dicetak.',
                        )}
                    </DialogDescription>
                </DialogHeader>

                {errorMessage && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{errorMessage}</AlertDescription>
                    </Alert>
                )}

                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Produk</Label>
                        <span className="col-span-3 font-semibold">
                            {product?.name} ({product?.barcode || '-'})
                        </span>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="quantity" className="text-right">
                            {t(
                                'page.product.print_barcode_modal.quantity_label',
                                'Jumlah Barcode',
                            )}
                        </Label>
                        <Input
                            id="quantity"
                            type="number"
                            min={1}
                            max={500}
                            value={quantity}
                            onChange={(e) => setQuantity(Number(e.target.value))}
                            className="col-span-3"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                    >
                        {t(
                            'page.product.print_barcode_modal.cancel_btn',
                            'Batal',
                        )}
                    </Button>
                    <Button onClick={handlePrint} disabled={loading}>
                        {loading
                            ? 'Processing...'
                            : t(
                                  'page.product.print_barcode_modal.submit_btn',
                                  'Cetak PDF',
                              )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
```

- [ ] **Step 3: Update `columns.tsx` to include Print Barcode action above Delete button**

Add `onPrintBarcodeClick?: (product: Product) => void;` to `ColumnsProps`.
Add `Barcode` or `Printer` icon import from `lucide-react`.

In action dropdown (above `PERMISSIONENUMS.PRODUCT.DELETE`):
```tsx
<Can permission={PERMISSIONENUMS.PRODUCT.READ}>
    <DropdownMenuItem
        onClick={() => props?.onPrintBarcodeClick?.(row.original)}
    >
        <Barcode className="mr-0.5 h-4 w-4" />
        {t(
            'component.data_table.action_menu.print_barcode_btn',
            'Cetak Barcode',
        )}
    </DropdownMenuItem>
</Can>
```

- [ ] **Step 4: Wire up `PrintBarcodeModal` in `resources/js/pages/product/index.tsx`**

State in `index.tsx`:
```tsx
const [isPrintBarcodeOpen, setIsPrintBarcodeOpen] = useState(false);
const [selectedProductForBarcode, setSelectedProductForBarcode] = useState<Product | null>(null);
```

Pass `onPrintBarcodeClick` to `columns`:
```tsx
onPrintBarcodeClick: (product) => {
    setSelectedProductForBarcode(product);
    setIsPrintBarcodeOpen(true);
}
```

Render modal at bottom of `index.tsx`:
```tsx
<PrintBarcodeModal
    open={isPrintBarcodeOpen}
    onOpenChange={setIsPrintBarcodeOpen}
    product={selectedProductForBarcode}
/>
```

- [ ] **Step 5: Run Pint code formatter**

```bash
vendor/bin/pint --dirty --format agent
```

- [ ] **Step 6: Commit**

```bash
git add resources/js/pages/product/ resources/js/locales/
git commit -m "feat: integrate PrintBarcodeModal and action menu item in product table"
```

---

## Self-Review Checklist
1. **Spec Coverage**:
   - UI button in product action list above Delete? Yes (Task 3).
   - Pop-up dialog with barcode quantity input? Yes (Task 3).
   - Integrated into `ApiProductController`? Yes (Task 2).
   - Service-Repository pattern used? Yes (Task 2).
   - Multi-language in frontend & backend? Yes (Tasks 1 & 3).
   - Returns "Barcode tidak ditemukan" if barcode empty? Yes (Tasks 1 & 2).
2. **Placeholder Scan**: No placeholders found.
3. **Type Consistency**: Verified all interfaces and types match existing Product models.
