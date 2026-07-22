# Retro Receipt Layout (Indomaret Style) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mengubah tata letak struk belanja modal kasir menjadi format retro monospace (Indomaret style) dengan pembatas karakter, 4 kolom sejajar, baris diskon khusus di bawah barang, dan ringkasan penghematan di bawah.

**Architecture:** Memodifikasi data binding dan struktur rendering di `ReceiptModal` untuk menggunakan helper format nominal kustom, pemisah bertipe teks, struktur tabel berbasis flexbox dengan lebar kolom tetap, dan kalkulasi total penghematan.

**Tech Stack:** React 19, Tailwind CSS v4, TypeScript

## Global Constraints
- Seluruh nominal harga di dalam kartu struk belanja (`#printable-receipt`) tidak boleh menampilkan awalan `Rp`.
- Baris diskon hanya boleh muncul jika barang memiliki potongan harga, dengan format sejajar kolom kanan: `DISKON : (nilai_diskon)`.
- Menggunakan pembatas karakter `================================` dan `--------------------------------`.

---

### Task 1: Modifikasi Komponen ReceiptModal

**Files:**
- Modify: `resources/js/pages/cashier/components/receipt-modal.tsx:40-225`

**Interfaces:**
- Consumes: `Transaction` details list.
- Produces: Updated retro receipt rendering layout.

- [ ] **Step 1: Edit `receipt-modal.tsx`**

Buka file [receipt-modal.tsx](file:///home/raygbrn/project/laravel/super-pos/resources/js/pages/cashier/components/receipt-modal.tsx#L40-L225) dan ganti keseluruhan blok rendering struk belanja.

Ubah kode target berikut:
```tsx
    const details = transaction.details ?? [];
    const itemsSubtotal = details.reduce(
        (acc, detail) => acc + (Number(detail.subtotal) || 0),
        0,
    );
    const discountAmount = Number(transaction.discount_amount ?? 0);

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-sm sm:max-w-md">
                <DialogHeader className="print:hidden">
                    <div className="flex flex-col items-center gap-3 pt-2">
                        <div className="rounded-full bg-emerald-100 p-3 dark:bg-emerald-900/30">
                            <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <DialogTitle className="text-center text-lg font-extrabold">
                            {t(
                                'page.kasir.checkout_success',
                                'Transaksi Berhasil!',
                            )}
                        </DialogTitle>
                    </div>
                </DialogHeader>

                {/* Printable Receipt Card */}
                <div
                    id="printable-receipt"
                    className="space-y-3 rounded-xl border border-dashed bg-card p-4 font-mono text-sm shadow-xs sm:p-5"
                >
                    {/* Store header */}
                    <div className="space-y-1 border-b border-dashed pb-3 text-center">
                        <p className="text-base font-black tracking-wide uppercase">
                            Super POS
                        </p>
                        <p className="text-xs font-semibold text-muted-foreground">
                            {createdAt}
                        </p>
                        <Badge
                            variant="outline"
                            className="mt-1 px-2 font-mono text-[10px] font-bold"
                        >
                            {transaction.invoice_number}
                        </Badge>
                    </div>

                    {/* Items List */}
                    <div className="scrollbar-thin max-h-[30vh] space-y-2 overflow-y-auto py-1 pr-1.5 print:max-h-none print:overflow-visible print:pr-0">
                        {details.map((detail, index) => {
                            const disc = Number(detail.discount) || 0;
                            const unitPrice = Number(detail.price) || 0;
                            const netUnitPrice = Math.max(0, unitPrice - disc);
                            const subtotalVal =
                                Number(detail.subtotal) ||
                                netUnitPrice * detail.quantity;

                            return (
                                <div
                                    key={detail.id || index}
                                    className="space-y-0.5 border-b border-border/40 pb-1.5 last:border-b-0 last:pb-0"
                                >
                                    <div className="flex justify-between gap-2 text-xs font-bold sm:text-sm">
                                        <span className="flex-1 truncate">
                                            {detail.product_name ||
                                                `Barang #${detail.product_id}`}
                                        </span>
                                        <span className="shrink-0 text-right">
                                            {formatRupiah(subtotalVal)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-[11px] text-muted-foreground">
                                        <span>
                                            {detail.quantity} x{' '}
                                            {disc > 0 ? (
                                                <>
                                                    <span className="mr-1 font-normal text-muted-foreground/70 line-through">
                                                        {formatRupiah(
                                                            unitPrice,
                                                        )}
                                                    </span>
                                                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                                        {formatRupiah(
                                                            netUnitPrice,
                                                        )}
                                                    </span>
                                                </>
                                            ) : (
                                                <span>
                                                    {formatRupiah(unitPrice)}
                                                </span>
                                            )}
                                            {detail.unit_name
                                                ? ` (${detail.unit_name})`
                                                : ''}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Totals Summary */}
                    <div className="space-y-1.5 border-t border-dashed pt-3 text-xs sm:text-sm">
                        <div className="flex justify-between font-semibold text-muted-foreground">
                            <span>
                                {t(
                                    'page.kasir.items_subtotal',
                                    'Subtotal Barang',
                                )}
                            </span>
                            <span className="font-bold text-foreground">
                                {formatRupiah(itemsSubtotal)}
                            </span>
                        </div>

                        {discountAmount > 0 && (
                            <div className="flex justify-between font-bold text-emerald-600 dark:text-emerald-400">
                                <span>
                                    {t(
                                        'page.kasir.total_discount_label',
                                        'Potongan / Diskon',
                                    )}
                                </span>
                                <span>- {formatRupiah(discountAmount)}</span>
                            </div>
                        )}

                        <div className="flex justify-between border-t pt-1 text-sm font-black text-foreground sm:text-base">
                            <span>
                                {t(
                                    'page.kasir.grand_total_label',
                                    'Grand Total',
                                )}
                            </span>
                            <span className="text-emerald-600 dark:text-emerald-400">
                                {formatRupiah(Number(transaction.total_amount))}
                            </span>
                        </div>

                        <div className="flex justify-between pt-0.5 font-semibold text-muted-foreground">
                            <span>
                                {t(
                                    'page.kasir.payment_amount_label',
                                    'Nominal Diterima',
                                )}
                            </span>
                            <span className="font-bold text-foreground">
                                {formatRupiah(
                                    Number(transaction.payment_amount),
                                )}
                            </span>
                        </div>

                        <div className="flex justify-between font-bold text-primary">
                            <span>
                                {t('page.kasir.change_label', 'Kembalian:')}
                            </span>
                            <span className="font-black">
                                {formatRupiah(
                                    Number(transaction.change_amount),
                                )}
                            </span>
                        </div>

                        {transaction.payment_method_name && (
                            <div className="flex justify-between border-t border-border/50 pt-1 text-xs text-muted-foreground">
                                <span>
                                    {t(
                                        'page.kasir.payment_method_label',
                                        'Metode Pembayaran',
                                    )}
                                </span>
                                <span className="font-bold text-foreground">
                                    {transaction.payment_method_name}
                                </span>
                            </div>
                        )}
                    </div>

                    <p className="border-t border-dashed pt-3 text-center text-[11px] font-semibold text-muted-foreground">
                        {t(
                            'page.kasir.receipt_thank_you',
                            'Terima kasih atas kunjungan Anda!',
                        )}
                    </p>
```

Menjadi:
```tsx
    const details = transaction.details ?? [];
    const itemsSubtotal = details.reduce(
        (acc, detail) => acc + (Number(detail.subtotal) || 0),
        0,
    );
    const discountAmount = Number(transaction.discount_amount ?? 0);
    const totalItemDiscount = details.reduce(
        (acc, detail) => acc + (Number(detail.discount) || 0) * detail.quantity,
        0,
    );
    const totalSavings = totalItemDiscount + discountAmount;

    // Helper to format currency without Rp prefix and trim spaces
    const formatPrice = (val: number) => {
        return formatRupiah(val).replace('Rp', '').trim();
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-sm sm:max-w-md">
                <DialogHeader className="print:hidden">
                    <div className="flex flex-col items-center gap-3 pt-2">
                        <div className="rounded-full bg-emerald-100 p-3 dark:bg-emerald-900/30">
                            <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <DialogTitle className="text-center text-lg font-extrabold">
                            {t(
                                'page.kasir.checkout_success',
                                'Transaksi Berhasil!',
                            )}
                        </DialogTitle>
                    </div>
                </DialogHeader>

                {/* Printable Receipt Card */}
                <div
                    id="printable-receipt"
                    className="space-y-2 rounded-xl border border-dashed bg-card p-4 font-mono text-[11px] shadow-xs sm:p-5 sm:text-xs"
                >
                    {/* Store header */}
                    <div className="space-y-0.5 text-center leading-tight">
                        <p className="text-sm font-black tracking-wide uppercase text-foreground">
                            Toko Maju Jaya
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                            Jl. Raya Bekasi KM.18 RT.004/0009,
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                            Jakarta Timur, 13250
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                            Telp: 081234567890
                        </p>
                    </div>

                    <div className="text-center text-muted-foreground/60 select-none leading-none">
                        ================================
                    </div>

                    {/* Transaction Details */}
                    <div className="space-y-0.5 leading-tight text-muted-foreground">
                        <div className="flex justify-between">
                            <span>Kode Transaksi:</span>
                            <span className="font-bold text-foreground">
                                {transaction.invoice_number}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span>Pembayaran:</span>
                            <span className="font-bold text-foreground">
                                {transaction.payment_method_name || 'Cash'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span>Tanggal:</span>
                            <span className="font-bold text-foreground">
                                {createdAt}
                            </span>
                        </div>
                    </div>

                    <div className="text-center text-muted-foreground/60 select-none leading-none">
                        ================================
                    </div>

                    {/* Table Column Headers */}
                    <div className="flex justify-between font-bold text-muted-foreground">
                        <span className="flex-1 text-left">Nama Barang</span>
                        <span className="w-8 text-right">Qty</span>
                        <span className="w-16 text-right">Harga</span>
                        <span className="w-20 text-right">Total</span>
                    </div>

                    <div className="text-center text-muted-foreground/60 select-none leading-none">
                        --------------------------------
                    </div>

                    {/* Items List */}
                    <div className="scrollbar-thin max-h-[30vh] space-y-2 overflow-y-auto py-0.5 pr-1.5 print:max-h-none print:overflow-visible print:pr-0">
                        {details.map((detail, index) => {
                            const disc = Number(detail.discount) || 0;
                            const unitPrice = Number(detail.price) || 0;
                            const originalSubtotal = unitPrice * detail.quantity;

                            return (
                                <div key={detail.id || index} className="space-y-0.5">
                                    <div className="flex justify-between gap-1 leading-tight">
                                        <span className="flex-1 truncate text-foreground font-bold">
                                            {detail.product_name ||
                                                `Barang #${detail.product_id}`}
                                        </span>
                                        <span className="w-8 text-right text-foreground">
                                            {detail.quantity}
                                        </span>
                                        <span className="w-16 text-right text-foreground">
                                            {formatPrice(unitPrice)}
                                        </span>
                                        <span className="w-20 text-right text-foreground font-bold">
                                            {formatPrice(originalSubtotal)}
                                        </span>
                                    </div>
                                    {disc > 0 && (
                                        <div className="flex justify-between text-[10px] text-emerald-600 font-bold leading-tight dark:text-emerald-400">
                                            <span className="flex-1"></span>
                                            <span className="w-16 text-right">DISKON :</span>
                                            <span className="w-20 text-right">
                                                ({formatPrice(disc * detail.quantity)})
                                            </span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="text-center text-muted-foreground/60 select-none leading-none">
                        --------------------------------
                    </div>

                    {/* Totals Summary */}
                    <div className="space-y-1 text-xs leading-tight">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground font-bold">TOTAL :</span>
                            <span className="font-bold text-foreground">
                                {formatPrice(Number(transaction.total_amount))}
                            </span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-muted-foreground font-bold">TUNAI :</span>
                            <span className="font-bold text-foreground">
                                {formatPrice(Number(transaction.payment_amount))}
                            </span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-muted-foreground font-bold">KEMBALI :</span>
                            <span className="font-extrabold text-foreground">
                                {formatPrice(Number(transaction.change_amount))}
                            </span>
                        </div>

                        {totalSavings > 0 && (
                            <div className="flex justify-between text-emerald-600 font-bold dark:text-emerald-400">
                                <span>ANDA HEMAT :</span>
                                <span>{formatPrice(totalSavings)}</span>
                            </div>
                        )}
                    </div>

                    <div className="text-center text-muted-foreground/60 select-none leading-none">
                        ================================
                    </div>

                    <p className="text-center text-[10px] font-bold text-muted-foreground tracking-wide uppercase">
                        {t(
                            'page.kasir.receipt_thank_you',
                            'TERIMA KASIH. SELAMAT BELANJA KEMBALI',
                        )}
                    </p>
```

- [ ] **Step 2: Jalankan formatting**

Jalankan perintah berikut untuk merapikan kode:
```bash
npm run format
```
Expected: Perintah berjalan sukses dan merapikan file `receipt-modal.tsx`.

- [ ] **Step 3: Jalankan lint check**

Jalankan ESLint pada file React yang diubah untuk memastikan tidak ada pelanggaran aturan penulisan kode:
```bash
npx eslint resources/js/pages/cashier/components/receipt-modal.tsx --fix
```
Expected: Hasil pengujian eslint tidak memiliki error (exit code 0).

- [ ] **Step 4: Jalankan typecheck**

Jalankan pemeriksaan tipe data proyek untuk menjamin fungsionalitas kompilasi TypeScript:
```bash
npm run types:check
```
Expected: Tidak ada error kompilasi TypeScript baru (exit code 0).
