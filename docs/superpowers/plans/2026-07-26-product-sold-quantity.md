# Product Sold Quantity Track and Display Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Track and display `sold_quantity` on products by updating it upon transaction checkout, exposing it in models/resources, and displaying it in the frontend product list table and details.

**Architecture:** Increment `sold_quantity` directly in `ProductRepository` which is called by `TransactionService` during checkout. Expose the field via model `$fillable` and `ProductResource`. Display the field in React components (`columns.tsx`).

**Tech Stack:** Laravel (PHP 8.4, Laravel 13), Inertia.js (React 19), Tailwind CSS v4.

## Global Constraints

- Do not add it to the product forms (add/edit form).
- Update the existing migration file (`database/migrations/2026_04_19_143117_create_products_table.php`) instead of adding a new migration file. (Note: `sold_quantity` column is already defined in the migration file).
- Follow Laravel coding conventions (strict types, constructor promotion, Pint formatting).

---

### Task 1: Expose sold_quantity in Model, Repository, and API Resource

**Files:**
- Modify: `app/Models/Product.php`
- Modify: `app/Http/Resources/ProductResource.php`
- Modify: `app/Support/Interfaces/Repositories/ProductRepositoryInterface.php`
- Modify: `app/Repositories/ProductRepository.php`
- Test: Run existing `tests/Unit/ProductTest.php` (will still fail until checkout logic is updated in Task 2)

**Interfaces:**
- Produces: `ProductRepositoryInterface::incrementSoldQuantity(Product $product, int $quantity = 1): bool`

- [ ] **Step 1: Add sold_quantity to Product model `$fillable`**
  Modify [Product.php](file:///home/raygbrn/project/laravel/super-pos/app/Models/Product.php):
  ```php
      protected $fillable = [
          'category_id',
          'unit_id',
          'sku',
          'name',
          'barcode',
          'is_active',
          'is_unlimited',
          'desc',
          'stock',
          'sold_quantity',
          'image',
          'price',
          'cost_price',
      ];
  ```

- [ ] **Step 2: Add sold_quantity to ProductResource**
  Modify [ProductResource.php](file:///home/raygbrn/project/laravel/super-pos/app/Http/Resources/ProductResource.php):
  ```php
      public function toArray(Request $request): array
      {
          return [
              'id' => $this->id,
              'name' => $this->name,
              'barcode' => $this->barcode,
              'sku' => $this->sku,
              'category_id' => $this->category_id,
              'category_name' => $this->category->name,
              'unit_id' => $this->unit_id,
              'unit_name' => $this->unit->name,
              'is_active' => $this->is_active,
              'is_unlimited' => $this->is_unlimited,
              'stock' => $this->stock,
              'sold_quantity' => $this->sold_quantity,
              'price' => $this->price,
              'cost_price' => $this->cost_price,
              'desc' => $this->desc,
              'image' => isset($this->image) ? asset('storage/'.$this->image) : null,
              'created_at' => $this->getRawOriginal('created_at'),
              'updated_at' => $this->getRawOriginal('updated_at'),
          ];
      }
  ```

- [ ] **Step 3: Define incrementSoldQuantity in repository interface**
  Modify [ProductRepositoryInterface.php](file:///home/raygbrn/project/laravel/super-pos/app/Support/Interfaces/Repositories/ProductRepositoryInterface.php):
  ```php
      /**
       * Increment sold quantity of a product.
       */
      public function incrementSoldQuantity(Product $product, int $quantity = 1): bool;
  ```

- [ ] **Step 4: Implement incrementSoldQuantity in repository**
  Modify [ProductRepository.php](file:///home/raygbrn/project/laravel/super-pos/app/Repositories/ProductRepository.php):
  ```php
      public function incrementSoldQuantity(Product $product, int $quantity = 1): bool
      {
          return (bool) $product->increment('sold_quantity', $quantity);
      }
  ```

- [ ] **Step 5: Run Pint to format code**
  Run: `vendor/bin/pint --dirty --format agent`
  Expected: Code formatted successfully.

- [ ] **Step 6: Commit**
  ```bash
  git add app/Models/Product.php app/Http/Resources/ProductResource.php app/Support/Interfaces/Repositories/ProductRepositoryInterface.php app/Repositories/ProductRepository.php
  git commit -m "feat: add sold_quantity to Product model, resource, and repository interface"
  ```

---

### Task 2: Increment Sold Quantity on Checkout

**Files:**
- Modify: `app/Services/TransactionService.php`
- Test: `tests/Unit/ProductTest.php`

**Interfaces:**
- Consumes: `ProductRepositoryInterface::incrementSoldQuantity(Product $product, int $quantity = 1): bool`

- [ ] **Step 1: Update transaction checkout service to increment sold quantity**
  Modify [TransactionService.php](file:///home/raygbrn/project/laravel/super-pos/app/Services/TransactionService.php):
  In the `checkout` method inside the `validatedItems` loop (around line 180-199):
  ```php
                  $totalCost = 0;
                  foreach ($validatedItems as $validated) {
                      $item = $validated['item'];
                      $product = $validated['product'];
  
                      $this->transactionDetailRepository->create([
                          'transaction_id' => $transaction->id,
                          'product_id' => $item['product_id'],
                          'unit_name' => $item['unit_name'],
                          'quantity' => $item['quantity'],
                          'price' => $item['price'],
                          'cost_price' => $item['cost_price'],
                          'discount' => $item['discount'] ?? 0,
                      ]);
  
                      $totalCost += $item['cost_price'] * $item['quantity'];
  
                      if (! $product->is_unlimited) {
                          $this->productRepository->decrementStock($product, $item['quantity']);
                      }

                      $this->productRepository->incrementSoldQuantity($product, $item['quantity']);
                  }
  ```

- [ ] **Step 2: Run ProductTest to verify it passes**
  Run: `vendor/bin/pest tests/Unit/ProductTest.php`
  Expected: PASS

- [ ] **Step 3: Run Pint to format code**
  Run: `vendor/bin/pint --dirty --format agent`
  Expected: Code formatted successfully.

- [ ] **Step 4: Commit**
  ```bash
  git add app/Services/TransactionService.php
  git commit -m "feat: increment sold_quantity of products during checkout"
  ```

---

### Task 3: Display sold_quantity in Frontend Table

**Files:**
- Modify: `resources/js/pages/product/columns.tsx`
- Modify: `resources/js/pages/product/dialog-modal/detail-product-modal.tsx` (if it exists, we will verify this file first)

- [ ] **Step 1: Add Sold Quantity column to table columns**
  Modify [columns.tsx](file:///home/raygbrn/project/laravel/super-pos/resources/js/pages/product/columns.tsx):
  ```tsx
          {
              id: t(
                  'page.product.data_table.columns.sold_quantity_column_label',
                  'Terjual',
              ),
              accessorKey: 'sold_quantity',
              header: ({ column }) => (
                  <ServerSideDataTableHeader
                      column={column}
                      title={t(
                          'page.product.data_table.columns.sold_quantity_column_label',
                          'Terjual',
                      )}
                      sortKey="sold_quantity"
                      orderBy={props?.orderBy}
                      order={props?.order}
                      onSortChange={props?.onSortChange}
                  />
              ),
              cell: ({ row }) => (
                  <Badge className="bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">
                      {row.original.sold_quantity ?? 0}
                  </Badge>
              ),
          },
  ```
  Place it after the stock column in the columns array.

- [ ] **Step 2: Commit**
  ```bash
  git add resources/js/pages/product/columns.tsx
  git commit -m "feat: display sold_quantity column in frontend product list"
  ```
