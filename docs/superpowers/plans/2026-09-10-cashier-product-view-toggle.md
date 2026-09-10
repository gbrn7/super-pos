# Cashier Product View Mode Toggle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menambahkan tombol toggle mode tampilan daftar produk di modul kasir (`/kasir`) antara mode Tabel (tanpa gambar) dan mode Grid (dengan gambar via `ProductCard`), serta menyimpan preferensi pengguna di `localStorage`.

**Architecture:** Menggunakan state lokal React `viewMode` ('table' | 'grid') di `CashierIndex` yang disinkronkan dengan `localStorage`. Mengintegrasikan tombol segmented switch pada panel header kiri dan merender tampilan secara kondisional antara `ProductRow` (tabel) dan `ProductCard` (grid).

**Tech Stack:** React 19, Inertia.js v3, Tailwind CSS v4, Lucide React icons, TypeScript.

## Global Constraints
- Mengikuti konvensi styling Tailwind CSS v4 dan komponen UI yang sudah ada.
- Tidak mengubah API backend atau struktur database.
- Menjaga fungsionalitas pencarian, filter kategori, penambahan ke keranjang, dan paginasi di kedua mode tampilan.

---

### Task 1: Add View Mode State and Segmented Toggle UI

**Files:**
- Modify: `resources/js/pages/cashier/index.tsx`

**Interfaces:**
- Consumes: `localStorage`, icons `List`, `LayoutGrid` from `lucide-react`.
- Produces: `viewMode: 'table' | 'grid'`, `setViewMode: (mode: 'table' | 'grid') => void`.

- [ ] **Step 1: Check existing imports and import missing icons/components**
Import `List`, `LayoutGrid` from `lucide-react` (if not already imported) and ensure `ProductCard` is imported from `./components/product-card`.

- [ ] **Step 2: Add viewMode state with localStorage initialization**
Add state:
```tsx
const [viewMode, setViewMode] = useState<'table' | 'grid'>(() => {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('cashier_view_mode');
        if (saved === 'grid' || saved === 'table') {
            return saved;
        }
    }
    return 'table';
});

const handleViewModeChange = (mode: 'table' | 'grid') => {
    setViewMode(mode);
    if (typeof window !== 'undefined') {
        localStorage.setItem('cashier_view_mode', mode);
    }
};
```

- [ ] **Step 3: Add Segmented Toggle Buttons to Header**
Di sebelah badge `totalProducts` di header panel kiri (`resources/js/pages/cashier/index.tsx`), tambahkan:
```tsx
<div className="flex items-center rounded-lg border bg-muted/60 p-0.5">
    <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => handleViewModeChange('table')}
        className={cn(
            'h-7 px-2.5 text-xs font-bold transition-all',
            viewMode === 'table'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground',
        )}
        title={t('page.kasir.view_mode_table', 'Mode Tabel (Tanpa Gambar)')}
    >
        <List className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">{t('page.kasir.view_table', 'Tabel')}</span>
    </Button>
    <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => handleViewModeChange('grid')}
        className={cn(
            'h-7 px-2.5 text-xs font-bold transition-all',
            viewMode === 'grid'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground',
        )}
        title={t('page.kasir.view_mode_grid', 'Mode Grid (Dengan Gambar)')}
    >
        <LayoutGrid className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">{t('page.kasir.view_grid', 'Gambar')}</span>
    </Button>
</div>
```

- [ ] **Step 4: Verify toggle state behavior in component**
Test rendering toggle buttons without syntax error.

- [ ] **Step 5: Commit**
```bash
git add resources/js/pages/cashier/index.tsx
git commit -m "feat(cashier): add product view mode state and toggle buttons in header"
```

---

### Task 2: Implement Grid View Rendering with ProductCard and Skeleton Loading

**Files:**
- Modify: `resources/js/pages/cashier/index.tsx`

**Interfaces:**
- Consumes: `ProductCard` from `./components/product-card`, `products`, `loadingProducts`, `addToCart`, `cart`.
- Produces: Conditional rendering between Table view and Grid view based on `viewMode`.

- [ ] **Step 1: Update skeleton loading for Grid mode**
When `loadingProducts` is true:
```tsx
{loadingProducts ? (
    viewMode === 'table' ? (
        <div className="space-y-3 p-4">
            {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-10 w-28" />
                    <Skeleton className="h-10 flex-1" />
                    <Skeleton className="h-10 w-20" />
                    <Skeleton className="h-10 w-24" />
                </div>
            ))}
        </div>
    ) : (
        <div className="grid grid-cols-2 gap-3 p-3.5 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="flex flex-col overflow-hidden rounded-xl border bg-card p-2.5 space-y-2">
                    <Skeleton className="aspect-square w-full rounded-lg" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-4 w-1/3" />
                </div>
            ))}
        </div>
    )
) : products.length === 0 ? (
    ...
```

- [ ] **Step 2: Render ProductCard Grid when viewMode === 'grid'**
When `products.length > 0`:
```tsx
viewMode === 'table' ? (
    <table className="w-full border-collapse text-left">
        ...
    </table>
) : (
    <div className="grid grid-cols-2 gap-3 p-3.5 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {products.map((product) => (
            <ProductCard
                key={product.id}
                product={product}
                onAdd={addToCart}
                isInCart={cart.some((i) => i.product.id === product.id)}
            />
        ))}
    </div>
)
```

- [ ] **Step 3: Verify build and types**
Run `npm run build` to ensure TypeScript types and Tailwind CSS compile cleanly.

- [ ] **Step 4: Commit**
```bash
git add resources/js/pages/cashier/index.tsx
git commit -m "feat(cashier): implement grid view with ProductCard and skeleton loader"
```

---

### Task 3: Quality Assurance, Verification & Tests

**Files:**
- Verify: `resources/js/pages/cashier/index.tsx`
- Run: Pint formatter and Pest tests

- [ ] **Step 1: Run Pint code formatter**
```bash
vendor/bin/pint --dirty --format agent
```

- [ ] **Step 2: Run Pest tests**
```bash
php artisan test --compact --filter=Cashier
```

- [ ] **Step 3: Run npm build to verify bundle**
```bash
npm run build
```

- [ ] **Step 4: Final commit if any tweaks made**
```bash
git add -A
git commit -m "chore(cashier): verify and format cashier view toggle"
```
