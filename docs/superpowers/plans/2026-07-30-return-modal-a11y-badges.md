# Product Return Modal Accessibility Badges Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Modify the return modal layout in the POS system to make transaction quantities and limits much easier to read for elderly users.

**Architecture:** Relocate the tiny summary string into color-coded high-contrast badges under the product name, and increase the input quantity font size.

**Tech Stack:** React 19, TailwindCSS, TypeScript.

## Global Constraints

- Retain functional behavior of quantity validation.
- Do not introduce horizontal layout shifts.

---

### Task 1: Update ReturnModal UI Layout

**Files:**
- Modify: `resources/js/Components/ReturnModal.tsx`

**Interfaces:**
- Consumes: `details` array inside ReturnModal.
- Produces: Updated table layout with high-contrast accessibility badges and larger input fonts.

- [ ] **Step 1: Replace table cell contents in ReturnModal**

  Modify [ReturnModal.tsx](file:///home/raygbrn/project/laravel/super-pos/resources/js/Components/ReturnModal.tsx) around line 194 to restructure table row rendering:

  ```tsx
                                              return (
                                                  <TableRow 
                                                      key={detail.id}
                                                      className={isDisabled ? "opacity-50 bg-muted/20" : ""}
                                                  >
                                                      <TableCell className="font-medium py-3">
                                                          <div className="text-sm font-semibold text-foreground">
                                                              {detail.product_name || detail.product?.name || `Produk #${detail.product_id}`}
                                                          </div>
                                                          <div className="mt-2 flex flex-wrap gap-1.5 font-normal">
                                                              <span className="inline-flex items-center rounded-md bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                                                                  Beli: {detail.quantity}
                                                              </span>
                                                              <span className="inline-flex items-center rounded-md bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                                                                  Diretur: {returnedQty}
                                                              </span>
                                                              <span className="inline-flex items-center rounded-md bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                                                  Sisa: {maxQty}
                                                              </span>
                                                          </div>
                                                      </TableCell>
                                                      <TableCell className="text-right text-xs">
                                                          {formatRupiah(detail.price)}
                                                      </TableCell>
                                                      <TableCell className="text-center">
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
                                                                  className="h-9 w-16 text-center text-sm font-semibold"
                                                              />
                                                              <Button
                                                                  type="button"
                                                                  variant={isMaxSelected ? "secondary" : "outline"}
                                                                  size="sm"
                                                                  disabled={isDisabled}
                                                                  onClick={() => handleSelectAllProduct(detail.product_id, maxQty)}
                                                                  className="h-8 px-2.5 text-xs font-semibold whitespace-nowrap"
                                                              >
                                                                  {isMaxSelected ? 'Batal' : 'Semua'}
                                                              </Button>
                                                          </div>
                                                      </TableCell>
                                                      <TableCell className="text-right font-medium text-xs">
                                                          {formatRupiah(subtotal)}
                                                      </TableCell>
                                                  </TableRow>
                                              );
  ```

- [ ] **Step 2: Run npm run build to verify compile**

  Run: `npm run build`
  Expected: Success without TS errors

- [ ] **Step 3: Commit Task 1**

  ```bash
  git add resources/js/Components/ReturnModal.tsx
  git commit -m "style: enhance return modal quantity badges and input accessibility"
  ```
