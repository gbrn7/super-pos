# Product Return Validation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement frontend validation and detail display in the return modal to prevent cashiers from entering invalid quantities and show them exact historical return data.

**Architecture:** Update the transaction repository methods to eager load return records, update the transaction detail API resource to dynamically compute `returned_quantity`, and modify the React return modal to fetch fresh data and enforce validation/UI constraints.

**Tech Stack:** Laravel (PHP 8.4), Inertia, React 19, TailwindCSS, TypeScript.

## Global Constraints

- PHP version 8.4 compliance.
- No raw SQL, follow existing repository patterns.
- Follow React type definitions and hook conventions.
- Do not run `vendor/bin/pint --test --format agent`, run `vendor/bin/pint --format agent` to format PHP code.

---

### Task 1: Backend Eager Loading in TransactionRepository

**Files:**
- Modify: `app/Repositories/TransactionRepository.php`

**Interfaces:**
- Consumes: Eloquent Relationship `returns.details` on `Transaction` model.
- Produces: Eager loaded relations in `getById` and `getByInvoiceNumber`.

- [ ] **Step 1: Modify `getById` and `getByInvoiceNumber`**

  Modify [TransactionRepository.php](file:///home/raygbrn/project/laravel/super-pos/app/Repositories/TransactionRepository.php) to eager load `returns.details`:

  ```php
  public function getById(int $id): ?Transaction
  {
      return Transaction::with(['user', 'paymentMethod', 'transactionDetails.product', 'returns.details'])->find($id);
  }

  public function getByInvoiceNumber(string $invoiceNumber): ?Transaction
  {
      return Transaction::with(['user', 'paymentMethod', 'transactionDetails.product', 'returns.details'])->where('invoice_number', $invoiceNumber)->first();
  }
  ```

- [ ] **Step 2: Run existing tests to ensure no regressions**

  Run: `php artisan test --compact`
  Expected: PASS

- [ ] **Step 3: Commit changes**

  ```bash
  git add app/Repositories/TransactionRepository.php
  git commit -m "feat: eager load returns.details in TransactionRepository"
  ```

---

### Task 2: Expose `returned_quantity` in TransactionDetailResource

**Files:**
- Modify: `app/Http/Resources/TransactionDetailResource.php`
- Modify: `tests/Feature/ReturnServiceTest.php`

**Interfaces:**
- Consumes: Eager loaded `returns` relation on `TransactionDetail`.
- Produces: `returned_quantity` field in JSON API response.

- [ ] **Step 1: Add `returned_quantity` to `TransactionDetailResource`**

  Modify [TransactionDetailResource.php](file:///home/raygbrn/project/laravel/super-pos/app/Http/Resources/TransactionDetailResource.php):

  ```php
  public function toArray(Request $request): array
  {
      return [
          'id' => $this->id,
          'transaction_id' => $this->transaction_id,
          'product_id' => $this->product_id,
          'product_name' => $this->whenLoaded('product', fn () => $this->product->name),
          'unit_name' => $this->unit_name,
          'quantity' => $this->quantity,
          'cost_price' => $this->cost_price,
          'price' => $this->price,
          'discount' => $this->discount,
          'subtotal' => ($this->price - $this->discount) * $this->quantity,
          'returned_quantity' => $this->when(
              $this->transaction && $this->transaction->relationLoaded('returns'),
              fn () => $this->transaction->returns->flatMap->details->where('product_id', $this->product_id)->sum('quantity')
          ),
          'created_at' => $this->created_at,
          'updated_at' => $this->updated_at,
      ];
  }
  ```

- [ ] **Step 2: Update ReturnServiceTest to verify resource data**

  Modify [ReturnServiceTest.php](file:///home/raygbrn/project/laravel/super-pos/tests/Feature/ReturnServiceTest.php) to assert that loading a transaction now exposes `returned_quantity`.

  ```php
  // Add test at the end of file
  test('transaction detail resource returns returned_quantity when returns relation is loaded', function () {
      $product = Product::factory()->create();
      $transaction = Transaction::factory()->create();
      $detail = TransactionDetail::create([
          'transaction_id' => $transaction->id,
          'product_id' => $product->id,
          'unit_name' => 'Pcs',
          'quantity' => 5,
          'price' => 20000,
          'cost_price' => 15000,
          'discount' => 0,
      ]);

      $user = User::factory()->create();
      $service = resolve(App\Services\ReturnService::class);
      $service->processReturn($transaction->id, [['product_id' => $product->id, 'quantity' => 2]], 'Reason', $user);

      $freshTx = Transaction::with(['returns.details'])->find($transaction->id);
      $resource = new App\Http\Resources\TransactionResource($freshTx);
      $response = $resource->response()->getData(true);

      $returnedQty = $response['data']['details'][0]['returned_quantity'];
      expect($returnedQty)->toBe(2);
  });
  ```

- [ ] **Step 3: Run the test**

  Run: `php artisan test --compact --filter=ReturnServiceTest`
  Expected: PASS

- [ ] **Step 4: Commit changes**

  ```bash
  git add app/Http/Resources/TransactionDetailResource.php tests/Feature/ReturnServiceTest.php
  git commit -m "feat: expose returned_quantity in TransactionDetailResource and write test"
  ```

---

### Task 3: Frontend Update - ReturnModal UI & Validation

**Files:**
- Modify: `resources/js/Components/ReturnModal.tsx`

**Interfaces:**
- Consumes: `returned_quantity` from API response.
- Produces: Validated input fields and descriptive text details in UI.

- [ ] **Step 1: Force fetch transaction and update React state logic**

  In [ReturnModal.tsx](file:///home/raygbrn/project/laravel/super-pos/resources/js/Components/ReturnModal.tsx), change the `useEffect` hook to always call the API when the modal is opened so we get fresh `returned_quantity` values:

  ```typescript
      useEffect(() => {
          if (isOpen && transaction?.id) {
              setQuantities({});
              setReason('');
              setLoading(true);
              const apiUrl = apiShowTransaction(transaction.id).url;
              axiosInstance
                  .get<ResponseApi<Transaction>>(apiUrl)
                  .then((res) => {
                      if (res.data.success && res.data.data) {
                          const fetched = res.data.data.details || (res.data.data as any).transactionDetails || (res.data.data as any).transaction_details || [];
                          setTxDetails(fetched);
                      }
                  })
                  .finally(() => setLoading(false));
          }
      }, [isOpen, transaction?.id]);
  ```

- [ ] **Step 2: Update Select All and input change handlers to respect sisa**

  Update helper functions in [ReturnModal.tsx](file:///home/raygbrn/project/laravel/super-pos/resources/js/Components/ReturnModal.tsx):

  ```typescript
      const handleQtyChange = (productId: number, qty: number, max: number) => {
          const validQty = Math.max(0, Math.min(qty, max));
          setQuantities((prev) => ({ ...prev, [productId]: validQty }));
      };

      const handleSelectAllProduct = (productId: number, maxQty: number) => {
          setQuantities((prev) => {
              const currentQty = prev[productId] || 0;
              const newQty = currentQty === maxQty ? 0 : maxQty;
              return { ...prev, [productId]: newQty };
          });
      };

      const isAllTransactionSelected = details.length > 0 && details.every((detail) => {
          const maxQty = detail.quantity - (detail.returned_quantity || 0);
          if (maxQty <= 0) return true; // Ignore already fully returned items
          return (quantities[detail.product_id] || 0) === maxQty;
      });

      const handleSelectAllTransaction = () => {
          if (isAllTransactionSelected) {
              setQuantities({});
          } else {
              const allSelected: { [productId: number]: number } = {};
              details.forEach((detail) => {
                  const maxQty = detail.quantity - (detail.returned_quantity || 0);
                  if (maxQty > 0) {
                      allSelected[detail.product_id] = maxQty;
                  }
              });
              setQuantities(allSelected);
          }
      };
  ```

- [ ] **Step 3: Modify row rendering & display detailed remaining quantity**

  Modify the table body mapping inside [ReturnModal.tsx](file:///home/raygbrn/project/laravel/super-pos/resources/js/Components/ReturnModal.tsx):

  ```tsx
                                      ) : details.length > 0 ? (
                                          details.map((detail) => {
                                              const qty = quantities[detail.product_id] || 0;
                                              const subtotal = qty * Number(detail.price);
                                              const returnedQty = detail.returned_quantity || 0;
                                              const maxQty = detail.quantity - returnedQty;
                                              const isMaxSelected = qty === maxQty;
                                              const isDisabled = maxQty <= 0;

                                              return (
                                                  <TableRow 
                                                      key={detail.id} 
                                                      className={isDisabled ? "opacity-50 bg-muted/20" : ""}
                                                  >
                                                      <TableCell className="font-medium">
                                                          <div>
                                                              {detail.product_name || detail.product?.name || `Produk #${detail.product_id}`}
                                                          </div>
                                                      </TableCell>
                                                      <TableCell className="text-right text-xs">
                                                          {formatRupiah(detail.price)}
                                                      </TableCell>
                                                      <TableCell className="text-center">
                                                          <div className="flex flex-col items-center gap-1">
                                                              <div className="flex items-center justify-center gap-1.5">
                                                                  <Input
                                                                      type="number"
                                                                      min="0"
                                                                      max={maxQty}
                                                                      value={qty}
                                                                      disabled={isDisabled}
                                                                      onChange={(e) =>
                                                                          handleQtyChange(
                                                                              detail.product_id,
                                                                              parseInt(e.target.value) || 0,
                                                                              maxQty,
                                                                          )
                                                                      }
                                                                      className="h-8 w-14 text-center text-xs font-medium"
                                                                  />
                                                                  <Button
                                                                      type="button"
                                                                      variant={isMaxSelected ? "secondary" : "outline"}
                                                                      size="sm"
                                                                      disabled={isDisabled}
                                                                      onClick={() => handleSelectAllProduct(detail.product_id, maxQty)}
                                                                      className="h-7 px-2 text-xs font-medium whitespace-nowrap"
                                                                  >
                                                                      {isMaxSelected ? 'Batal' : 'Semua'}
                                                                  </Button>
                                                              </div>
                                                              <div className="text-[10px] text-muted-foreground whitespace-nowrap">
                                                                  Beli: {detail.quantity} | Diretur: {returnedQty} | Sisa: {maxQty}
                                                              </div>
                                                          </div>
                                                      </TableCell>
                                                      <TableCell className="text-right font-medium text-xs">
                                                          {formatRupiah(subtotal)}
                                                      </TableCell>
                                                  </TableRow>
                                              );
                                          })
                                      ) : (
  ```

- [ ] **Step 4: Commit changes**

  ```bash
  git add resources/js/Components/ReturnModal.tsx
  git commit -m "feat: implement frontend validation and detailed quantity display in ReturnModal"
  ```
