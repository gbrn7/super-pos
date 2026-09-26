# Spesifikasi Desain: Migrasi Landing Page Praktis POS ke Next.js App Router

**Tanggal**: 2026-09-26  
**Status**: Disetujui (Approved)  
**Target Workspace**: `/home/raygbrn/project/react/praktis-pos-landing-page`  

---

## 1. Latar Belakang & Tujuan Migrasi

Landing page penjualan paket mesin kasir **Praktis POS** sebelumnya dibangun menggunakan Vite React SPA. Untuk mengoptimalkan visibilitas di mesin pencari (SEO Google), memberikan preview tautan saat dibagikan ke WhatsApp/Facebook (OpenGraph Social Cards), serta memanfaatkan optimasi performa modern (Server Components, `next/image`, dan `next/font/local`), seluruh project dimigrasikan ke **Next.js App Router**.

### Tujuan Utama:
1. **SEO & Social Sharing Optimal**: Mesin pencari dan crawler WhatsApp langsung membaca konten, judul, deskripsi, dan thumbnail gambar logo tanpa bergantung pada client-side JavaScript rendering.
2. **Zero Layout Shift (CLS 0)**: Memanfaatkan `next/font/local` untuk memuat font *Plus Jakarta Sans* langsung dari file `.ttf` lokal.
3. **Pemisahan Server & Client Components**: Konten statis dirender di server untuk kecepatan muat instan, sedangkan interaktivitas (menu mobile, accordion FAQ) menggunakan `'use client'`.
4. **Pertahankan 100% Desain & Color System**: Menjaga secara ketat palet warna resmi (`#E0511F`, `#FFF0EB`, `#FDFDFD`, `#000000`, `#525252`, `#E7E7EE`, `#EDF0F4`) dan aturan komposisi 60-30-10.

---

## 2. Arsitektur Teknis Next.js App Router

### 2.1 Dependencies
* `next` (v15 / v14)
* `react` & `react-dom`
* `lucide-react` (SVG icons)
* `tailwindcss`, `postcss`, `autoprefixer`
* TypeScript

### 2.2 Struktur File Baru
```text
praktis-pos-landing-page/
├── public/
│   ├── favicon.png
│   └── og-image.png (atau logo sharing)
├── next.config.mjs
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout: metadata SEO, Plus Jakarta Sans font
│   │   ├── page.tsx           # Halaman landing page utama
│   │   └── globals.css        # Tailwind directives & global styling
│   ├── assets/
│   │   ├── font/              # Plus_Jakarta_Sans TTF files
│   │   └── img/               # Logo.png, Logo-with-text-white-bg.png
│   ├── components/
│   │   ├── Navbar.tsx         # 'use client' (mobile menu toggle, next/image)
│   │   ├── Hero.tsx           # Server component (headline, CTA, value highlights)
│   │   ├── MockupPreview.tsx  # Server/Client component (live feed & metrics)
│   │   ├── SocialProof.tsx    # Server component (4 metrik & badge industri)
│   │   ├── HardwareShowcase.tsx # Server component (5 unboxing hardware cards)
│   │   ├── FeatureGrid.tsx    # Server component (4 pilar fitur kasir & keuangan)
│   │   ├── DemoBanner.tsx     # Server component (ajakan live demo)
│   │   ├── Faq.tsx            # 'use client' (accordion open/close toggle)
│   │   ├── CtaBanner.tsx      # Server component (closing WhatsApp CTA)
│   │   ├── Footer.tsx         # Server component (navigasi & copyright Praktis POS)
│   │   └── FloatingWhatsApp.tsx # 'use client' (fixed bottom right)
│   ├── data/
│   │   ├── package-data.ts    # Spek hardware, bonus, nomor WA
│   │   ├── features.ts        # 4 pilar fitur software
│   │   └── faqs.ts            # Daftar tanya-jawab
│   └── types/
│       └── index.ts           # Type definitions
```

### 2.3 Pembersihan File Vite
File-file peninggalan Vite yang tidak lagi digunakan akan dihapus:
* `index.html` (digantikan oleh `src/app/layout.tsx`)
* `vite.config.ts` (digantikan oleh `next.config.mjs`)
* `src/main.tsx` (tidak diperlukan dalam Next.js)
* `src/App.tsx` (digantikan oleh `src/app/page.tsx`)
* `src/index.css` (dipindahkan ke `src/app/globals.css`)
* `src/vite-env.d.ts` (Next.js mengelola `next-env.d.ts` otomatis)

---

## 3. Detail Komponen & Fitur Next.js

### 3.1 Metadata SEO (`src/app/layout.tsx`)
```typescript
export const metadata: Metadata = {
  title: 'Praktis POS - Paket Mesin Kasir Lengkap Hardware & Software Siap Pakai',
  description: 'Solusi mesin kasir lengkap siap pakai untuk UMKM & ritel di Indonesia. Tanpa biaya langganan bulanan seumur hidup, otomatis pisahkan kas modal dan profit.',
  keywords: ['mesin kasir siap pakai', 'paket kasir umkm', 'software kasir seumur hidup', 'aplikasi pos ritel', 'praktis pos'],
  openGraph: {
    title: 'Praktis POS - Mesin Kasir Lengkap Siap Pakai',
    description: 'Buka dus, colok kabel, langsung siap jualan. Tanpa biaya bulanan!',
    url: 'https://praktispos.com',
    siteName: 'Praktis POS',
    locale: 'id_ID',
    type: 'website',
  },
  icons: {
    icon: '/favicon.png',
  },
};
```

### 3.2 Tipografi (`next/font/local`)
Menggunakan font `Plus_Jakarta_Sans` melalui:
```typescript
import localFont from 'next/font/local';

const plusJakartaSans = localFont({
  src: [
    {
      path: '../assets/font/Plus_Jakarta_Sans/PlusJakartaSans-VariableFont_wght.ttf',
      style: 'normal',
    },
    {
      path: '../assets/font/Plus_Jakarta_Sans/PlusJakartaSans-Italic-VariableFont_wght.ttf',
      style: 'italic',
    },
  ],
  variable: '--font-plus-jakarta-sans',
  display: 'swap',
});
```

### 3.3 Optimasi Gambar (`next/image`)
Di `Navbar.tsx` dan `Footer.tsx`:
```tsx
import Image from 'next/image';
import logoWithText from '@/assets/img/Logo-with-text-white-bg.png';

<Image
  src={logoWithText}
  alt="Praktis POS"
  height={40}
  width={160}
  className="h-9 sm:h-11 w-auto object-contain"
  priority
/>
```

---

## 4. Rencana Pengujian & Verifikasi

1. **Uji Build**: `npm run build` (`next build`) berhasil menghasilkan route statis/SSR tanpa error TypeScript.
2. **Uji Render Server**: `npm run dev` dapat dijalankan di port 3000 (atau port kosong lainnya) dan seluruh section tampil dengan sempurna.
3. **Uji Metadata**: Tag `<title>`, meta deskripsi, dan favicon muncul dengan benar di inspeksi HTML.
4. **Uji Interaksi**: Menu mobile, accordion FAQ, dan tombol WhatsApp berfungsi normal.
