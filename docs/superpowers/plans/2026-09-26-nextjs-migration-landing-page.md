# Next.js App Router Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Memigrasikan proyek landing page Praktis POS dari Vite React SPA ke Next.js 15/14 App Router untuk optimalisasi SEO, social sharing OpenGraph, local font loading, dan optimasi gambar.

**Architecture:** Menggunakan arsitektur Next.js App Router (`src/app/layout.tsx` dan `src/app/page.tsx`). Memisahkan komponen statis (Server Components) dengan komponen interaktif (`'use client'`). Menggunakan `next/font/local` untuk font Plus Jakarta Sans dan `next/image` untuk logo brand.

**Tech Stack:** Next.js (App Router), React 19, TypeScript, Tailwind CSS, Lucide React (`lucide-react`).

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
- **Komposisi 60-30-10**: 60% dominan background bersih (`#FDFDFD`/`#FFFFFF`), 30% struktural teks gelap & border (`#000000`/`#E7E7EE`), 10% aksen oranye (`#E0511F`/`#FFF0EB`) hanya untuk titik fokus (CTA, badge, ikon aktif).
- **Brand**: Selalu gunakan **Praktis POS**.

---

### Task 1: Scaffolding Dependencies & Konfigurasi Next.js

**Files:**
- Modify: `/home/raygbrn/project/react/praktis-pos-landing-page/package.json`
- Create: `/home/raygbrn/project/react/praktis-pos-landing-page/next.config.mjs`
- Modify: `/home/raygbrn/project/react/praktis-pos-landing-page/tsconfig.json`
- Modify: `/home/raygbrn/project/react/praktis-pos-landing-page/tailwind.config.js`
- Delete: `vite.config.ts`, `index.html`, `src/vite-env.d.ts`, `src/main.tsx`, `src/App.tsx`, `src/index.css`

- [ ] **Step 1: Update package.json dengan dependencies Next.js**

Perbarui `package.json`:
```json
{
  "name": "praktis-pos-landing-page",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "clsx": "^2.1.1",
    "lucide-react": "^1.16.0",
    "next": "^15.1.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "tailwind-merge": "^3.0.0"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.17",
    "typescript": "^5.7.0"
  }
}
```

Jalankan:
```bash
cd /home/raygbrn/project/react/praktis-pos-landing-page && npm install
```

- [ ] **Step 2: Buat next.config.mjs**

Buat file `next.config.mjs`:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

export default nextConfig;
```

- [ ] **Step 3: Update tsconfig.json dan tailwind.config.js untuk Next.js**

Perbarui `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

Perbarui `tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-plus-jakarta-sans)', 'system-ui', '-apple-system', 'sans-serif'],
      },
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

- [ ] **Step 4: Hapus file peninggalan Vite**

Hapus `vite.config.ts`, `index.html`, `src/vite-env.d.ts`, `src/main.tsx`, `src/App.tsx`, dan `src/index.css`.

- [ ] **Step 5: Commit perubahan konfigurasi**

```bash
cd /home/raygbrn/project/react/praktis-pos-landing-page && git add . && git commit -m "chore: migrate configuration from vite to next.js"
```

---

### Task 2: Root Layout, Tipografi Plus Jakarta Sans, & Global CSS

**Files:**
- Create: `/home/raygbrn/project/react/praktis-pos-landing-page/src/app/globals.css`
- Create: `/home/raygbrn/project/react/praktis-pos-landing-page/src/app/layout.tsx`

- [ ] **Step 1: Buat src/app/globals.css**

Buat file `src/app/globals.css`:
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

- [ ] **Step 2: Buat src/app/layout.tsx dengan local font & metadata SEO**

Buat file `src/app/layout.tsx`:
```tsx
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';

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

export const metadata: Metadata = {
  title: 'Praktis POS - Paket Mesin Kasir Lengkap Hardware & Software Siap Pakai',
  description: 'Solusi mesin kasir lengkap siap pakai untuk UMKM & ritel di Indonesia. Tanpa biaya langganan bulanan seumur hidup, otomatis pisahkan kas modal dan profit.',
  keywords: ['mesin kasir siap pakai', 'paket kasir umkm', 'software kasir seumur hidup', 'aplikasi pos ritel', 'praktis pos'],
  openGraph: {
    title: 'Praktis POS - Mesin Kasir Lengkap Siap Pakai',
    description: 'Buka dus, colok kabel, langsung siap jualan. Tanpa biaya langganan bulanan seumur hidup!',
    url: 'https://praktispos.com',
    siteName: 'Praktis POS',
    locale: 'id_ID',
    type: 'website',
  },
  icons: {
    icon: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="scroll-smooth">
      <body className={`${plusJakartaSans.variable} font-sans antialiased selection:bg-[#FFF0EB] selection:text-[#E0511F]`}>
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Commit Task 2**

```bash
cd /home/raygbrn/project/react/praktis-pos-landing-page && git add src/app/globals.css src/app/layout.tsx && git commit -m "feat: implement RootLayout with local font and SEO metadata"
```

---

### Task 3: Adaptasi Komponen ke Next.js (`'use client'` & `next/image`)

**Files:**
- Modify: `src/components/Navbar.tsx` (add `'use client'`, use `next/image`)
- Modify: `src/components/Faq.tsx` (add `'use client'`)
- Modify: `src/components/FloatingWhatsApp.tsx` (add `'use client'`)
- Modify: `src/components/MockupPreview.tsx` (use `next/image`)
- Modify: `src/components/Footer.tsx` (use `next/image`)

- [ ] **Step 1: Update src/components/Navbar.tsx**
Tambahkan directive `'use client';` di baris pertama dan gunakan `next/image` untuk logo `Logo-with-text-white-bg.png`.

- [ ] **Step 2: Update src/components/Faq.tsx**
Tambahkan directive `'use client';` di baris pertama agar state `openId` berjalan normal di Next.js.

- [ ] **Step 3: Update src/components/FloatingWhatsApp.tsx**
Tambahkan directive `'use client';` di baris pertama.

- [ ] **Step 4: Update src/components/MockupPreview.tsx dan src/components/Footer.tsx**
Gunakan `next/image` untuk render logo icon dan logo text.

- [ ] **Step 5: Commit Task 3**

```bash
cd /home/raygbrn/project/react/praktis-pos-landing-page && git add src/components && git commit -m "feat: adapt interactive components with 'use client' and next/image"
```

---

### Task 4: Halaman Utama (Root Page), Build, & Verifikasi

**Files:**
- Create: `/home/raygbrn/project/react/praktis-pos-landing-page/src/app/page.tsx`

- [ ] **Step 1: Buat src/app/page.tsx**

Buat file `src/app/page.tsx`:
```tsx
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { SocialProof } from '@/components/SocialProof';
import { HardwareShowcase } from '@/components/HardwareShowcase';
import { FeatureGrid } from '@/components/FeatureGrid';
import { DemoBanner } from '@/components/DemoBanner';
import { Faq } from '@/components/Faq';
import { CtaBanner } from '@/components/CtaBanner';
import { Footer } from '@/components/Footer';
import { FloatingWhatsApp } from '@/components/FloatingWhatsApp';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FDFDFD] text-[#000000]">
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

- [ ] **Step 2: Jalankan full production build Next.js**

```bash
cd /home/raygbrn/project/react/praktis-pos-landing-page && npm run build
```
Expected: `next build` berhasil men-generate route `/` (Static/SSG), mengompilasi font local, dan tanpa error.

- [ ] **Step 3: Commit akhir migrasi Next.js**

```bash
cd /home/raygbrn/project/react/praktis-pos-landing-page && git add . && git commit -m "feat: complete Next.js App Router migration"
```
