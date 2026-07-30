# Product Return Module i18n Translations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement full localization (i18n) translation support for the Return Modal component and seed translation strings into Indonesian and English locales.

**Architecture:** Inject JSON properties under `page.return` in both translation files, then consume these keys in `ReturnModal.tsx`.

**Tech Stack:** React 19, i18next, TypeScript.

---

### Task 1: Seed ID and EN Locales translation.json Files

**Files:**
- Modify: `resources/js/locales/id/translation.json`
- Modify: `resources/js/locales/en/translation.json`

- [ ] **Step 1: Update ID locales file**

  Add the `"return"` namespace to [translation.json (ID)](file:///home/raygbrn/project/laravel/super-pos/resources/js/locales/id/translation.json) right under the `"kasir"` block:

  ```json
          "kasir": {
              ...
              "receipt_phone_label": "Telp"
          },
          "return": {
              "page_name": "Retur Barang",
              "no_data": "Belum ada riwayat retur barang.",
              "invoice_label": "No. Invoice Struk",
              "cashier_label": "Kasir / Petugas",
              "date_label": "Waktu Retur",
              "items_title": "Produk yang Dikembalikan",
              "product_name": "Produk",
              "qty": "Jumlah",
              "price_per_unit": "Harga Satuan",
              "subtotal": "Subtotal",
              "no_items": "Tidak ada rincian produk.",
              "reason_label": "Catatan Alasan Retur:",
              "total_refund_label": "Total Dana Refund",
              "data_table": {
                  "columns": {
                      "return_number": "No. Retur",
                      "invoice_number": "No. Invoice Struk",
                      "user_name": "Kasir / Petugas",
                      "total_refund": "Total Refund",
                      "reason": "Alasan Retur",
                      "created_at": "Tanggal & Waktu",
                      "actions": "Aksi"
                  },
                  "actions": {
                      "view_detail": "Lihat Detail Retur"
                  }
              },
              "dialog_modal": {
                  "detail_title": "Detail Retur Barang"
              },
              "modal": {
                  "title": "Retur Barang",
                  "search_invoice_placeholder": "Cari Nomor Invoice...",
                  "search_btn": "Cari",
                  "transaction_detail": "Detail Transaksi",
                  "product_col": "Produk",
                  "price_col": "Harga Satuan",
                  "qty_col": "Kuantitas Retur",
                  "subtotal_col": "Subtotal Refund",
                  "select_products_label": "Pilih Produk & Kuantitas Retur",
                  "select_all_btn": "Pilih Semua Produk",
                  "deselect_all_btn": "Batal Pilih Semua",
                  "buy_label": "Beli",
                  "returned_label": "Diretur",
                  "remaining_label": "Sisa",
                  "cancel_btn": "Batal",
                  "cancel_all_item_btn": "Batal",
                  "all_item_btn": "Semua",
                  "reason_label": "Alasan Retur",
                  "reason_placeholder": "Masukkan alasan retur...",
                  "total_refund": "Total Refund",
                  "process_btn": "Proses Retur",
                  "success_message": "Retur barang berhasil diproses.",
                  "error_message": "Gagal memproses retur."
              }
          }
  ```

- [ ] **Step 2: Update EN locales file**

  Add the `"return"` namespace to [translation.json (EN)](file:///home/raygbrn/project/laravel/super-pos/resources/js/locales/en/translation.json) right under the `"kasir"` block:

  ```json
          "kasir": {
              ...
              "receipt_phone_label": "Phone"
          },
          "return": {
              "page_name": "Product Returns",
              "no_data": "No return history found.",
              "invoice_label": "Invoice / Receipt No.",
              "cashier_label": "Cashier / Staff",
              "date_label": "Return Time",
              "items_title": "Returned Products",
              "product_name": "Product",
              "qty": "Quantity",
              "price_per_unit": "Unit Price",
              "subtotal": "Subtotal",
              "no_items": "No product details available.",
              "reason_label": "Return Reason Notes:",
              "total_refund_label": "Total Refund Amount",
              "data_table": {
                  "columns": {
                      "return_number": "Return No.",
                      "invoice_number": "Invoice / Receipt No.",
                      "user_name": "Cashier / Staff",
                      "total_refund": "Total Refund",
                      "reason": "Return Reason",
                      "created_at": "Date & Time",
                      "actions": "Actions"
                  },
                  "actions": {
                      "view_detail": "View Return Details"
                  }
              },
              "dialog_modal": {
                  "detail_title": "Product Return Details"
              },
              "modal": {
                  "title": "Return Product",
                  "search_invoice_placeholder": "Search Invoice Number...",
                  "search_btn": "Search",
                  "transaction_detail": "Transaction Details",
                  "product_col": "Product",
                  "price_col": "Unit Price",
                  "qty_col": "Return Qty",
                  "subtotal_col": "Refund Subtotal",
                  "select_products_label": "Select Products & Return Quantity",
                  "select_all_btn": "Select All Products",
                  "deselect_all_btn": "Cancel Select All",
                  "buy_label": "Buy",
                  "returned_label": "Returned",
                  "remaining_label": "Remaining",
                  "cancel_btn": "Cancel",
                  "cancel_all_item_btn": "Cancel",
                  "all_item_btn": "All",
                  "reason_label": "Return Reason",
                  "reason_placeholder": "Enter return reason...",
                  "total_refund": "Total Refund",
                  "process_btn": "Process Return",
                  "success_message": "Product return processed successfully.",
                  "error_message": "Failed to process return."
              }
          }
  ```

- [ ] **Step 3: Commit Task 1**

  ```bash
  git add resources/js/locales/id/translation.json resources/js/locales/en/translation.json
  git commit -m "feat: add return keys into translation.json for EN and ID locales"
  ```

---

### Task 2: Refactor ReturnModal to use useTranslation hook

**Files:**
- Modify: `resources/js/Components/ReturnModal.tsx`

- [ ] **Step 1: Add import, hook, and translate strings**

  Modify [ReturnModal.tsx](file:///home/raygbrn/project/laravel/super-pos/resources/js/Components/ReturnModal.tsx) to use `t()` dynamically for all labels, input placeholders, toast messages, and button names.

- [ ] **Step 2: Run npm run build to verify compile**

  Run: `npm run build`
  Expected: Success without TS errors

- [ ] **Step 3: Commit Task 2**

  ```bash
  git add resources/js/Components/ReturnModal.tsx
  git commit -m "feat: localize ReturnModal using useTranslation hook"
  ```
