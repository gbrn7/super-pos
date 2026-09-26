# Super POS All-in-One Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membangun landing page modern, berkinerja tinggi, dan berkonversi tinggi untuk menjual paket All-in-One Super POS (Hardware Kasir Siap Pakai + Software Seumur Hidup) dengan tombol pemesanan WhatsApp dan akses live demo.

**Architecture:** Aplikasi client-side React 19 + TypeScript + Vite yang modular dan mandiri di workspace `praktis-pos-landing-page`. Menggunakan Tailwind CSS untuk styling responsif dengan penerapan ketat aturan komposisi 60-30-10 dan token warna yang ditentukan dalam spesifikasi desain.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS, Lucide React (`lucide-react`).

## Global Constraints

- **Workspace Path**: `/home/raygbrn/project/react/praktis-pos-landing-page`
- **Color System (Ketat)**:
  - Primary Accent: `#E0511F` (Vivid Warm Orange)
  - Primary Foreground: `#FFFFFF` (White)
  - Soft Accent / Tint: `#FFF0EB` (Light Peach)
  - Background Utama: `#FDFDFD` (Clean Off-White)
  - Foreground / Teks Utama: `#000000` (Deep Black)
  - Muted Text: `#525252` (Neutral Gray)
  - Card Background: `#FFFFFF` dengan border tipis `#E7E7EE`
  - Secondary Button: Background `#EDF0F4` dengan teks `#080808`
- **Komposisi 60-30-10**: 60% dominan background bersih (`#FDFDFD`/`#FFFFFF`), 30% struktural teks gelap & border (`#000000`/`#E7E7EE`), 10% aksen oranye (`#E0511F`/`#FFF0EB`) hanya untuk titik fokus (CTA, badge, ikon aktif). Tidak membuat halaman over-saturated oranye.
- **Copy & Offering**: 1 Paket Standar All-in-One (Mesin Kasir/Tablet Stand + Printer Thermal Struk + Barcode Scanner + Cash Drawer Otomatis + Software POS Seumur Hidup). Tanpa biaya langganan bulanan.

---

### Task 1: Scaffolding Proyek React & Konfigurasi Token Warna Tailwind CSS

**Files:**
- Create: `/home/raygbrn/project/react/praktis-pos-landing-page/package.json`
- Create: `/home/raygbrn/project/react/praktis-pos-landing-page/vite.config.ts`
- Create: `/home/raygbrn/project/react/praktis-pos-landing-page/tsconfig.json`
- Create: `/home/raygbrn/project/react/praktis-pos-landing-page/index.html`
- Create: `/home/raygbrn/project/react/praktis-pos-landing-page/tailwind.config.js`
- Create: `/home/raygbrn/project/react/praktis-pos-landing-page/postcss.config.js`
- Create: `/home/raygbrn/project/react/praktis-pos-landing-page/src/index.css`
- Create: `/home/raygbrn/project/react/praktis-pos-landing-page/src/main.tsx`
- Create: `/home/raygbrn/project/react/praktis-pos-landing-page/src/App.tsx`

**Interfaces:**
- Consumes: Node.js & npm environment
- Produces: Proyek React 19 + Vite + Tailwind CSS yang dapat di-build tanpa error dan memiliki kelas utilitas warna kustom.

- [ ] **Step 1: Inisialisasi package.json dan pasang dependencies**

Di direktori `/home/raygbrn/project/react/praktis-pos-landing-page`, buat `package.json`:
```json
{
  "name": "praktis-pos-landing-page",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "clsx": "^2.1.1",
    "lucide-react": "^1.16.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "tailwind-merge": "^3.0.0"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.3.0",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.17",
    "typescript": "^5.7.0",
    "vite": "^6.0.0"
  }
}
```

Jalankan perintah instalasi dependencies:
```bash
cd /home/raygbrn/project/react/praktis-pos-landing-page && npm install
```

- [ ] **Step 2: Buat konfigurasi Vite, TypeScript, dan Tailwind CSS**

Buat `vite.config.ts`:
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});
```

Buat `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
```

Buat `postcss.config.js`:
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

Buat `tailwind.config.js` dengan palet warna resmi:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#E0511F',
          'primary-fg': '#FFFFFF',
          'soft-accent': '#FFF0EB',
          bg: '#FDFDFD',
          dark: '#000000',
          muted: '#525252',
          border: '#E7E7EE',
          'secondary-bg': '#EDF0F4',
          'secondary-text': '#080808',
        }
      }
    },
  },
  plugins: [],
};
```

- [ ] **Step 3: Buat index.html dan src/index.css**

Buat `index.html`:
```html
<!doctype html>
<html lang="id" class="scroll-smooth">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23E0511F'><path d='M3 3h18v18H3V3z'/></svg>" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Super POS - Paket Mesin Kasir Lengkap Hardware & Software Siap Pakai</title>
    <meta name="description" content="Solusi mesin kasir lengkap siap pakai untuk UMKM & ritel. Tanpa biaya langganan bulanan seumur hidup, otomatis pisahkan kas modal dan profit." />
  </head>
  <body class="bg-[#FDFDFD] text-[#000000] font-sans antialiased selection:bg-[#FFF0EB] selection:text-[#E0511F]">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

Buat `src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  background-color: #FDFDFD;
  color: #000000;
  overflow-x: hidden;
}
```

- [ ] **Step 4: Buat src/main.tsx dan initial src/App.tsx**

Buat `src/main.tsx`:
```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

Buat `src/App.tsx`:
```tsx
export default function App() {
  return (
    <div className="min-h-screen bg-[#FDFDFD] text-[#000000]">
      <div className="flex h-screen items-center justify-center">
        <h1 className="text-3xl font-bold text-[#E0511F]">Super POS Landing Page</h1>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Verifikasi build dan jalankan commit pertama**

Jalankan perintah build:
```bash
cd /home/raygbrn/project/react/praktis-pos-landing-page && npm run build
```
Expected: Sukses menghasilkan folder `dist/` tanpa type error.

Inisialisasi git dan commit:
```bash
cd /home/raygbrn/project/react/praktis-pos-landing-page && git init && git add . && git commit -m "chore: scaffold react project with tailwind color system"
```

---

### Task 2: Pembuatan Tipe Data & File Konten Statis

**Files:**
- Create: `/home/raygbrn/project/react/praktis-pos-landing-page/src/types/index.ts`
- Create: `/home/raygbrn/project/react/praktis-pos-landing-page/src/data/package-data.ts`
- Create: `/home/raygbrn/project/react/praktis-pos-landing-page/src/data/features.ts`
- Create: `/home/raygbrn/project/react/praktis-pos-landing-page/src/data/faqs.ts`

**Interfaces:**
- Consumes: None
- Produces:
  - `HardwareItem`, `FeatureItem`, `FaqItem`, `PackageDetail` types
  - `PACKAGE_DATA`, `CORE_FEATURES`, `FAQS` data structures

- [ ] **Step 1: Definisikan type definitions di src/types/index.ts**

Buat file `/home/raygbrn/project/react/praktis-pos-landing-page/src/types/index.ts`:
```typescript
export interface HardwareItem {
  id: string;
  name: string;
  category: string;
  spec: string;
  description: string;
  iconName: string;
}

export interface FeatureItem {
  id: string;
  title: string;
  tagline: string;
  description: string;
  benefits: string[];
  iconName: string;
  badge?: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface PackageDetail {
  title: string;
  tagline: string;
  priceNote: string;
  hardwareList: HardwareItem[];
  bonuses: string[];
  guarantees: string[];
  waTemplate: string;
}
```

- [ ] **Step 2: Buat konten paket All-in-One di src/data/package-data.ts**

Buat file `/home/raygbrn/project/react/praktis-pos-landing-page/src/data/package-data.ts`:
```typescript
import { PackageDetail } from '../types';

export const PACKAGE_DATA: PackageDetail = {
  title: 'Paket Komplit Mesin Kasir Super POS',
  tagline: '1 Set Hardware Kasir Premium + Software Seumur Hidup Siap Pakai',
  priceNote: 'Sekali Beli • Tanpa Biaya Langganan Bulanan • Hak Milik Seumur Hidup',
  hardwareList: [
    {
      id: 'terminal',
      name: 'Terminal Kasir Touchscreen / Tablet Stand',
      category: 'Display & Komputasi',
      spec: 'Layar responsif tajam, stand metal kokoh anti goyang, hemat daya',
      description: 'Perangkat kasir siap pakai dengan performa stabil untuk melayani transaksi padat seharian.',
      iconName: 'Tablet',
    },
    {
      id: 'printer',
      name: 'Printer Thermal Struk 58mm / 80mm',
      category: 'Pencetak Struk',
      spec: 'Kecepatan cetak 90mm/detik, koneksi USB/Bluetooth, tanpa tinta (thermal)',
      description: 'Format cetak struk retro ala minimarket/Indomaret yang rapi, cepat, dan jelas.',
      iconName: 'Printer',
    },
    {
      id: 'scanner',
      name: 'Barcode Scanner Laser Responsif',
      category: 'Input Cepat',
      spec: 'Sensitivitas tinggi, auto-sensing barcode 1D/2D pada kemasan produk & layar HP',
      description: 'Pindai barcode barang tanpa jeda, memangkas antrean kasir hingga 70%.',
      iconName: 'ScanBarcode',
    },
    {
      id: 'drawer',
      name: 'Laci Uang Kasir Otomatis (Cash Drawer)',
      category: 'Keamanan Uang',
      spec: 'Bodi baja kokoh, 4 slot uang kertas + 5 slot koin, konektor RJ-11',
      description: 'Laci terbuka otomatis setiap kali transaksi kasir selesai dicetak struknya.',
      iconName: 'ShieldCheck',
    },
    {
      id: 'software',
      name: 'Software Super POS Lisensi Lifetime',
      category: 'Sistem Kasir & Keuangan',
      spec: 'Lisensi seumur hidup, multi-user kasir, database lokal & cloud sync',
      description: 'Lengkap dengan modul pemisah Kas Modal & Kas Profit, HPP, cetak barcode, dan retur barang.',
      iconName: 'Cpu',
    },
  ],
  bonuses: [
    'Gratis 5 Roll Kertas Thermal Struk Kualitas Tinggi',
    'Gratis Jasa Instalasi & Setting Driver Sebelum Barang Dikirim',
    'Gratis Input 100 Data Produk Awal Toko Anda',
    'Video Tutorial Lengkap & Panduan Bahasa Indonesia',
  ],
  guarantees: [
    'Garansi Resmi Hardware 1 Tahun',
    'Bantuan Teknis & Konsultasi Langsung via WhatsApp',
    '100% Bebas Biaya Langganan Bulanan atau Tahunan',
  ],
  waTemplate: 'Halo tim Super POS, saya tertarik dengan Paket Komplit Mesin Kasir Siap Pakai. Mohon informasi ketersediaan paket dan cara pemesanannya. Terima kasih!',
};

export const WHATSAPP_NUMBER = '6281234567890'; // Placeholder yang mudah diganti
export const LIVE_DEMO_URL = 'http://localhost:8000'; // Mengarah ke local atau production demo
```

- [ ] **Step 3: Buat data fitur software di src/data/features.ts**

Buat file `/home/raygbrn/project/react/praktis-pos-landing-page/src/data/features.ts`:
```typescript
import { FeatureItem } from '../types';

export const CORE_FEATURES: FeatureItem[] = [
  {
    id: 'pos-cashier',
    title: 'Transaksi Kasir Cepat & Struk Minimarket',
    tagline: 'Layanan Kilat, Struk Rapi, Tanpa Antre',
    description: 'Pilihan mode tampilan ganda (Grid Gambar atau List Kasir Grosir). Dukungan barcode scan instan, diskon per item/total, multi-pembayaran QRIS & tunai, serta struk thermal retro monospace.',
    benefits: [
      'Mode tampilan grid foto atau tabel kasir super cepat',
      'Cetak struk thermal retro monospace ala minimarket',
      'Multi metode bayar: Tunai, QRIS, Transfer Bank',
      'Peringatan otomatis jika stok barang tidak mencukupi',
    ],
    iconName: 'ShoppingCart',
    badge: 'Transaksi Cepat',
  },
  {
    id: 'dual-wallet',
    title: 'Pemisah Kas Modal & Kas Profit',
    tagline: 'Uang Modal Aman, Laba Bersih Pasti',
    description: 'Satu-satunya sistem kasir yang secara otomatis memisahkan uang kulakan (modal) dan keuntungan bersih di setiap transaksi. Mencegah uang modal terpakai untuk belanja pribadi.',
    benefits: [
      'Pemisahan otomatis kas modal vs kas laba pada setiap struk',
      'Tahu pasti berapa dividen/keuntungan yang aman diambil pemilik',
      'Catat suntikan modal (inject) dan tarik modal (drawdown)',
      'Laporan mutasi dompet transparan dan bisa diexport ke Excel',
    ],
    iconName: 'Wallet',
    badge: 'Fitur Finansial Unik',
  },
  {
    id: 'inventory-barcode',
    title: 'Manajemen Stok & Cetak Barcode Mandiri',
    tagline: 'Stok Terkendali, Label Barcode Sekali Klik',
    description: 'Kelola ribuan produk dengan mudah. Cetak stiker barcode produk langsung dari aplikasi tanpa software tambahan, dapatkan notifikasi stok menipis, dan import massal via Excel.',
    benefits: [
      'Cetak label barcode langsung untuk ditempel ke produk',
      'Peringatan otomatis saat stok barang mulai menipis',
      'Impor dan ekspor data barang massal via template Excel',
      'Pelacakan total produk terjual (sold quantity) real-time',
    ],
    iconName: 'Barcode',
    badge: 'Inventori Otomatis',
  },
  {
    id: 'hpp-report',
    title: 'Kalkulator HPP & Laporan Laba Rugi',
    tagline: 'Hitung Margin Presisi, Pantau Bisnis Real-Time',
    description: 'Kalkulator HPP bawaan membantu menghitung biaya modal dan menentukan harga jual ideal. Dilengkapi dashboard analitik dengan grafik omzet, tren laba bersih, dan produk terlaris.',
    benefits: [
      'Kalkulator HPP untuk menghitung margin keuntungan sebelum jual',
      'Grafik interaktif tren omzet & penjualan harian/bulanan',
      'Laporan produk paling laris (Best Sellers) untuk restock',
      'Modul retur barang otomatis merevisi stok & laporan keuangan',
    ],
    iconName: 'TrendingUp',
    badge: 'Analitik Akurat',
  },
];
```

- [ ] **Step 4: Buat data FAQ di src/data/faqs.ts**

Buat file `/home/raygbrn/project/react/praktis-pos-landing-page/src/data/faqs.ts`:
```typescript
import { FaqItem } from '../types';

export const FAQS: FaqItem[] = [
  {
    id: 'faq-1',
    question: 'Apakah mesin kasir ini memerlukan koneksi internet setiap saat?',
    answer: 'Tidak wajib. Sistem Super POS dapat beroperasi secara offline di jaringan lokal toko Anda. Transaksi kasir, cetak struk, dan update stok tetap berjalan lancar saat internet mati. Saat terhubung internet, data dapat disinkronkan untuk dipantau pemilik dari jauh.',
  },
  {
    id: 'faq-2',
    question: 'Apakah benar-benar tidak ada biaya langganan bulanan atau tahunan?',
    answer: 'Benar 100%. Pembelian paket ini berskema beli putus (Lifetime License). Anda tidak akan ditagih biaya sewa bulanan, biaya per transaksi, atau biaya perpanjangan tahunan.',
  },
  {
    id: 'faq-3',
    question: 'Bagaimana jika saya atau kasir saya belum pernah menggunakan mesin kasir sebelumnya?',
    answer: 'Semua unit hardware sudah kami rakit, install driver, dan uji coba sebelum dikirim. Saat paket tiba, Anda tinggal mencolokkan kabel ke stopkontak. Kami juga menyertakan video panduan langkah-demi-langkah berbahasa Indonesia serta layanan bantuan teknis langsung via WhatsApp.',
  },
  {
    id: 'faq-4',
    question: 'Bagaimana ketentuan garansi hardware jika ada perangkat yang rusak?',
    answer: 'Semua perangkat hardware (layar kasir, printer thermal, scanner barcode, laci uang) dilindungi garansi 1 tahun. Jika terjadi kendala bawaan pabrik, tim teknis kami siap membantu servis atau penggantian komponen.',
  },
  {
    id: 'faq-5',
    question: 'Bisakah saya memasukkan data ratusan produk toko saya sekaligus?',
    answer: 'Bisa sangat mudah! Kami menyediakan fitur import data produk melalui file Excel. Anda cukup memasukkan nama barang, harga modal, harga jual, dan stok, lalu upload ke sistem dalam hitungan detik. Bahkan untuk pembeli paket ini, tim kami bisa bantu masukkan 100 produk pertama secara gratis.',
  },
];
```

- [ ] **Step 5: Verifikasi type safety dan commit**

Jalankan type checking:
```bash
cd /home/raygbrn/project/react/praktis-pos-landing-page && npx tsc --noEmit
```
Expected: Tidak ada error.

Commit data definitions:
```bash
cd /home/raygbrn/project/react/praktis-pos-landing-page && git add src/types src/data && git commit -m "feat: add data models and static content for package, features, and faqs"
```

---

### Task 3: Pembuatan Komponen Navbar, Hero Section, & Mockup Dashboard Preview

**Files:**
- Create: `/home/raygbrn/project/react/praktis-pos-landing-page/src/components/Navbar.tsx`
- Create: `/home/raygbrn/project/react/praktis-pos-landing-page/src/components/MockupPreview.tsx`
- Create: `/home/raygbrn/project/react/praktis-pos-landing-page/src/components/Hero.tsx`
- Modify: `/home/raygbrn/project/react/praktis-pos-landing-page/src/App.tsx`

**Interfaces:**
- Consumes: `PACKAGE_DATA`, `WHATSAPP_NUMBER`, `LIVE_DEMO_URL`
- Produces: Header navigasi responsif, Hero section dengan 2 CTA buttons, dan kartu mockup antarmuka kasir.

- [ ] **Step 1: Buat komponen src/components/Navbar.tsx**

Terapkan aturan warna: Teks logo `#000000` dengan ikon `#E0511F`, Secondary button `#EDF0F4`/`#080808`, Primary button `#E0511F`/`#FFFFFF`.

Buat `/home/raygbrn/project/react/praktis-pos-landing-page/src/components/Navbar.tsx`:
```tsx
import React, { useState } from 'react';
import { Store, MessageCircle, MonitorPlay, Menu, X } from 'lucide-react';
import { PACKAGE_DATA, WHATSAPP_NUMBER, LIVE_DEMO_URL } from '../data/package-data';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getWaUrl = () => {
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(PACKAGE_DATA.waTemplate)}`;
  };

  return (
    <header className="sticky top-0 z-50 bg-[#FDFDFD]/95 backdrop-blur-md border-b border-[#E7E7EE]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-[#FFF0EB] flex items-center justify-center text-[#E0511F] group-hover:scale-105 transition-transform duration-200">
              <Store className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-[#000000]">Super<span className="text-[#E0511F]">POS</span></span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-[#FFF0EB] text-[#E0511F]">All-in-One</span>
            </div>
          </a>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#525252]">
            <a href="#hardware" className="hover:text-[#000000] transition-colors">Paket Hardware</a>
            <a href="#fitur" className="hover:text-[#000000] transition-colors">Fitur Software</a>
            <a href="#keunggulan" className="hover:text-[#000000] transition-colors">Kas Modal & Profit</a>
            <a href="#faq" className="hover:text-[#000000] transition-colors">FAQ</a>
          </nav>

          {/* Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <a
              href={LIVE_DEMO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-[#EDF0F4] text-[#080808] hover:bg-[#E2E6EA] transition-colors"
            >
              <MonitorPlay className="w-4 h-4 text-[#525252]" />
              <span>Coba Demo</span>
            </a>
            <a
              href={getWaUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-[#E0511F] text-[#FFFFFF] hover:bg-[#C94213] shadow-sm hover:shadow transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Pesan Paket</span>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <a
              href={getWaUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#E0511F] text-[#FFFFFF]"
            >
              Pesan
            </a>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#525252] hover:text-[#000000] hover:bg-[#EDF0F4]"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-[#E7E7EE] flex flex-col gap-3">
            <a
              href="#hardware"
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1.5 text-sm font-medium text-[#525252] hover:text-[#000000]"
            >
              Paket Hardware
            </a>
            <a
              href="#fitur"
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1.5 text-sm font-medium text-[#525252] hover:text-[#000000]"
            >
              Fitur Software
            </a>
            <a
              href="#keunggulan"
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1.5 text-sm font-medium text-[#525252] hover:text-[#000000]"
            >
              Kas Modal & Profit
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1.5 text-sm font-medium text-[#525252] hover:text-[#000000]"
            >
              FAQ
            </a>
            <div className="pt-2 flex flex-col gap-2">
              <a
                href={LIVE_DEMO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-[#EDF0F4] text-[#080808]"
              >
                <MonitorPlay className="w-4 h-4 text-[#525252]" />
                <span>Coba Live Demo Software</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
```

- [ ] **Step 2: Buat komponen mockup dashboard preview di src/components/MockupPreview.tsx**

Komponen ini memberikan preview visual dashboard POS yang mencerminkan fitur nyata Super POS (Chart ringkasan, kartu Dompet Modal, kartu Dompet Profit, dan transaksi kasir).

Buat `/home/raygbrn/project/react/praktis-pos-landing-page/src/components/MockupPreview.tsx`:
```tsx
import React from 'react';
import { ShoppingCart, Wallet, ArrowDownRight, ArrowUpRight, TrendingUp, CheckCircle2 } from 'lucide-react';

export const MockupPreview: React.FC = () => {
  return (
    <div className="w-full bg-[#FFFFFF] rounded-2xl border border-[#E7E7EE] shadow-xl overflow-hidden">
      {/* Window bar */}
      <div className="bg-[#F8F9FA] px-4 py-3 border-b border-[#E7E7EE] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
          <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
          <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
          <span className="ml-2 text-xs font-medium text-[#525252] hidden sm:inline">superpos.app/dashboard</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-[#000000]">
          <span className="w-2 h-2 rounded-full bg-[#E0511F] animate-pulse" />
          <span>Sistem Kasir Aktif</span>
        </div>
      </div>

      {/* Mockup Dashboard Content */}
      <div className="p-4 sm:p-6 bg-[#FFFFFF] space-y-5">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Omzet Hari Ini */}
          <div className="p-4 rounded-xl border border-[#E7E7EE] bg-[#FDFDFD]">
            <div className="flex items-center justify-between text-xs font-medium text-[#525252]">
              <span>Omzet Hari Ini</span>
              <TrendingUp className="w-4 h-4 text-[#E0511F]" />
            </div>
            <div className="mt-2 text-xl sm:text-2xl font-bold text-[#000000]">Rp 4.850.000</div>
            <div className="mt-1 flex items-center text-xs font-medium text-[#E0511F]">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              <span>42 Transaksi Selesai</span>
            </div>
          </div>

          {/* Dompet Modal (Capital Wallet) */}
          <div className="p-4 rounded-xl border border-[#E7E7EE] bg-[#FDFDFD]">
            <div className="flex items-center justify-between text-xs font-medium text-[#525252]">
              <span>Dompet Modal (Kulakan)</span>
              <Wallet className="w-4 h-4 text-[#525252]" />
            </div>
            <div className="mt-2 text-xl sm:text-2xl font-bold text-[#000000]">Rp 3.200.000</div>
            <div className="mt-1 flex items-center text-xs font-medium text-[#525252]">
              <span>Aman & Terkunci untuk Restock</span>
            </div>
          </div>

          {/* Dompet Profit (Bersih Siap Tarik) */}
          <div className="p-4 rounded-xl border border-[#E0511F]/30 bg-[#FFF0EB]/40">
            <div className="flex items-center justify-between text-xs font-semibold text-[#E0511F]">
              <span>Dompet Profit (Laba Bersih)</span>
              <CheckCircle2 className="w-4 h-4 text-[#E0511F]" />
            </div>
            <div className="mt-2 text-xl sm:text-2xl font-bold text-[#E0511F]">Rp 1.650.000</div>
            <div className="mt-1 flex items-center text-xs font-semibold text-[#000000]">
              <span>Siap Dicairkan Pemilik Toko</span>
            </div>
          </div>
        </div>

        {/* Live POS Transaction Feed Preview */}
        <div className="rounded-xl border border-[#E7E7EE] overflow-hidden">
          <div className="bg-[#F8F9FA] px-4 py-2.5 text-xs font-semibold text-[#000000] flex justify-between items-center">
            <span>Transaksi Kasir Real-time Terkini</span>
            <span className="text-[11px] font-normal text-[#525252]">Cetak Struk Otomatis</span>
          </div>
          <div className="divide-y divide-[#E7E7EE] text-xs">
            <div className="p-3 flex items-center justify-between hover:bg-[#FDFDFD]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#FFF0EB] flex items-center justify-center text-[#E0511F]">
                  <ShoppingCart className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-[#000000]">INV-20260926-042</div>
                  <div className="text-[11px] text-[#525252]">3 Barang • Kasir: Budi • QRIS</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-[#000000]">Rp 145.000</div>
                <div className="text-[11px] text-[#E0511F] font-medium">+Rp 45.000 Profit</div>
              </div>
            </div>

            <div className="p-3 flex items-center justify-between hover:bg-[#FDFDFD]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#EDF0F4] flex items-center justify-center text-[#080808]">
                  <ShoppingCart className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-[#000000]">INV-20260926-041</div>
                  <div className="text-[11px] text-[#525252]">5 Barang • Kasir: Siti • Tunai</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-[#000000]">Rp 320.000</div>
                <div className="text-[11px] text-[#E0511F] font-medium">+Rp 95.000 Profit</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
```

- [ ] **Step 3: Buat komponen Hero section di src/components/Hero.tsx**

Terapkan aturan: Pill badge `#FFF0EB` dengan teks `#E0511F`, Headline H1 `#000000`, Subtitle `#525252`, 2 Tombol CTA sesuai palet.

Buat `/home/raygbrn/project/react/praktis-pos-landing-page/src/components/Hero.tsx`:
```tsx
import React from 'react';
import { MessageCircle, MonitorPlay, Sparkles, Check, ArrowRight } from 'lucide-react';
import { PACKAGE_DATA, WHATSAPP_NUMBER, LIVE_DEMO_URL } from '../data/package-data';
import { MockupPreview } from './MockupPreview';

export const Hero: React.FC = () => {
  const getWaUrl = () => {
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(PACKAGE_DATA.waTemplate)}`;
  };

  return (
    <section className="relative pt-10 pb-16 sm:pt-16 sm:pb-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF0EB] border border-[#E0511F]/20 text-[#E0511F] text-xs sm:text-sm font-semibold mb-6 animate-fade-in">
            <Sparkles className="w-4 h-4" />
            <span>Paket Lengkap Hardware + Software Siap Pakai</span>
          </div>

          {/* Headline H1 */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#000000] tracking-tight leading-[1.15]">
            Solusi Mesin Kasir Lengkap: <br className="hidden sm:inline" />
            <span className="text-[#E0511F]">Buka Dus, Colok,</span> Langsung Siap Jualan.
          </h1>

          {/* Subtitle */}
          <p className="mt-5 text-base sm:text-lg text-[#525252] leading-relaxed max-w-2xl mx-auto">
            Kelola transaksi kasir secepat kilat, pantau stok akurat, dan otomatis pisahkan uang modal kulakan vs laba bersih toko Anda. <strong>100% tanpa biaya langganan bulanan.</strong>
          </p>

          {/* 2 CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={getWaUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-base font-bold bg-[#E0511F] text-[#FFFFFF] hover:bg-[#C94213] shadow-md hover:shadow-lg transition-all group"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Konsultasi & Pesan via WhatsApp</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>

            <a
              href={LIVE_DEMO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-base font-semibold bg-[#EDF0F4] text-[#080808] hover:bg-[#E2E6EA] transition-colors"
            >
              <MonitorPlay className="w-5 h-5 text-[#525252]" />
              <span>Eksplorasi Live Demo Software</span>
            </a>
          </div>

          {/* Value Highlights Under CTA */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs sm:text-sm text-[#525252]">
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-[#E0511F] stroke-[2.5]" />
              Hak Milik Seumur Hidup
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-[#E0511F] stroke-[2.5]" />
              Garansi Hardware 1 Tahun
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-[#E0511F] stroke-[2.5]" />
              Gratis Setup & Training
            </span>
          </div>
        </div>

        {/* Mockup Dashboard Preview Container */}
        <div className="mt-12 sm:mt-16 max-w-4xl mx-auto">
          <MockupPreview />
        </div>
      </div>
    </section>
  );
};
```

- [ ] **Step 4: Update src/App.tsx untuk merender Navbar dan Hero**

Edit `/home/raygbrn/project/react/praktis-pos-landing-page/src/App.tsx`:
```tsx
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';

export default function App() {
  return (
    <div className="min-h-screen bg-[#FDFDFD] text-[#000000]">
      <Navbar />
      <main>
        <Hero />
      </main>
    </div>
  );
}
```

- [ ] **Step 5: Verifikasi build dan commit**

Jalankan:
```bash
cd /home/raygbrn/project/react/praktis-pos-landing-page && npm run build
```
Expected: Sukses tanpa error.

Commit Task 3:
```bash
cd /home/raygbrn/project/react/praktis-pos-landing-page && git add src/components src/App.tsx && git commit -m "feat: implement Navbar, Hero section, and POS MockupPreview"
```

---

### Task 4: Pembuatan Komponen Social Proof, Hardware Showcase ("What's In The Box"), & Feature Grid

**Files:**
- Create: `/home/raygbrn/project/react/praktis-pos-landing-page/src/components/SocialProof.tsx`
- Create: `/home/raygbrn/project/react/praktis-pos-landing-page/src/components/HardwareShowcase.tsx`
- Create: `/home/raygbrn/project/react/praktis-pos-landing-page/src/components/FeatureGrid.tsx`
- Modify: `/home/raygbrn/project/react/praktis-pos-landing-page/src/App.tsx`

**Interfaces:**
- Consumes: `PACKAGE_DATA`, `CORE_FEATURES`, `WHATSAPP_NUMBER`
- Produces: Bar metrik toko, unboxing showcase paket hardware All-in-One, dan grid 4 fitur unggulan software.

- [ ] **Step 1: Buat komponen SocialProof di src/components/SocialProof.tsx**

Terapkan garis tepi `#E7E7EE`, teks judul `#000000`, teks pendukung `#525252`, dan aksen angka `#E0511F`.

Buat `/home/raygbrn/project/react/praktis-pos-landing-page/src/components/SocialProof.tsx`:
```tsx
import React from 'react';
import { Store, ShoppingBag, Coffee, Sparkles } from 'lucide-react';

export const SocialProof: React.FC = () => {
  const metrics = [
    { number: 'Rp 0', label: 'Biaya Bulanan', desc: 'Sekali beli, bebas biaya sewa atau perpanjangan selamanya' },
    { number: '100%', label: 'Siap Pakai', desc: 'Hardware, driver & database sudah di-setting sebelum kirim' },
    { number: '2 Dompet', label: 'Terpisah Otomatis', desc: 'Uang modal kulakan & laba bersih tidak akan tercampur' },
    { number: '1 Tahun', label: 'Garansi Resmi', desc: 'Jaminan penggantian unit hardware & konsultasi teknis' },
  ];

  const industries = [
    { name: 'Minimarket & Kelontong', icon: Store },
    { name: 'Fashion, Pakaian & Butik', icon: ShoppingBag },
    { name: 'Kafe, Resto & F&B Retail', icon: Coffee },
    { name: 'Toko ATK, Bangunan & Elektronik', icon: Sparkles },
  ];

  return (
    <section className="py-12 border-y border-[#E7E7EE] bg-[#FFFFFF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 4 Metrik Utama */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {metrics.map((m, idx) => (
            <div key={idx} className="text-center sm:text-left">
              <div className="text-2xl sm:text-3xl font-extrabold text-[#E0511F]">{m.number}</div>
              <div className="text-sm font-bold text-[#000000] mt-0.5">{m.label}</div>
              <p className="text-xs text-[#525252] mt-1 leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>

        {/* Target Industri */}
        <div className="mt-10 pt-8 border-t border-[#E7E7EE]">
          <p className="text-center text-xs font-semibold text-[#525252] uppercase tracking-wider mb-4">
            Dirancang & Teruji untuk Berbagai Jenis Bisnis Retail & UMKM
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            {industries.map((ind, idx) => {
              const Icon = ind.icon;
              return (
                <div
                  key={idx}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#E7E7EE] bg-[#FDFDFD] text-xs font-medium text-[#000000]"
                >
                  <Icon className="w-3.5 h-3.5 text-[#E0511F]" />
                  <span>{ind.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
```

- [ ] **Step 2: Buat komponen HardwareShowcase di src/components/HardwareShowcase.tsx**

Menampilkan 1 paket All-in-One hardware ("What's In The Box") dengan card putih `#FFFFFF`, border `#E7E7EE`, icon container `#FFF0EB` + icon `#E0511F`, daftar bonus, dan CTA WhatsApp.

Buat `/home/raygbrn/project/react/praktis-pos-landing-page/src/components/HardwareShowcase.tsx`:
```tsx
import React from 'react';
import { Tablet, Printer, ScanBarcode, ShieldCheck, Cpu, CheckCircle2, Gift, MessageCircle, ArrowRight } from 'lucide-react';
import { PACKAGE_DATA, WHATSAPP_NUMBER } from '../data/package-data';

export const HardwareShowcase: React.FC = () => {
  const getIcon = (name: string) => {
    switch (name) {
      case 'Tablet': return Tablet;
      case 'Printer': return Printer;
      case 'ScanBarcode': return ScanBarcode;
      case 'ShieldCheck': return ShieldCheck;
      case 'Cpu': return Cpu;
      default: return Tablet;
    }
  };

  const getWaUrl = () => {
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(PACKAGE_DATA.waTemplate)}`;
  };

  return (
    <section id="hardware" className="py-16 sm:py-24 bg-[#FDFDFD]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF0EB] text-[#E0511F] text-xs font-bold uppercase tracking-wider mb-3">
            What's In The Box
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#000000] tracking-tight">
            1 Paket Lengkap Mesin Kasir Siap Pakai
          </h2>
          <p className="mt-3 text-base text-[#525252]">
            Semua perangkat yang Anda butuhkan untuk operasional toko sudah tersedia dalam satu paket. Buka dus, colok kabel, dan langsung siap transaksi.
          </p>
        </div>

        {/* 5 Hardware Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PACKAGE_DATA.hardwareList.map((item) => {
            const IconComponent = getIcon(item.iconName);
            return (
              <div
                key={item.id}
                className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#E7E7EE] hover:border-[#E0511F]/40 transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#FFF0EB] flex items-center justify-center text-[#E0511F] mb-4">
                    <IconComponent className="w-6 h-6 stroke-[2]" />
                  </div>
                  <span className="text-xs font-semibold text-[#E0511F] uppercase tracking-wider">{item.category}</span>
                  <h3 className="text-lg font-bold text-[#000000] mt-1">{item.name}</h3>
                  <p className="text-xs font-medium text-[#525252] mt-1 bg-[#F8F9FA] p-2 rounded-lg border border-[#E7E7EE]">
                    Spesifikasi: {item.spec}
                  </p>
                  <p className="text-sm text-[#525252] mt-3 leading-relaxed">
                    {item.description}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#E7E7EE] flex items-center gap-1.5 text-xs font-semibold text-[#000000]">
                  <CheckCircle2 className="w-4 h-4 text-[#E0511F]" />
                  <span>Termasuk Setting & Driver</span>
                </div>
              </div>
            );
          })}

          {/* Card Bonus & Guarantee */}
          <div className="bg-[#FFFFFF] p-6 rounded-2xl border-2 border-dashed border-[#E0511F]/30 bg-[#FFF0EB]/20 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#FFF0EB] flex items-center justify-center text-[#E0511F] mb-4">
                <Gift className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-[#E0511F] uppercase tracking-wider">Bonus Spesial Pembelian</span>
              <h3 className="text-lg font-bold text-[#000000] mt-1">Gratis Starter Kit Toko</h3>
              <ul className="mt-3 space-y-2 text-xs text-[#525252]">
                {PACKAGE_DATA.bonuses.map((b, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#E0511F] shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-[#E0511F]/20">
              <a
                href={getWaUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold bg-[#E0511F] text-[#FFFFFF] hover:bg-[#C94213] transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Tanyakan Harga Promo via WA</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
```

- [ ] **Step 3: Buat komponen FeatureGrid di src/components/FeatureGrid.tsx**

Menyoroti 4 pilar fitur software:
1. Kasir Cepat & Struk Minimarket
2. Dompet Modal & Kas Profit (Killer Feature)
3. Manajemen Stok & Barcode Mandiri
4. Kalkulator HPP & Laporan Laba Rugi

Buat `/home/raygbrn/project/react/praktis-pos-landing-page/src/components/FeatureGrid.tsx`:
```tsx
import React from 'react';
import { ShoppingCart, Wallet, Barcode, TrendingUp, Check } from 'lucide-react';
import { CORE_FEATURES } from '../data/features';

export const FeatureGrid: React.FC = () => {
  const getIcon = (name: string) => {
    switch (name) {
      case 'ShoppingCart': return ShoppingCart;
      case 'Wallet': return Wallet;
      case 'Barcode': return Barcode;
      case 'TrendingUp': return TrendingUp;
      default: return ShoppingCart;
    }
  };

  return (
    <section id="fitur" className="py-16 sm:py-24 bg-[#FFFFFF] border-t border-[#E7E7EE]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF0EB] text-[#E0511F] text-xs font-bold uppercase tracking-wider mb-3">
            Fitur Software Unggulan
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#000000] tracking-tight">
            Lebih Dari Sekadar Kasir Biasa
          </h2>
          <p className="mt-3 text-base text-[#525252]">
            Dibangun dengan teknologi modern yang ringan, cepat, dan dibekali alat keuangan unik untuk mengamankan keuntungan toko Anda.
          </p>
        </div>

        {/* 4 Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {CORE_FEATURES.map((feature) => {
            const Icon = getIcon(feature.iconName);
            const isHighlight = feature.id === 'dual-wallet';

            return (
              <div
                key={feature.id}
                id={feature.id === 'dual-wallet' ? 'keunggulan' : undefined}
                className={`p-8 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                  isHighlight
                    ? 'border-[#E0511F] bg-[#FFFFFF] shadow-md ring-1 ring-[#E0511F]/20'
                    : 'border-[#E7E7EE] bg-[#FDFDFD] hover:border-[#E0511F]/30'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-[#FFF0EB] flex items-center justify-center text-[#E0511F]">
                      <Icon className="w-6 h-6 stroke-[2]" />
                    </div>
                    {feature.badge && (
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#FFF0EB] text-[#E0511F]">
                        {feature.badge}
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-[#000000]">{feature.title}</h3>
                  <p className="text-sm font-semibold text-[#E0511F] mt-1">{feature.tagline}</p>
                  <p className="text-sm text-[#525252] mt-3 leading-relaxed">{feature.description}</p>

                  {/* Bullet Benefits */}
                  <ul className="mt-5 space-y-2.5">
                    {feature.benefits.map((benefit, bIdx) => (
                      <li key={bIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#000000]">
                        <div className="w-4 h-4 rounded-full bg-[#FFF0EB] flex items-center justify-center text-[#E0511F] shrink-0 mt-0.5">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
```

- [ ] **Step 4: Sambungkan SocialProof, HardwareShowcase, dan FeatureGrid di src/App.tsx**

Perbarui `/home/raygbrn/project/react/praktis-pos-landing-page/src/App.tsx`:
```tsx
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { SocialProof } from './components/SocialProof';
import { HardwareShowcase } from './components/HardwareShowcase';
import { FeatureGrid } from './components/FeatureGrid';

export default function App() {
  return (
    <div className="min-h-screen bg-[#FDFDFD] text-[#000000]">
      <Navbar />
      <main>
        <Hero />
        <SocialProof />
        <HardwareShowcase />
        <FeatureGrid />
      </main>
    </div>
  );
}
```

- [ ] **Step 5: Verifikasi build dan commit**

Jalankan:
```bash
cd /home/raygbrn/project/react/praktis-pos-landing-page && npm run build
```
Expected: Build sukses tanpa warning atau error.

Commit Task 4:
```bash
cd /home/raygbrn/project/react/praktis-pos-landing-page && git add src/components src/App.tsx && git commit -m "feat: add SocialProof, HardwareShowcase, and FeatureGrid components"
```

---

### Task 5: Pembuatan Demo Banner, FAQ Accordion, Final CTA, Footer, & Floating WhatsApp Button

**Files:**
- Create: `/home/raygbrn/project/react/praktis-pos-landing-page/src/components/DemoBanner.tsx`
- Create: `/home/raygbrn/project/react/praktis-pos-landing-page/src/components/Faq.tsx`
- Create: `/home/raygbrn/project/react/praktis-pos-landing-page/src/components/CtaBanner.tsx`
- Create: `/home/raygbrn/project/react/praktis-pos-landing-page/src/components/Footer.tsx`
- Create: `/home/raygbrn/project/react/praktis-pos-landing-page/src/components/FloatingWhatsApp.tsx`
- Modify: `/home/raygbrn/project/react/praktis-pos-landing-page/src/App.tsx`

**Interfaces:**
- Consumes: `FAQS`, `PACKAGE_DATA`, `WHATSAPP_NUMBER`, `LIVE_DEMO_URL`
- Produces: Komponen interaktif lengkap yang menyelesaikan seluruh struktur landing page.

- [ ] **Step 1: Buat komponen DemoBanner di src/components/DemoBanner.tsx**

Buat `/home/raygbrn/project/react/praktis-pos-landing-page/src/components/DemoBanner.tsx`:
```tsx
import React from 'react';
import { MonitorPlay, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { LIVE_DEMO_URL } from '../data/package-data';

export const DemoBanner: React.FC = () => {
  return (
    <section className="py-14 bg-[#FDFDFD]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-[#FFFFFF] border border-[#E7E7EE] shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF0EB] text-[#E0511F] text-xs font-bold mb-3">
              <Zap className="w-3.5 h-3.5" />
              <span>Tanpa Perlu Install Apapun</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#000000] tracking-tight">
              Ingin Mencoba Langsung Fitur Kasirnya?
            </h3>
            <p className="mt-2 text-sm text-[#525252] leading-relaxed">
              Buka aplikasi demo langsung di browser Anda sekarang. Rasakan sendiri cepatnya transaksi, kemudahan scan barcode, dan kejelasan laporan kas modal vs profit sebelum memesan paket hardware.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-3 w-full md:w-auto shrink-0">
            <a
              href={LIVE_DEMO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold bg-[#E0511F] text-[#FFFFFF] hover:bg-[#C94213] shadow transition-all"
            >
              <MonitorPlay className="w-4 h-4" />
              <span>Buka Live Demo Kasir</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <div className="flex items-center justify-center gap-1 text-xs text-[#525252]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#E0511F]" />
              <span>Akses langsung instan</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
```

- [ ] **Step 2: Buat komponen FAQ Accordion di src/components/Faq.tsx**

Akordion interaktif dengan transisi halus dan toggle buka-tutup.

Buat `/home/raygbrn/project/react/praktis-pos-landing-page/src/components/Faq.tsx`:
```tsx
import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { FAQS } from '../data/faqs';

export const Faq: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>(FAQS[0]?.id || null);

  const toggleFaq = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section id="faq" className="py-16 sm:py-24 bg-[#FFFFFF] border-t border-[#E7E7EE]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF0EB] text-[#E0511F] text-xs font-bold uppercase tracking-wider mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Tanya Jawab</span>
          </div>
          <h2 className="text-3xl font-extrabold text-[#000000] tracking-tight">
            Pertanyaan yang Sering Diajukan
          </h2>
          <p className="mt-2 text-sm text-[#525252]">
            Informasi penting terkait perangkat keras, software, dan garansi paket Super POS.
          </p>
        </div>

        <div className="space-y-3.5">
          {FAQS.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className="rounded-xl border border-[#E7E7EE] bg-[#FDFDFD] overflow-hidden transition-colors"
              >
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-[#000000] hover:text-[#E0511F] transition-colors"
                  aria-expanded={isOpen}
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#525252] shrink-0 transition-transform duration-200 ${
                      isOpen ? 'transform rotate-180 text-[#E0511F]' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-[#525252] leading-relaxed border-t border-[#E7E7EE]/60 pt-3">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
```

- [ ] **Step 3: Buat komponen CtaBanner di src/components/CtaBanner.tsx**

Banner penutup berlatar bersih dengan border aksen dan tombol WhatsApp langsung.

Buat `/home/raygbrn/project/react/praktis-pos-landing-page/src/components/CtaBanner.tsx`:
```tsx
import React from 'react';
import { MessageCircle, Check, ArrowRight } from 'lucide-react';
import { PACKAGE_DATA, WHATSAPP_NUMBER } from '../data/package-data';

export const CtaBanner: React.FC = () => {
  const getWaUrl = () => {
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(PACKAGE_DATA.waTemplate)}`;
  };

  return (
    <section className="py-16 sm:py-20 bg-[#FDFDFD] border-t border-[#E7E7EE]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative p-8 sm:p-14 rounded-3xl bg-[#FFFFFF] border-2 border-[#E7E7EE] shadow-lg text-center overflow-hidden">
          {/* Subtle background accent dot */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-[#FFF0EB] -z-0 opacity-70" />

          <div className="relative z-10 max-w-2xl mx-auto">
            <span className="inline-block px-3 py-1 rounded-full bg-[#FFF0EB] text-[#E0511F] text-xs font-bold uppercase tracking-wider mb-4">
              Siap Memajukan Toko Anda?
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#000000] tracking-tight">
              Miliki Paket Mesin Kasir Lengkap Hari Ini
            </h2>
            <p className="mt-4 text-sm sm:text-base text-[#525252] leading-relaxed">
              Konsultasikan jenis usaha dan kebutuhan toko Anda dengan tim kami. Perangkat kami rakit dan uji sebelum dikirim langsung ke alamat Anda.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={getWaUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-bold bg-[#E0511F] text-[#FFFFFF] hover:bg-[#C94213] shadow-md hover:shadow-lg transition-all"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Konsultasi & Pesan via WhatsApp</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            <div className="mt-6 flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-xs text-[#525252]">
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#E0511F]" /> Beli Putus Tanpa Biaya Bulanan
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#E0511F]" /> Garansi Hardware 1 Tahun
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#E0511F]" /> Bantuan Panduan Sampai Bisa
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
```

- [ ] **Step 4: Buat komponen Footer di src/components/Footer.tsx dan FloatingWhatsApp di src/components/FloatingWhatsApp.tsx**

Buat `/home/raygbrn/project/react/praktis-pos-landing-page/src/components/Footer.tsx`:
```tsx
import React from 'react';
import { Store, MessageCircle } from 'lucide-react';
import { PACKAGE_DATA, WHATSAPP_NUMBER } from '../data/package-data';

export const Footer: React.FC = () => {
  const getWaUrl = () => {
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(PACKAGE_DATA.waTemplate)}`;
  };

  return (
    <footer className="bg-[#FFFFFF] border-t border-[#E7E7EE] py-12 text-[#525252] text-xs sm:text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#FFF0EB] flex items-center justify-center text-[#E0511F]">
                <Store className="w-4 h-4 stroke-[2.2]" />
              </div>
              <span className="text-lg font-bold text-[#000000]">Super<span className="text-[#E0511F]">POS</span></span>
            </div>
            <p className="mt-3 text-xs text-[#525252] max-w-sm leading-relaxed">
              Solusi paket mesin kasir All-in-One siap pakai untuk ritel dan UMKM di seluruh Indonesia. Transaksi cepat, pencatatan rapi, dan otomatis memisahkan kas modal & profit toko.
            </p>
          </div>

          {/* Navigasi */}
          <div>
            <h4 className="font-bold text-[#000000] text-xs uppercase tracking-wider mb-3">Navigasi</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#hardware" className="hover:text-[#000000] transition-colors">Paket Hardware</a></li>
              <li><a href="#fitur" className="hover:text-[#000000] transition-colors">Fitur Software</a></li>
              <li><a href="#keunggulan" className="hover:text-[#000000] transition-colors">Kas Modal & Profit</a></li>
              <li><a href="#faq" className="hover:text-[#000000] transition-colors">Pertanyaan Umum</a></li>
            </ul>
          </div>

          {/* Kontak & Dukungan */}
          <div>
            <h4 className="font-bold text-[#000000] text-xs uppercase tracking-wider mb-3">Pemesanan & Support</h4>
            <p className="text-xs text-[#525252] mb-3">
              Layanan konsultasi penjualan & bantuan teknis online via WhatsApp.
            </p>
            <a
              href={getWaUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FFF0EB] text-[#E0511F] font-semibold text-xs hover:bg-[#FFE4DB] transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Chat Tim Sales</span>
            </a>
          </div>
        </div>

        <div className="pt-8 border-t border-[#E7E7EE] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} Super POS. All rights reserved.</p>
          <p className="text-[#525252]">Paket Mesin Kasir Lengkap Hardware + Software Siap Pakai.</p>
        </div>
      </div>
    </footer>
  );
};
```

Buat `/home/raygbrn/project/react/praktis-pos-landing-page/src/components/FloatingWhatsApp.tsx`:
```tsx
import React from 'react';
import { MessageCircle } from 'lucide-react';
import { PACKAGE_DATA, WHATSAPP_NUMBER } from '../data/package-data';

export const FloatingWhatsApp: React.FC = () => {
  const getWaUrl = () => {
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(PACKAGE_DATA.waTemplate)}`;
  };

  return (
    <aside aria-label="WhatsApp Support" className="fixed bottom-6 right-6 z-50">
      <a
        href={getWaUrl()}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Konsultasi via WhatsApp"
        className="flex items-center gap-2 px-4 py-3 rounded-full bg-[#E0511F] text-[#FFFFFF] shadow-lg hover:shadow-xl hover:bg-[#C94213] hover:scale-105 transition-all group"
      >
        <MessageCircle className="w-5 h-5 fill-current" />
        <span className="hidden sm:inline text-xs font-bold">Chat WhatsApp</span>
        <span className="w-2.5 h-2.5 rounded-full bg-[#FFFFFF] animate-ping" />
      </a>
    </aside>
  );
};
```

- [ ] **Step 5: Rakit seluruh komponen di src/App.tsx**

Perbarui `/home/raygbrn/project/react/praktis-pos-landing-page/src/App.tsx`:
```tsx
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { SocialProof } from './components/SocialProof';
import { HardwareShowcase } from './components/HardwareShowcase';
import { FeatureGrid } from './components/FeatureGrid';
import { DemoBanner } from './components/DemoBanner';
import { Faq } from './components/Faq';
import { CtaBanner } from './components/CtaBanner';
import { Footer } from './components/Footer';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';

export default function App() {
  return (
    <div className="min-h-screen bg-[#FDFDFD] text-[#000000] selection:bg-[#FFF0EB] selection:text-[#E0511F]">
      <Navbar />
      <main>
        <Hero />
        <SocialProof />
        <HardwareShowcase />
        <FeatureGrid />
        <DemoBanner />
        <Faq />
        <CtaBanner />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
```

- [ ] **Step 6: Verifikasi build dan commit**

Jalankan:
```bash
cd /home/raygbrn/project/react/praktis-pos-landing-page && npm run build
```
Expected: Build sukses tanpa error TypeScript ataupun bundle issue.

Commit Task 5:
```bash
cd /home/raygbrn/project/react/praktis-pos-landing-page && git add src/components src/App.tsx && git commit -m "feat: complete DemoBanner, Faq, CtaBanner, Footer, and FloatingWhatsApp"
```

---

### Task 6: Audit Warna 60-30-10, Verifikasi Responsivitas, & Uji Coba

**Files:**
- Test/Audit: `/home/raygbrn/project/react/praktis-pos-landing-page/src/**/*`

**Interfaces:**
- Consumes: Proyek landing page lengkap
- Produces: Laporan verifikasi visual, audit kepatuhan warna 60-30-10, dan script preview.

- [ ] **Step 1: Jalankan audit palet warna**

Verifikasi bahwa semua kelas warna di seluruh file `src/` mematuhi palet warna ketat yang ditentukan dalam spesifikasi:
- Primary Accent: `#E0511F`
- Soft Accent: `#FFF0EB`
- Background Utama: `#FDFDFD` & `#FFFFFF`
- Teks Utama: `#000000`
- Teks Muted: `#525252`
- Border: `#E7E7EE`
- Secondary Button: `#EDF0F4` / `#080808`

Jalankan perintah grep untuk memastikan tidak ada warna liar di luar palet resmi:
```bash
cd /home/raygbrn/project/react/praktis-pos-landing-page && grep -rn "text-\[#" src/ || true
cd /home/raygbrn/project/react/praktis-pos-landing-page && grep -rn "bg-\[#" src/ || true
```

- [ ] **Step 2: Jalankan full production build test**

```bash
cd /home/raygbrn/project/react/praktis-pos-landing-page && npm run build
```
Expected:
`dist/index.html` dan assets javascript/css terbuat dengan rapi dan ukuran kecil (<100kb gzipped).

- [ ] **Step 3: Commit akhir**

```bash
cd /home/raygbrn/project/react/praktis-pos-landing-page && git status
```
Jika ada perubahan minor, commit dengan pesan:
```bash
git commit -am "chore: finalize landing page build and color system audit"
```
