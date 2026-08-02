# Design Spec: Separate Setup Wizard Layout

## Overview
Memisahkan halaman Quick Setup Wizard (`setup/index`) dari layout utama aplikasi (`AppLayout`) agar halaman setup berjalan secara mandiri (fullscreen standalone page) tanpa dirender dengan Sidebar bawaan aplikasi.

## Changes Required

### 1. Layout Dispatcher (`resources/js/app.tsx`)
- Menambahkan kondisi di switch case layout resolver:
```tsx
case name.startsWith('setup/'):
    return null;
```
- Hal ini memastikan bahwa halaman `setup/index` tidak dibungkus oleh `AppLayout` yang memuat `AppSidebar`.

## Verification & Testing
- Memastikan halaman `/setup` tampil fullscreen tanpa sidebar bawaan.
- Memastikan build Vite (`npm run build`) dan pengujian Pest (`php artisan test`) lulus 100%.
