# Kalkulator HPP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menambahkan fitur halaman Kalkulator HPP (Harga Pokok Penjualan) interaktif berbasis client-side untuk mensimulasikan HPP produk secara dinamis berdasarkan komponen biaya yang diinput serta target persentase margin keuntungan.

**Architecture:** Implementasi client-side murni menggunakan Inertia.js untuk me-render halaman React (`resources/js/pages/hpp-calculator/index.tsx`). Logika perhitungan dan state dinamis dikelola menggunakan React hooks (`useState`, `useMemo`).

**Tech Stack:** Laravel 12, Inertia.js, React 19, TypeScript, Tailwind CSS v4, Lucide React (icons).

## Global Constraints

- PHP version: 8.4
- Laravel version: 12
- React version: 19
- Tailwind CSS version: v4
- Code formatting style: Laravel Pint (run `vendor/bin/pint --dirty --format agent` after modifications)
- Semua nominal mata uang diformat menggunakan rupiah (Format Indonesia)
- Batas maksimal margin adalah 99%

---

### Task 1: Rute Laravel & Uji Coba Rute

**Files:**
- Modify: `routes/web.php`
- Create Test: `tests/Feature/HppCalculatorTest.php`

**Interfaces:**
- Produces: Rute bernama `hpp-calculator` yang mengarah ke Inertia page `hpp-calculator/index`.

- [ ] **Step 1: Write the failing test**

  Create file `tests/Feature/HppCalculatorTest.php` with the following content:
  ```php
  <?php

  use App\Models\User;

  test('guest cannot access hpp calculator', function () {
      $response = $this->get(route('hpp-calculator'));

      $response->assertRedirect(route('login'));
  });

  test('authenticated user can access hpp calculator', function () {
      $user = User::factory()->create();

      $response = $this->actingAs($user)->get(route('hpp-calculator'));

      $response->assertStatus(200);
  });
  ```

- [ ] **Step 2: Run test to verify it fails**

  Run: `php artisan test tests/Feature/HppCalculatorTest.php --compact`
  Expected: FAIL with route not defined or 404.

- [ ] **Step 3: Write minimal implementation**

  Modify `routes/web.php` by adding the route under the `auth` middleware group (around line 72, near other `Route::inertia` routes):
  ```php
      Route::inertia('hpp-calculator', 'hpp-calculator/index')->name('hpp-calculator');
  ```

- [ ] **Step 4: Run test to verify it passes**

  Run: `php artisan test tests/Feature/HppCalculatorTest.php --compact`
  Expected: PASS

- [ ] **Step 5: Run Pint code formatter**

  Run: `vendor/bin/pint --dirty --format agent`

- [ ] **Step 6: Commit**

  ```bash
  git add routes/web.php tests/Feature/HppCalculatorTest.php
  git commit -m "feat: add route and tests for HPP calculator"
  ```

---

### Task 2: Tambah Menu Sidebar

**Files:**
- Modify: `resources/js/components/app-sidebar.tsx`

**Interfaces:**
- Consumes: Rute `hpp-calculator` yang dibuat pada Task 1.
- Produces: Item menu sidebar berlabel "Kalkulator HPP" di bawah group "Keuangan".

- [ ] **Step 1: Add Calculator icon to imports**

  Modify `resources/js/components/app-sidebar.tsx` (around lines 3-16) to include `Calculator` icon:
  ```typescript
  import {
      Banknote,
      Book,
      LayoutGrid,
      Package,
      PackageSearch,
      Receipt,
      ShoppingCart,
      Tags,
      User,
      Weight,
      TrendingUp,
      Wallet,
      RotateCcw,
      Calculator,
  } from 'lucide-react';
  ```

- [ ] **Step 2: Add HPP Calculator menu item inside Finance group**

  Modify the `navGroups` array inside `AppSidebar` function (around lines 167-184), adding the new navigation item:
  ```typescript
          {
              title: t('component.sidebar.group_finance', 'Keuangan'),
              items: [
                  {
                      title: t('component.sidebar.profit_wallet_menu_label', 'Dompet Profit'),
                      href: profitWallet(),
                      icon: TrendingUp,
                      permission: PERMISSIONENUMS.PROFIT_WALLET.READ,
                      role: [],
                  },
                  {
                      title: t('component.sidebar.capital_wallet_menu_label', 'Dompet Modal'),
                      href: capitalWallet(),
                      icon: Wallet,
                      permission: PERMISSIONENUMS.CAPITAL_WALLET.READ,
                      role: [],
                  },
                  {
                      title: t('component.sidebar.hpp_calculator_menu_label', 'Kalkulator HPP'),
                      href: '/hpp-calculator',
                      icon: Calculator,
                      role: [],
                  },
              ],
          },
  ```

- [ ] **Step 3: Commit**

  ```bash
  git add resources/js/components/app-sidebar.tsx
  git commit -m "feat: add Kalkulator HPP menu item to sidebar"
  ```

---

### Task 3: Implement HPP Calculator Page

**Files:**
- Create: `resources/js/pages/hpp-calculator/index.tsx`

**Interfaces:**
- Consumes: `AppLayout` component for layout frame.
- Produces: Interactive React UI showing split layout for costs input and HPP calculations.

- [ ] **Step 1: Create index.tsx file**

  Create directory `resources/js/pages/hpp-calculator` if it doesn't exist, and create `index.tsx` file with this content:
  ```typescript
  import AppLayout from '@/layouts/app-layout';
  import { Head } from '@inertiajs/react';
  import { useState, useMemo } from 'react';
  import { Plus, Trash2, RotateCcw } from 'lucide-react';

  interface CostItem {
      id: string;
      name: string;
      amount: number;
  }

  export default function HppCalculator() {
      const [productName, setProductName] = useState('');
      const [costs, setCosts] = useState<CostItem[]>([
          { id: '1', name: 'Bahan Baku', amount: 0 },
      ]);
      const [margin, setMargin] = useState(20);

      // Total HPP Sum
      const totalHpp = useMemo(() => {
          return costs.reduce((sum, item) => sum + (item.amount || 0), 0);
      }, [costs]);

      // Calculate suggested selling price
      const suggestedPrice = useMemo(() => {
          const safeMargin = Math.min(Math.max(margin, 0), 99);
          return totalHpp / (1 - safeMargin / 100);
      }, [totalHpp, margin]);

      // Estimated Profit
      const profit = useMemo(() => {
          return Math.max(0, suggestedPrice - totalHpp);
      }, [suggestedPrice, totalHpp]);

      // Add a new cost row
      const addCostItem = () => {
          setCosts([
              ...costs,
              { id: Date.now().toString(), name: '', amount: 0 },
          ]);
      };

      // Remove a cost row
      const removeCostItem = (id: string) => {
          if (costs.length > 1) {
              setCosts(costs.filter((item) => item.id !== id));
          } else {
              setCosts([{ id: '1', name: '', amount: 0 }]);
          }
      };

      // Update specific cost row field
      const updateCostItem = (id: string, field: 'name' | 'amount', value: string | number) => {
          setCosts(
              costs.map((item) => {
                  if (item.id === id) {
                      return { ...item, [field]: value };
                  }
                  return item;
              })
          );
      };

      // Reset form
      const handleReset = () => {
          setProductName('');
          setCosts([{ id: '1', name: 'Bahan Baku', amount: 0 }]);
          setMargin(20);
      };

      // Format to Rupiah currency
      const formatRupiah = (value: number) => {
          return new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
          }).format(value);
      };

      return (
          <AppLayout>
              <Head title="Kalkulator HPP" />
              
              <div className="flex flex-col gap-6 p-6">
                  <div>
                      <h1 className="text-2xl font-bold tracking-tight">Kalkulator HPP</h1>
                      <p className="text-muted-foreground text-sm">
                          Simulasikan Harga Pokok Penjualan (HPP) dan tentukan harga jual produk Anda.
                      </p>
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                      {/* Left: Costs Inputs */}
                      <div className="md:col-span-2 space-y-6">
                          <div className="rounded-xl border bg-card p-6 shadow-xs">
                              <h2 className="text-lg font-semibold mb-4">Detail Simulasi</h2>
                              <div className="space-y-4">
                                  <div>
                                      <label className="text-sm font-medium">Nama Produk (Opsional)</label>
                                      <input
                                          type="text"
                                          className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                          placeholder="Contoh: Nasi Goreng Spesial"
                                          value={productName}
                                          onChange={(e) => setProductName(e.target.value)}
                                      />
                                  </div>
                              </div>
                          </div>

                          <div className="rounded-xl border bg-card p-6 shadow-xs">
                              <div className="flex justify-between items-center mb-4">
                                  <h2 className="text-lg font-semibold">Komponen Biaya</h2>
                                  <button
                                      onClick={addCostItem}
                                      className="inline-flex items-center gap-1.5 justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 h-9 px-4 py-2"
                                  >
                                      <Plus className="h-4 w-4" /> Tambah Baris
                                  </button>
                              </div>

                              <div className="space-y-3">
                                  {costs.map((item, index) => (
                                      <div key={item.id} className="flex gap-3 items-center">
                                          <div className="flex-1">
                                              <input
                                                  type="text"
                                                  placeholder={`Komponen Biaya ${index + 1}`}
                                                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                                                  value={item.name}
                                                  onChange={(e) =>
                                                      updateCostItem(item.id, 'name', e.target.value)
                                                  }
                                              />
                                          </div>
                                          <div className="w-1/3">
                                              <input
                                                  type="number"
                                                  min="0"
                                                  placeholder="Rp 0"
                                                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                                                  value={item.amount || ''}
                                                  onChange={(e) => {
                                                      const val = parseFloat(e.target.value);
                                                      updateCostItem(
                                                          item.id,
                                                          'amount',
                                                          isNaN(val) ? 0 : Math.max(0, val)
                                                      );
                                                  }}
                                              />
                                          </div>
                                          <button
                                              onClick={() => removeCostItem(item.id)}
                                              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground h-9 w-9 text-destructive"
                                              title="Hapus komponen"
                                          >
                                              <Trash2 className="h-4 w-4" />
                                          </button>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      </div>

                      {/* Right: Calculations Summary */}
                      <div className="space-y-6">
                          <div className="rounded-xl border bg-card p-6 shadow-xs sticky top-6">
                              <h2 className="text-lg font-semibold mb-4">Hasil Simulasi</h2>
                              
                              <div className="space-y-6">
                                  <div>
                                      <div className="flex justify-between items-center mb-1">
                                          <label className="text-sm font-medium">Target Margin (%)</label>
                                          <span className="text-sm font-bold text-primary">{margin}%</span>
                                      </div>
                                      <input
                                          type="range"
                                          min="0"
                                          max="99"
                                          className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                                          value={margin}
                                          onChange={(e) => setMargin(parseInt(e.target.value) || 0)}
                                      />
                                      <input
                                          type="number"
                                          min="0"
                                          max="99"
                                          className="mt-2 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-hidden"
                                          value={margin}
                                          onChange={(e) => {
                                              const val = parseInt(e.target.value);
                                              setMargin(isNaN(val) ? 0 : Math.min(Math.max(0, val), 99));
                                          }}
                                      />
                                  </div>

                                  <hr className="border-border" />

                                  <div className="space-y-3">
                                      <div className="flex justify-between">
                                          <span className="text-sm text-muted-foreground">Total HPP</span>
                                          <span className="text-sm font-semibold">{formatRupiah(totalHpp)}</span>
                                      </div>
                                      <div className="flex justify-between">
                                          <span className="text-sm text-muted-foreground">Margin Keuntungan ({margin}%)</span>
                                          <span className="text-sm font-semibold text-emerald-600">
                                              +{formatRupiah(profit)}
                                          </span>
                                      </div>
                                      <div className="flex justify-between pt-3 border-t">
                                          <span className="text-base font-bold">Rekomendasi Harga</span>
                                          <span className="text-base font-bold text-primary">
                                              {formatRupiah(suggestedPrice)}
                                          </span>
                                      </div>
                                  </div>

                                  <div className="flex gap-3">
                                      <button
                                          onClick={handleReset}
                                          className="flex-1 inline-flex items-center gap-1.5 justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
                                      >
                                          <RotateCcw className="h-4 w-4" /> Reset
                                      </button>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </AppLayout>
      );
  }
  ```

- [ ] **Step 2: Commit**

  ```bash
  git add resources/js/pages/hpp-calculator/index.tsx
  git commit -m "feat: implement client-side HPP calculator component"
  ```
