# Product Return Modal Select All Behavior Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Disable the select all button when all items in a transaction are fully returned, and lock the button label to "Pilih Semua Produk".

**Architecture:** Add state logic for detecting all items returned and bind it to the React button disabled state.

**Tech Stack:** React 19.

---

### Task 1: Add Disabled Check and Clean Button Label

**Files:**
- Modify: `resources/js/Components/ReturnModal.tsx`

- [ ] **Step 1: Declare isAllReturned and modify the select all button**

  Modify [ReturnModal.tsx](file:///home/raygbrn/project/laravel/super-pos/resources/js/Components/ReturnModal.tsx):

  ```typescript
      const isAllTransactionSelected = details.length > 0 && details.every((detail) => {
          const maxQty = detail.quantity - (detail.returned_quantity || 0);
          if (maxQty <= 0) return true;
          return (quantities[detail.product_id] || 0) === maxQty;
      });

      const isAllReturned = details.length > 0 && details.every((detail) => {
          const maxQty = detail.quantity - (detail.returned_quantity || 0);
          return maxQty <= 0;
      });
  ```

  And change the button render section (around line 160-170):

  ```tsx
                              {details.length > 0 && !loading && (
                                  <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={handleSelectAllTransaction}
                                      disabled={isAllReturned}
                                      className="h-8 text-xs font-semibold"
                                  >
                                      Pilih Semua Produk
                                  </Button>
                              )}
  ```

- [ ] **Step 2: Run npm run build to verify compile**

  Run: `npm run build`
  Expected: Success without TS errors

- [ ] **Step 3: Commit Task 1**

  ```bash
  git add resources/js/Components/ReturnModal.tsx
  git commit -m "style: disable select all button when all items returned and fix label"
  ```
