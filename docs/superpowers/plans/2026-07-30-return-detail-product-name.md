# Product Return Detail Product Name Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Correct the display of product names in the Product Return Detail Dialog where they currently fall back to the default word "Produk".

**Architecture:** Update the TypeScript interface in columns definition and read the correct `product_name` field directly from the API response in the DetailDialog component.

**Tech Stack:** React 19, TypeScript.

## Global Constraints

- Keep types and interfaces consistent with API responses.
- No modifications to the API endpoints are required.

---

### Task 1: Update TypeScript Types & DetailDialog UI

**Files:**
- Modify: `resources/js/pages/returns/columns.tsx`
- Modify: `resources/js/pages/returns/dialog-modal/detail-dialog.tsx`

**Interfaces:**
- Consumes: `product_name` from `ProductReturnResource`.
- Produces: Correctly rendered product names in the detail table.

- [ ] **Step 1: Add `product_name` to ReturnDetail interface**

  Modify [columns.tsx](file:///home/raygbrn/project/laravel/super-pos/resources/js/pages/returns/columns.tsx):

  ```typescript
  export interface ReturnDetail {
      id: number;
      product?: { name: string };
      product_name?: string;
      quantity: number;
      price_per_unit: number;
      subtotal: number;
  }
  ```

- [ ] **Step 2: Update product name rendering in DetailDialog**

  Modify [detail-dialog.tsx](file:///home/raygbrn/project/laravel/super-pos/resources/js/pages/returns/dialog-modal/detail-dialog.tsx):

  ```typescript
                                                  <TableCell className="font-medium">
                                                      {detail.product_name || detail.product?.name || 'Produk'}
                                                  </TableCell>
  ```

- [ ] **Step 3: Run npm run build to verify no compilation errors**

  Run: `npm run build`
  Expected: Success without TS errors

- [ ] **Step 4: Commit changes**

  ```bash
  git add resources/js/pages/returns/columns.tsx resources/js/pages/returns/dialog-modal/detail-dialog.tsx
  git commit -m "fix: render correct product name in return detail dialog"
  ```
