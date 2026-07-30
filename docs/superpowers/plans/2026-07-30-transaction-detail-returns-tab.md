# Transaction Detail Returns Tab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Barang Diretur" tab in the transaction detail modal to list products returned from the transaction.

**Architecture:** Expose loaded returns in the transaction API resource and render them inside a new tab in the transaction detail modal.

**Tech Stack:** Laravel, React 19, TypeScript.

## Global Constraints

- Do not perform duplicate queries.
- Format PHP code using Pint.

---

### Task 1: Expose Returns in TransactionResource

**Files:**
- Modify: `app/Http/Resources/TransactionResource.php`

**Interfaces:**
- Consumes: Loaded `returns` relation on `Transaction`.
- Produces: `returns` field in the transaction detail response.

- [ ] **Step 1: Update TransactionResource imports and response array**

  Modify [TransactionResource.php](file:///home/raygbrn/project/laravel/super-pos/app/Http/Resources/TransactionResource.php):

  ```php
  <?php

  namespace App\Http\Resources;

  use Illuminate\Http\Request;
  use Illuminate\Http\Resources\Json\JsonResource;

  class TransactionResource extends JsonResource
  {
      /**
       * Transform the resource into an array.
       *
       * @return array<string, mixed>
       */
      public function toArray(Request $request): array
      {
          return [
              'id' => $this->id,
              'user_id' => $this->user_id,
              'user_name' => $this->whenLoaded('user', fn () => $this->user->name),
              'payment_method_id' => $this->payment_method_id,
              'payment_method_name' => $this->whenLoaded('paymentMethod', fn () => $this->paymentMethod->name),
              'invoice_number' => $this->invoice_number,
              'total_amount' => $this->total_amount,
              'discount_amount' => $this->discount_amount,
              'payment_amount' => $this->payment_amount,
              'change_amount' => $this->change_amount,
              'details' => TransactionDetailResource::collection($this->whenLoaded('transactionDetails', function () {
                  return $this->transactionDetails->each(fn ($detail) => $detail->setRelation('transaction', $this));
              })),
              'returns' => ProductReturnResource::collection($this->whenLoaded('returns')),
              'created_at' => $this->getRawOriginal('created_at'),
              'updated_at' => $this->getRawOriginal('updated_at'),
          ];
      }
  }
  ```

- [ ] **Step 2: Commit Task 1**

  ```bash
  git add app/Http/Resources/TransactionResource.php
  git commit -m "feat: expose returns in TransactionResource"
  ```

---

### Task 2: Implement Returns Tab in Transaction DetailDialog UI

**Files:**
- Modify: `resources/js/pages/transaction/dialog-modal/detail-dialog.tsx`

**Interfaces:**
- Consumes: `returns` list from transaction object.
- Produces: Rendered UI for returned items tab.

- [ ] **Step 1: Add new Tab Trigger and Tab Content in DetailDialog**

  Modify [detail-dialog.tsx](file:///home/raygbrn/project/laravel/super-pos/resources/js/pages/transaction/dialog-modal/detail-dialog.tsx) around line 240 to add the trigger:

  ```tsx
                              <TabsTrigger value="receipt">
                                  {t(
                                      'page.transaction.dialog_modal.detail_dialog.tab_receipt',
                                      'Struk / Nota',
                                  )}
                              </TabsTrigger>
                              <TabsTrigger value="returns">
                                  {t(
                                      'page.transaction.dialog_modal.detail_dialog.tab_returns',
                                      'Barang Diretur',
                                  )}
                              </TabsTrigger>
  ```

  And add the `TabsContent` for returns at the end (before line 755/the closing `</Tabs>` tag):

  ```tsx
                          </TabsContent>
                          <TabsContent
                              value="returns"
                              className="space-y-4 border-none p-0 pt-4 outline-none"
                          >
                              <div className="w-full overflow-x-auto rounded-md border">
                                  <Table>
                                      <TableHeader className="bg-muted/50">
                                          <TableRow>
                                              <TableHead>Produk</TableHead>
                                              <TableHead className="text-center">Jumlah</TableHead>
                                              <TableHead className="text-right">Harga Satuan</TableHead>
                                              <TableHead className="text-right">Total Refund</TableHead>
                                              <TableHead>Alasan</TableHead>
                                              <TableHead className="text-right">Waktu Retur</TableHead>
                                          </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                          {currentTransaction.returns && currentTransaction.returns.length > 0 ? (
                                              currentTransaction.returns.flatMap((ret: any) => 
                                                  (ret.details || []).map((detail: any) => ({
                                                      ...detail,
                                                      return_number: ret.return_number,
                                                      reason: ret.reason,
                                                      created_at: ret.created_at
                                                  }))
                                              ).map((detail: any, idx: number) => (
                                                  <TableRow key={`${detail.id}-${idx}`}>
                                                      <TableCell className="font-medium">
                                                          {detail.product_name || 'Produk'}
                                                      </TableCell>
                                                      <TableCell className="text-center font-semibold">
                                                          {detail.quantity}
                                                      </TableCell>
                                                      <TableCell className="text-right text-xs">
                                                          {formatRupiah(detail.price_per_unit)}
                                                      </TableCell>
                                                      <TableCell className="text-right font-medium text-xs text-rose-600 dark:text-rose-400">
                                                          {formatRupiah(detail.subtotal)}
                                                      </TableCell>
                                                      <TableCell className="text-xs text-muted-foreground max-w-40 truncate" title={detail.reason}>
                                                          {detail.reason || '-'}
                                                      </TableCell>
                                                      <TableCell className="text-right text-[10px] text-muted-foreground whitespace-nowrap">
                                                          {detail.created_at ? new Date(detail.created_at * 1000).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }) : '-'}
                                                      </TableCell>
                                                  </TableRow>
                                              ))
                                          ) : (
                                              <TableRow>
                                                  <TableCell colSpan={6} className="h-16 text-center text-muted-foreground text-xs">
                                                      Belum ada barang yang diretur untuk transaksi ini.
                                                  </TableCell>
                                              </TableRow>
                                          )}
                                      </TableBody>
                                  </Table>
                              </div>
                          </TabsContent>
  ```

- [ ] **Step 2: Run npm run build to verify compile succeeds**

  Run: `npm run build`
  Expected: Success without TS errors

- [ ] **Step 3: Commit Task 2**

  ```bash
  git add resources/js/pages/transaction/dialog-modal/detail-dialog.tsx
  git commit -m "feat: render returns tab with returned items list inside Transaction DetailDialog"
  ```
