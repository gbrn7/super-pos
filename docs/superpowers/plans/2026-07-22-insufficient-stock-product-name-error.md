# Insufficient Stock Product Name Error Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Modify checkout validation error to include the name of the product that has insufficient stock.

**Architecture:** Use Laravel's standard translation parameter parsing by modifying translation files `lang/id/message.php` and `lang/en/message.php` with a `:product` placeholder, updating `TransactionService.php` to pass this placeholder, and updating the Pest feature test.

**Tech Stack:** PHP 8.4, Laravel 13, Pest PHP 4

## Global Constraints

- Follow existing codebase patterns.
- Do not use placeholders (TBD, TODO).
- Run `vendor/bin/pint --format agent` to format PHP code changes.

---

### Task 1: Update Insufficient Stock Error Logic and Tests

**Files:**
- Modify: `tests/Feature/Cashier/CashierCheckoutTest.php`
- Modify: `lang/id/message.php`
- Modify: `lang/en/message.php`
- Modify: `app/Services/TransactionService.php`

**Interfaces:**
- Consumes: None (Updates existing checkout flow)
- Produces: Dynamic translation support for `out_of_stock` error message.

- [x] **Step 1: Write the failing test**

  Modify `tests/Feature/Cashier/CashierCheckoutTest.php` lines 219-244:
  ```php
  test('checkout fails when product stock is insufficient', function () {
      $user = cashierSetupUser();
      $paymentMethod = PaymentMethod::create(['name' => 'Cash', 'desc' => '', 'image' => '']);
      $product = Product::factory()->create([
          'name' => 'Kopi Susu',
          'price' => 5000,
          'cost_price' => 3000,
          'stock' => 2,
          'is_unlimited' => false,
          'is_active' => true
      ]);

      $response = $this->actingAs($user)->postJson('/api/transactions/checkout', [
          'payment_method_id' => $paymentMethod->id,
          'total_amount' => 25000,
          'discount_amount' => 0,
          'payment_amount' => 25000,
          'change_amount' => 0,
          'items' => [
              [
                  'product_id' => $product->id,
                  'unit_name' => $product->unit->name,
                  'quantity' => 5,
                  'price' => $product->price,
                  'cost_price' => $product->cost_price,
                  'discount' => 0,
              ],
          ],
      ]);

      $response->assertStatus(422);
      $response->assertJsonPath('message', 'Stok produk Kopi Susu tidak mencukupi');
  });
  ```

- [x] **Step 2: Run test to verify it fails**

  Run: `php artisan test --compact --filter="checkout fails when product stock is insufficient"`
  Expected: FAIL (recieved: "Stok produk tidak mencukupi")

- [x] **Step 3: Update translation files**

  Modify `lang/id/message.php` at line 34:
  ```php
          'out_of_stock' => 'Stok produk :product tidak mencukupi',
  ```

  Modify `lang/en/message.php` at line 35:
  ```php
          'out_of_stock' => 'Product stock for :product is insufficient',
  ```

- [x] **Step 4: Update checkout logic in TransactionService.php**

  Modify `app/Services/TransactionService.php` at lines 147-149:
  ```php
                      if (! $product->is_unlimited && $product->stock < $item['quantity']) {
                          throw new Exception(trans('message.error.out_of_stock', ['product' => $product->name]), Response::HTTP_UNPROCESSABLE_ENTITY);
                      }
  ```

- [x] **Step 5: Format PHP code using Pint**

  Run: `vendor/bin/pint --dirty --format agent`

- [x] **Step 6: Run test to verify it passes**

  Run: `php artisan test --compact --filter="checkout fails when product stock is insufficient"`
  Expected: PASS

- [x] **Step 7: Run all cashier tests to ensure no regressions**

  Run: `php artisan test --compact tests/Feature/Cashier/CashierCheckoutTest.php`
  Expected: All tests pass

- [x] **Step 8: Commit the changes**

  Run:
  ```bash
  git add lang/id/message.php lang/en/message.php app/Services/TransactionService.php tests/Feature/Cashier/CashierCheckoutTest.php
  git commit -m "feat: add product name to insufficient stock error message"
  ```
