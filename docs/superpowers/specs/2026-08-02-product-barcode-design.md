# Product Barcode Printing Feature Design Specification

## Overview
This feature allows users to generate and print barcodes for products in PDF format directly from the Product Management list. Users can specify the exact number of barcode labels required.

## Requirements Summary
1. **UI Action Button**: Added to the product action list dropdown/menu in `resources/js/pages/product/columns.tsx`, positioned above the Delete button.
2. **Modal Dialog**: Pop-up dialog requesting the quantity of barcode labels to print.
3. **Backend API**: Integrated into `ApiProductController`.
4. **Architecture**: Implemented using Service-Repository pattern (`ProductRepository`, `BarcodeService`/`ProductService`).
5. **Barcode Validation**: If product has no barcode code/SKU, return translated error response ("Barcode tidak ditemukan" / "Barcode not found").
6. **PDF Generation**: Generates a PDF containing a responsive multi-column label grid with the exact number of requested barcode items.
7. **Multi-language**: All frontend dialog text and backend API/validation messages support i18n (Indonesian & English).

## Backend Design (Laravel)
- **Controller**: `app/Http/Controllers/Api/ApiProductController.php`
  - Method: `printBarcode(PrintBarcodeRequest $request, Product $product)`
- **Service & Repository**:
  - `ProductRepository`: Fetch product details.
  - `BarcodeService` or `ProductService`: Generate barcode SVG/HTML and compile PDF stream.
- **Blade PDF Template**: `resources/views/pdf/barcode.blade.php`
- **Lang files**: `lang/id/product.php` & `lang/en/product.php`

## Frontend Design (React / Inertia)
- **Action Menu**: In `columns.tsx`, add "Print Barcode" action above "Delete".
- **Dialog Component**: `PrintBarcodeModal.tsx` containing:
  - Product info summary (Name, Barcode code).
  - Quantity numeric input (min: 1, default: 1).
  - Multi-language support via locale hooks.
  - Error state display if API returns "Barcode not found".

## Validation & Error Handling
- HTTP 422 / 404 response with message `product.barcode_not_found` if `$product->barcode` is empty.
