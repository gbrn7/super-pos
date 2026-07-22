# Design: Insufficient Stock Product Name Error

This specification details the changes needed to modify the checkout validation error when a product is not unlimited and its stock is less than the requested quantity, so that the error message includes the name of the insufficient product.

## Requirements

1. **Specific Error Message**: The insufficient stock error message should identify the specific product that caused the failure.
2. **Localization**: Maintain supports for both Indonesian and English translations.
3. **Pest Tests**: Update existing test cases that assert the generic error message to reflect the new dynamic message.

## Proposed Changes

### 1. Translations (`lang/id/message.php` and `lang/en/message.php`)

Add the `:product` placeholder parameter to the `out_of_stock` error message.

**Indonesian (`lang/id/message.php`):**
```php
'out_of_stock' => 'Stok produk :product tidak mencukupi',
```

**English (`lang/en/message.php`):**
```php
'out_of_stock' => 'Stock for product :product is insufficient',
```

### 2. Service Class (`app/Services/TransactionService.php`)

Update the `checkout` method to pass the product's name as a parameter when retrieving the translation.

```php
if (! $product->is_unlimited && $product->stock < $item['quantity']) {
    throw new Exception(
        trans('message.error.out_of_stock', ['product' => $product->name]),
        Response::HTTP_UNPROCESSABLE_ENTITY
    );
}
```

### 3. Feature Test (`tests/Feature/Cashier/CashierCheckoutTest.php`)

Update the test case `checkout fails when product stock is insufficient` to assert the updated error message.

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
        // ... payload with product id and quantity 5 ...
    ]);

    $response->assertStatus(422);
    $response->assertJsonPath('message', 'Stok produk Kopi Susu tidak mencukupi');
});
```
