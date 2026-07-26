# Design: Product Sold Quantity Track and Display

This specification details the changes needed to track and display the `sold_quantity` of products. `sold_quantity` will be incremented when transactions are successfully checked out, exposed via the Product Model and API Resources, and displayed on the product list page and product details, while keeping it hidden from the create/edit forms.

## Requirements

1. **Model Fillable**: Add `sold_quantity` to the `$fillable` array in the `Product` model.
2. **API Resource Expose**: Add `sold_quantity` to the fields returned by `ProductResource`.
3. **Repository Action**: Implement `incrementSoldQuantity(Product $product, int $quantity = 1)` in `ProductRepository` and `ProductRepositoryInterface`.
4. **Checkout Integration**: Invoke `incrementSoldQuantity` during checkout processing in `TransactionService`.
5. **Frontend List Table**: Add a "Terjual" column to the product columns in `resources/js/pages/product/columns.tsx`.
6. **Frontend Details Panel**: Add "Terjual" to the details display modal/drawer if applicable.

## Proposed Changes

### 1. Model & Resources

**`app/Models/Product.php`**
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
        'sold_quantity', // Add here
        'image',
        'price',
        'cost_price',
    ];
```

**`app/Http/Resources/ProductResource.php`**
```php
        return [
            'id' => $this->id,
            'name' => $this->name,
            // ...
            'stock' => $this->stock,
            'sold_quantity' => $this->sold_quantity, // Add here
            'price' => $this->price,
            // ...
        ];
```

### 2. Repository & Interfaces

**`app/Support/Interfaces/Repositories/ProductRepositoryInterface.php`**
```php
    /**
     * Increment sold quantity of a product.
     */
    public function incrementSoldQuantity(Product $product, int $quantity = 1): bool;
```

**`app/Repositories/ProductRepository.php`**
```php
    public function incrementSoldQuantity(Product $product, int $quantity = 1): bool
    {
        return (bool) $product->increment('sold_quantity', $quantity);
    }
```

### 3. Service Checkout Integration

**`app/Services/TransactionService.php`**
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
                    
                    // Increment the sold quantity
                    $this->productRepository->incrementSoldQuantity($product, $item['quantity']);
                }
```

### 4. Frontend Integration

**`resources/js/pages/product/columns.tsx`**
Add the `sold_quantity` column:
```tsx
        {
            id: t('page.product.data_table.columns.sold_quantity_column_label', 'Terjual'),
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
        },
```
Placed before/after the stock column.

## Verification Plans

1. **Unit Test**: Run `vendor/bin/pest tests/Unit/ProductTest.php` to ensure the sold quantity is calculated correctly and the test passes.
2. **Pint Code Style**: Run `vendor/bin/pint --dirty --format agent` to format PHP code.
