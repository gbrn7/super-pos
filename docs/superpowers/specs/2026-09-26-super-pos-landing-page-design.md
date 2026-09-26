# Spesifikasi Desain: Landing Page Penjualan Paket All-in-One Super POS

**Tanggal**: 2026-09-26  
**Status**: Disetujui (Approved)  
**Target Workspace**: `/home/raygbrn/project/react/praktis-pos-landing-page`  

---

## 1. Latar Belakang & Tujuan

Aplikasi kasir **Super POS (Praktis POS)** memiliki keunggulan kompetitif yang sangat kuat dibandingkan kasir konvensional, khususnya fitur **Pemisah Kas Modal & Kas Profit (Dual Wallet)**, **Kalkulator HPP Otomatis**, **Cetak Struk Thermal Monospace Ala Minimarket**, dan **Generator Barcode Mandiri**.

Untuk mengomersialkan sistem ini secara maksimal kepada pemilik toko, UMKM, ritel, dan minimarket di Indonesia, dibuatlah sebuah **Landing Page Penjualan Profesional**. Landing page ini berfokus pada **Paket Jasa Lengkap (Hardware + Software Siap Pakai / All-in-One Turnkey Solution)** tanpa biaya langganan bulanan (*Lifetime License*).

### Tujuan Utama:
1. Menghilangkan keraguan teknis calon pembeli dengan pesan: *"Buka Dus, Colok, Langsung Siap Jualan"* (hardware sudah disetting dan terintegrasi sebelum dikirim).
2. Menghasilkan konversi langsung via **Tombol Konsultasi & Pemesanan WhatsApp**.
3. Menyediakan tombol **Akses Demo Langsung** agar calon pembeli dapat langsung merasakan kecepatan dan kenyamanan antarmuka kasir.

---

## 2. Aturan Desain & Color System (Ketat)

Landing page menerapkan aturan komposisi **60-30-10** secara disiplin agar tampilan terlihat bersih, berkelas, tidak melelahkan mata, dan memiliki titik fokus yang tajam.

### 2.1 Palet Warna Resmi
* **Primary Accent**: `#E0511F` (Vivid Warm Orange)  
  *Digunakan untuk tombol CTA utama, highlight teks penting, active states pada tab/navigasi, dan ikon utama.*
* **Primary Foreground**: `#FFFFFF` (White)  
  *Warna teks di atas background primary accent.*
* **Soft Accent / Tint**: `#FFF0EB` (Light Peach)  
  *Digunakan untuk background badge/pill ("✨ Paket Siap Pakai", "Promo"), hover effect kartu, atau container ikon.*
* **Background Utama**: `#FDFDFD` (Clean Off-White)  
  *Background body dan keseluruhan section.*
* **Foreground / Teks Utama**: `#000000` (Deep Black)  
  *Judul (H1, H2, H3) dan teks yang membutuhkan kontras tinggi.*
* **Muted Text**: `#525252` (Neutral Gray)  
  *Subtitle, deskripsi paragraf, dan footer links.*
* **Card Background**: `#FFFFFF` dengan border tipis `#E7E7EE`.
* **Secondary Button**: Background `#EDF0F4` dengan teks `#080808`.

### 2.2 Aturan Komposisi (60-30-10 Rule)
* **60% Dominan**: Background bersih (`#FDFDFD` dan `#FFFFFF`).
* **30% Struktural**: Teks gelap (`#000000`), garis border kartu (`#E7E7EE`), dan elemen sekunder (`#EDF0F4`).
* **10% Aksen**: Orange (`#E0511F` & `#FFF0EB`) hanya untuk titik fokus (CTA utama, badge, ikon aktif). Tidak membuat halaman terlalu oranye secara berlebihan.

---

## 3. Arsitektur Teknis & Struktur Direktori

Landing page dibangun sebagai aplikasi web React mandiri dengan performa instan:
* **Framework**: React 19 + Vite (bundler modern super cepat).
* **Language**: TypeScript (strong typing untuk data produk, spesifikasi paket, dan FAQ).
* **Styling**: Tailwind CSS (mobile-first responsive, utility-first).
* **Icons**: `lucide-react`.

### Struktur File di `praktis-pos-landing-page/`:
```text
praktis-pos-landing-page/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── src/
│   ├── assets/               # Ilustrasi mockup hardware & software UI
│   ├── data/
│   │   ├── package-data.ts   # Rincian hardware All-in-One, bonus, garansi
│   │   ├── features.ts       # 4 pilar fitur unggulan software
│   │   └── faqs.ts           # Pertanyaan & jawaban umum calon pembeli
│   ├── components/
│   │   ├── Navbar.tsx        # Header & navigasi + tombol demo/pesan
│   │   ├── Hero.tsx          # Pill badge, headline tebal, 2 CTA, mockup preview
│   │   ├── SocialProof.tsx   # 4 metrik toko & badge kompatibilitas industri
│   │   ├── HardwareShowcase.tsx # Showcase visual 5 perangkat dalam paket All-in-One
│   │   ├── FeatureGrid.tsx   # 4 kartu fitur unggulan (Kasir, Dual Wallet, Barcode, HPP)
│   │   ├── DemoBanner.tsx    # Banner interaktif ajakan uji coba demo
│   │   ├── Faq.tsx           # Akordion pertanyaan umum
│   │   ├── CtaBanner.tsx     # Final call-to-action banner sebelum footer
│   │   ├── Footer.tsx        # Footer, hak cipta, navigasi bawah
│   │   └── FloatingWhatsApp.tsx # Tombol WhatsApp mengambang di kanan bawah
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
```

---

## 4. Spesifikasi Komponen & Konten Halaman

### 4.1 Navbar
* **Logo**: Teks tebal "Super POS" (`#000000`) dengan ikon kasir beraksen `#E0511F`.
* **Menu Navigasi**: *Fitur Software*, *Paket Hardware*, *Keunggulan Finansial*, *FAQ*.
* **Aksi Cepat**:
  * Tombol Sekunder: `"Coba Live Demo"` (`#EDF0F4`, teks `#080808`).
  * Tombol Primer: `"Pesan Paket"` (`#E0511F`, teks `#FFFFFF`).

### 4.2 Hero Section
* **Pill Badge**: Latar `#FFF0EB`, teks `#E0511F`, icon bintang/percikan: `"✨ Paket Lengkap Hardware + Software Siap Pakai"`.
* **Headline**: `"Solusi Mesin Kasir Lengkap: Buka Dus, Colok, Langsung Siap Jualan."`
* **Subtitle**: `"Kelola transaksi kasir secepat kilat, pantau stok akurat, dan otomatis pisahkan uang modal vs laba bersih toko Anda. Tanpa beban biaya langganan bulanan seumur hidup."`
* **CTA Buttons**:
  1. Primary Button: `"Konsultasi & Pesan via WhatsApp"` (Background `#E0511F`, teks putih, icon WhatsApp).
  2. Secondary Button: `"Eksplorasi Live Demo Software"` (Background `#EDF0F4`, teks `#080808`, icon monitor).
* **Mockup Dashboard Preview**:
  * Desain kartu bersih (`#FFFFFF` + border `#E7E7EE`) yang menampilkan visual antarmuka kasir: grafik omzet harian, status *Dompet Modal* (inflow/outflow), status *Dompet Profit* (laba bersih siap cair), dan ringkasan transaksi kasir.

### 4.3 Social Proof & Statistik Toko
* Bar metrik horizontal:
  1. **Rp 0 Biaya Bulanan** — *Sekali beli, bebas biaya sewa atau perpanjangan selamanya.*
  2. **100% Siap Pakai** — *Hardware, kabel, printer, & database sudah terkonfigurasi.*
  3. **2 Dompet Terpisah** — *Satu-satunya sistem yang otomatis memisahkan uang kulakan & laba bersih.*
  4. **1 Tahun Garansi** — *Garansi perangkat hardware dan panduan teknis online.*
* Badge Target Pengguna: *Minimarket & Kelontong*, *Toko Fashion & Butik*, *ATK & Bahan Bangunan*, *Kafe & F&B Retail*.

### 4.4 Hardware Showcase ("What's In The Box")
* Menyajikan 1 paket komplit All-in-One:
  1. **Terminal Layar Kasir / Tablet Touchscreen**: Dudukan stand logam kokoh, layar jernih, hemat daya.
  2. **Printer Thermal Struk 58mm/80mm**: Kecepatan cetak tinggi, tanpa tinta, format struk retro minimarket.
  3. **Barcode Scanner Laser Responsif**: Scan cepat barcode 1D/2D pada kemasan produk.
  4. **Laci Kasir Otomatis (Cash Drawer RJ11)**: Bahan baja dengan 4 slot uang kertas + 5 slot koin, terbuka otomatis saat struk keluar.
  5. **Software Super POS Lifetime & Starter Kit**: Lisensi aktif seumur hidup, bonus 5 rol kertas thermal, dan panduan video.

### 4.5 Feature Grid (4 Pilar Fitur Software)
* Desain kartu kartu `#FFFFFF` bergaris `#E7E7EE` dengan ikon berlatar `#FFF0EB` dan ikon `#E0511F`:
  * **Pilar 1: Kasir Cepat & Struk Minimarket**: Mode ganda (Grid gambar / List kasir grosir), barcode scan instan, diskon per item & total, struk thermal monospace.
  * **Pilar 2: Dompet Modal & Kas Profit (Killer Feature)**: Pemisahan laba bersih dari modal toko otomatis pada setiap struk penjualan. Pemilik toko tahu pasti berapa laba yang aman ditarik tanpa mengganggu modal kulakan.
  * **Pilar 3: Manajemen Stok & Cetak Barcode Mandiri**: Master katalog produk, alert stok menipis, import-export Excel, dan cetak stiker barcode produk langsung dari sistem.
  * **Pilar 4: Kalkulator HPP & Laporan Laba Rugi**: Menghitung HPP dan margin harga jual akurat sebelum produk dirilis, dilengkapi grafik omzet dan profit harian/bulanan.

### 4.6 Demo Banner (Ajakan Uji Coba)
* Section khusus berlatar putih dengan border lembut, mengajak calon pembeli menguji coba langsung sistem kasir di browser sebelum paket hardware dikirim.

### 4.7 FAQ (Pertanyaan yang Sering Diajukan)
* Akordion interaktif:
  1. *Apakah mesin kasir ini butuh koneksi internet setiap saat?*  
     Dapat beroperasi offline/jaringan lokal, serta dapat dihubungkan ke internet jika ingin dipantau dari luar toko.
  2. *Apakah benar-benar tanpa biaya langganan bulanan?*  
     Benar 100%. Paket ini adalah beli putus (hak milik seumur hidup) tanpa tagihan bulanan atau tahunan.
  3. *Bagaimana jika saya gaptek atau butuh bantuan saat pertama kali pakai?*  
     Semua perangkat sudah dihubungkan dan dites sebelum dikirim. Tim kami juga menyediakan panduan video dan dukungan konsultasi teknis jarak jauh.
  4. *Bagaimana ketentuan garansi hardware-nya?*  
     Semua komponen hardware dilindungi garansi 1 tahun untuk penggantian sparepart/unit sesuai ketentuan pabrik.

### 4.8 Final CTA Banner & Footer
* **CTA Banner**: Ajakan konsultasi gratis via WhatsApp sebelum kuota paket atau promo bonus habis.
* **Footer**: Identitas Super POS, ringkasan kontak WhatsApp, link navigasi cepat, dan hak cipta.
* **Floating WhatsApp Button**: Tombol fixed di sudut kanan bawah dengan icon WhatsApp dan badge pulsing, mengarahkan langsung ke URL WhatsApp dengan pre-filled text pemesanan.

---

## 5. Rencana Pengujian & Verifikasi

1. **Uji Build & Linting**:
   - Menjalankan `npm run build` dan `npx tsc` untuk memastikan tidak ada kesalahan TypeScript atau sintaks.
2. **Uji Ketepatan Palet Warna (Color Audit)**:
   - Memastikan tidak ada warna lain di luar palet yang ditentukan (`#E0511F`, `#FFFFFF`, `#FFF0EB`, `#FDFDFD`, `#000000`, `#525252`, `#E7E7EE`, `#EDF0F4`).
   - Memastikan rasio 60-30-10 terjaga (orange hanya 10% sebagai aksen).
3. **Uji Responsivitas**:
   - Mobile viewport (375px & 414px): Navigasi mobile, kartu tersusun rapi satu kolom, padding proporsional.
   - Tablet viewport (768px): Grid 2 kolom.
   - Desktop viewport (1024px & 1440px): Tampilan penuh, navbar sticky, perataan container teratur.
4. **Uji Interaksi**:
   - Akordion FAQ dapat dibuka-tutup dengan animasi mulus.
   - Tombol WhatsApp membuka link `https://wa.me/...` dengan teks pesan terisi otomatis (*prefilled*).
   - Tombol Live Demo membuka link demo kasir.
