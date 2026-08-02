# Design Spec: Setup Wizard Multi-Language (i18n) Support

## Overview
Menambahkan dukungan multi-bahasa (Bahasa Indonesia & Bahasa Inggris) untuk modul Quick Setup Wizard (`resources/js/pages/setup/index.tsx`) menggunakan `react-i18next`.

## Changes Required

### 1. Translation Keys Structure (`resources/js/locales/en/translation.json` & `id/translation.json`)
Menambahkan grup kunci `"setup"` pada kedua file locale:
- `setup.title`, `setup.subtitle`
- `setup.stepper.database`, `setup.stepper.store`, `setup.stepper.owner`
- `setup.step1.*` (label form database, status, tombol test & migrate)
- `setup.step2.*` (label form toko, tombol nav)
- `setup.step3.*` (label form owner account, tombol finish setup)

### 2. Header Language Switcher
- Menambahkan tombol/select switcher bahasa (EN / ID) di pojok kanan atas halaman `/setup` menggunakan `i18n.changeLanguage()`.

### 3. Component Integration (`resources/js/pages/setup/index.tsx`)
- Mengganti seluruh teks statis dengan `t('setup...')` dari hook `useTranslation()`.

## Verification & Testing
- Memastikan halaman `/setup` dapat berganti bahasa secara instant (EN <-> ID).
- Memastikan build Vite (`npm run build`) dan pengujian Pest (`php artisan test`) lulus 100%.
