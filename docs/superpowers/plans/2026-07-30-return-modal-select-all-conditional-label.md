# Product Return Modal Select All Conditional Label Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Modify the ReturnModal select all button text to toggle between "Pilih Semua Produk" and "Batal Pilih Semua", but fall back to "Pilih Semua Produk" when disabled because all items are returned.

**Architecture:** Use a conditional expression for the button text rendering.

**Tech Stack:** React 19.

---

### Task 1: Update Button Text Logic

**Files:**
- Modify: `resources/js/Components/ReturnModal.tsx`

- [ ] **Step 1: Update button label rendering conditional expression**

  Modify [ReturnModal.tsx](file:///home/raygbrn/project/laravel/super-pos/resources/js/Components/ReturnModal.tsx) around line 160-170:

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
                                      {isAllReturned 
                                          ? 'Pilih Semua Produk' 
                                          : (isAllTransactionSelected ? 'Batal Pilih Semua' : 'Pilih Semua Produk')}
                                  </Button>
                              )}
  ```

- [ ] **Step 2: Run npm run build to verify compile**

  Run: `npm run build`
  Expected: Success without TS errors

- [ ] **Step 3: Commit Task 1**

  ```bash
  git add resources/js/Components/ReturnModal.tsx
  git commit -m "style: toggle select all button label conditionally based on state"
  ```
