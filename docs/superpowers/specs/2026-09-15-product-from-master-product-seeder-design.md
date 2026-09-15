# Product From Master Product Seeder Design

## Overview
A dedicated Laravel database seeder (`ProductFromMasterProductSeeder`) that populates the `products` table using records from the `master_products` table in chunks of 250 rows.

## Architecture & Data Flow

```
+------------------+
| master_products  |
+--------+---------+
         |
         | chunkById(250)
         v
+-------------------------------------------------------+
| ProductFromMasterProductSeeder                         |
|                                                       |
| 1. In-memory Category & Unit resolution cache         |
|    - Category::firstOrCreate (fallback: "Umum")       |
|    - Unit::firstOrCreate (fallback: "Pcs")            |
|                                                       |
| 2. Barcode & SKU Generation / Deduplication           |
|    - Existing barcode check in products               |
|    - BarcodeGenerator::generate() if barcode is null  |
|    - Standard SKU generation                          |
|                                                       |
| 3. Set default attributes:                            |
|    - stock = rand(10, 50)                             |
|    - is_active = true                                 |
|    - is_unlimited = false                             |
|    - sold_quantity = 0                                |
+------------------------+------------------------------+
                         |
                         | Product::insertOrIgnore(batch)
                         v
                  +--------------+
                  |   products   |
                  +--------------+
```

## Detailed Specifications

### 1. Seeder Location & Class Name
- File: `database/seeders/ProductFromMasterProductSeeder.php`
- Class: `Database\Seeders\ProductFromMasterProductSeeder`

### 2. Chunking & Query Performance
- Query `MasterProduct::query()->orderBy('id')->chunkById(250, function ($masterProducts) { ... })`.
- Pre-load existing categories and units into memory maps (`$categoryMap`, `$unitMap`) to prevent N+1 queries during seeding.
- Pre-check registered barcodes or track barcodes within the seeder to ensure no duplicate barcode violations.

### 3. Category & Unit Mapping
- For each record:
  - Trim `category_name`. If empty/null, use `"Umum"`.
  - Check `$categoryMap`. If not found in memory, query or create via `Category::firstOrCreate(['name' => $catName])` and cache its ID.
  - Trim `unit_name`. If empty/null, use `"Pcs"`.
  - Check `$unitMap`. If not found in memory, query or create via `Unit::firstOrCreate(['name' => $unitName])` and cache its ID.

### 4. Attribute Transformation & Defaults
- `category_id`: Resolved category ID.
- `unit_id`: Resolved unit ID.
- `name`: `$masterProduct->name`.
- `sku`: Standard format based on headline uppercase consonants plus 8 random uppercase characters (`Str::of($name)->headline()->replaceMatches('/[^A-Z]/', '').'-'.strtoupper(Str::random(8))`). If the resulting prefix is empty, fallback to `'PRD-'.strtoupper(Str::random(8))`.
- `barcode`: If present and valid, use `$masterProduct->barcode`. If empty or null, generate using `App\Support\Utils\BarcodeGenerator::generate()`.
- `is_active`: `true`.
- `is_unlimited`: `false`.
- `desc`: `$masterProduct->desc`.
- `stock`: Random integer between `10` and `50` (`rand(10, 50)`).
- `sold_quantity`: `0`.
- `image`: `null`.
- `price`: `$masterProduct->price`.
- `cost_price`: `$masterProduct->cost_price`.
- `created_at` & `updated_at`: `now()`.

### 5. Insertion & Error Handling
- Use `Product::insertOrIgnore($batch)` per 250 records.
- Wrap execution in a database transaction or chunk-level safe execution with console output logging (e.g., displaying progress per chunk).

## Testing Strategy
- Feature test (`tests/Feature/ProductFromMasterProductSeederTest.php`) using Pest:
  - Create multiple `MasterProduct` test records (e.g. 10 to 500 records, including records with empty/null category, unit, or barcode).
  - Run the `ProductFromMasterProductSeeder`.
  - Verify that corresponding `Product` records are inserted with correct `category_id`, `unit_id`, `stock` within range 10-50, valid `sku`, and matching prices.
  - Verify that existing barcodes are not duplicated and chunks are handled smoothly.
