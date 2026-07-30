# Product Return Modal Button Label Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Change the button label from "Pilih Semua Transaksi" to "Pilih Semua Produk" in the return modal.

**Architecture:** Update the label string in the React render return of ReturnModal.

**Tech Stack:** React 19.

---

### Task 1: Update Button Label

**Files:**
- Modify: `resources/js/Components/ReturnModal.tsx`

- [ ] **Step 1: Replace text in ReturnModal**

  Modify [ReturnModal.tsx](file:///home/raygbrn/project/laravel/super-pos/resources/js/Components/ReturnModal.tsx):

  ```tsx
                                      {isAllTransactionSelected
                                          ? 'Batal Pilih Semua'
                                          : 'Pilih Semua Produk'}
  ```

- [ ] **Step 2: Run npm run build to verify compile**

  Run: `npm run build`
  Expected: Success without TS errors

- [ ] **Step 3: Commit Task 1**

  ```bash
  git add resources/js/Components/ReturnModal.tsx
  git commit -m "style: rename select all button label in return modal"
  ```
