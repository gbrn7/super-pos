# Product Return Clickable Relations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow users to click on return numbers to view return details, and invoice numbers to view transaction details on the product returns page.

**Architecture:** Expose callbacks in returns columns, convert text columns to interactive buttons, and integrate transaction detail dialog on the returns index page.

**Tech Stack:** React 19, TypeScript, Lucide Icons.

## Global Constraints

- Avoid breaking existing column types.
- Ensure components compile without TypeScript warnings.

---

### Task 1: Update Columns with Click Handlers

**Files:**
- Modify: `resources/js/pages/returns/columns.tsx`

**Interfaces:**
- Consumes: `onInvoiceClick` from props.
- Produces: Interactive return_number and invoice_number buttons.

- [ ] **Step 1: Update column definitions to accept and invoke callbacks**

  Modify [columns.tsx](file:///home/raygbrn/project/laravel/super-pos/resources/js/pages/returns/columns.tsx):

  ```typescript
  export const columns = ({
      onDetailClick,
      onInvoiceClick,
  }: {
      onDetailClick: (item: ReturnItem) => void;
      onInvoiceClick: (transactionId: number) => void;
  }): ColumnDef<ReturnItem>[] => [
      {
          accessorKey: 'return_number',
          header: i18next.t('page.return.data_table.columns.return_number', 'No. Retur'),
          cell: ({ row }) => (
              <button
                  type="button"
                  onClick={() => onDetailClick(row.original)}
                  className="font-semibold text-primary hover:underline font-mono text-left bg-transparent border-0 p-0 cursor-pointer"
              >
                  {row.original.return_number}
              </button>
          ),
      },
      {
          accessorKey: 'transaction.invoice_number',
          header: i18next.t('page.return.data_table.columns.invoice_number', 'No. Invoice Struk'),
          cell: ({ row }) => {
              const invoiceNumber = row.original.transaction?.invoice_number;
              const transactionId = row.original.transaction_id;
              return invoiceNumber ? (
                  <button
                      type="button"
                      onClick={() => onInvoiceClick(transactionId)}
                      className="font-mono text-xs text-primary hover:underline text-left bg-transparent border-0 p-0 cursor-pointer"
                  >
                      {invoiceNumber}
                  </button>
              ) : (
                  <span className="font-mono text-xs text-muted-foreground">-</span>
              );
          },
      },
  ```

- [ ] **Step 2: Commit Task 1**

  ```bash
  git add resources/js/pages/returns/columns.tsx
  git commit -m "feat: make No. Retur and No. Invoice clickable in returns table columns"
  ```

---

### Task 2: Integrate Transaction DetailDialog in Returns Page

**Files:**
- Modify: `resources/js/pages/returns/index.tsx`

**Interfaces:**
- Consumes: `DetailDialog` from `../transaction/dialog-modal/detail-dialog`.
- Produces: Integrated state and rendering of the transaction detail dialog.

- [ ] **Step 1: Import Transaction DetailDialog**

  Modify [index.tsx](file:///home/raygbrn/project/laravel/super-pos/resources/js/pages/returns/index.tsx) to import `DetailDialog` from `../transaction/dialog-modal/detail-dialog`:

  ```typescript
  import { columns, type ReturnItem } from './columns';
  import { DetailDialog } from './dialog-modal/detail-dialog';
  import { DetailDialog as TransactionDetailDialog } from '../transaction/dialog-modal/detail-dialog';
  ```

- [ ] **Step 2: Add state and handlers for Transaction Detail Dialog**

  Add state to [index.tsx](file:///home/raygbrn/project/laravel/super-pos/resources/js/pages/returns/index.tsx):

  ```typescript
      const [selectedReturn, setSelectedReturn] = useState<ReturnItem | null>(null);
      const [detailOpen, setDetailOpen] = useState(false);
      const [txDetailOpen, setTxDetailOpen] = useState(false);
      const [selectedTxId, setSelectedTxId] = useState<number | null>(null);
  ```

  And add handlers:

  ```typescript
      const handleInvoiceClick = (transactionId: number) => {
          setSelectedTxId(transactionId);
          setTxDetailOpen(true);
      };
  ```

- [ ] **Step 3: Update `tableColumns` and Render `TransactionDetailDialog`**

  Modify [index.tsx](file:///home/raygbrn/project/laravel/super-pos/resources/js/pages/returns/index.tsx):

  ```typescript
      const tableColumns = columns({ 
          onDetailClick: handleDetailClick,
          onInvoiceClick: handleInvoiceClick
      });
  ```

  And render the component at the bottom of the page:

  ```tsx
                      {/* Detail Modal */}
                      <DetailDialog
                          isOpen={detailOpen}
                          returnItem={selectedReturn}
                          onOpenChange={setDetailOpen}
                      />

                      <TransactionDetailDialog
                          isOpen={txDetailOpen}
                          transaction={selectedTxId ? { id: selectedTxId } as any : null}
                          onOpenChange={setTxDetailOpen}
                      />
                  </div>
              </div>
          </>
  ```

- [ ] **Step 4: Run npm run build to verify no errors**

  Run: `npm run build`
  Expected: Success without TS errors

- [ ] **Step 5: Commit Task 2**

  ```bash
  git add resources/js/pages/returns/index.tsx
  git commit -m "feat: integrate TransactionDetailDialog on returns index page"
  ```
