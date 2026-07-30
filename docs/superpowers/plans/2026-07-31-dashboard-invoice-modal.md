# Dashboard Invoice Modal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow users to click on any invoice number in the dashboard transactions list to open a transaction detail modal.

**Architecture:** Update `resources/js/pages/dashboard.tsx` to handle invoice click events, load transaction details using `axiosInstance` from the existing backend API, and show them in a `DetailDialog` modal.

**Tech Stack:** React, Axios, Inertia.js, TailwindCSS.

## Global Constraints
- Do not modify backend routes or controllers.
- Use existing `axiosInstance` and UI components.
- Ensure the layout remains clean and follows styling patterns.

---

### Task 1: Update dashboard.tsx with Invoice Click Handler and Detail Modal
**Files:**
- Modify: `resources/js/pages/dashboard.tsx`

- [ ] **Step 1: Add necessary imports at the top of dashboard.tsx**
  Add the following imports under the React imports:
  ```typescript
  import { DetailDialog } from '@/pages/transaction/dialog-modal/detail-dialog';
  import axiosInstance from '@/lib/axios';
  import { handleApiError } from '@/lib/utils';
  ```

- [ ] **Step 2: Add states to the Dashboard component**
  Near other states (e.g., around line 124), add:
  ```typescript
  const [selectedTransaction, setSelectedTransaction] = React.useState<any>(null);
  const [detailOpen, setDetailOpen] = React.useState(false);
  ```

- [ ] **Step 3: Define handleInvoiceClick handler**
  Add the handler function inside the Dashboard component:
  ```typescript
  const handleInvoiceClick = async (invoiceNumber: string) => {
      try {
          const res = await axiosInstance.get(`/api/transactions/invoice/${invoiceNumber}`);
          if (res.data.success) {
              setSelectedTransaction(res.data.data);
              setDetailOpen(true);
          }
      } catch (error) {
          handleApiError(error);
      }
  };
  ```

- [ ] **Step 4: Update TableCell for invoice number to trigger click**
  Find the TableCell rendering `tx.invoice_number` and change it:
  ```typescript
  <TableCell 
      className="font-semibold text-xs text-primary cursor-pointer hover:underline"
      onClick={() => handleInvoiceClick(tx.invoice_number)}
  >
      {tx.invoice_number}
  </TableCell>
  ```

- [ ] **Step 5: Render DetailDialog at the bottom of the Dashboard component**
  Add the modal container right before the closing `div` or fragments of the page:
  ```typescript
  {selectedTransaction && (
      <DetailDialog
          isOpen={detailOpen}
          transaction={selectedTransaction}
          onOpenChange={setDetailOpen}
      />
  )}
  ```

- [ ] **Step 6: Build assets to verify build success**
  Run: `npm run build`

- [ ] **Step 7: Commit changes**
  Commit: `git commit -am "feat: allow clicking invoice number on dashboard to open transaction detail modal"`
