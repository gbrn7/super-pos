# Spesifikasi Desain: Fitur Kalkulator HPP (Harga Pokok Penjualan)

Spesifikasi ini menjelaskan perancangan dan implementasi fitur **Kalkulator HPP** berbasis client-side pada aplikasi POS. Halaman ini dirancang sebagai alat simulasi interaktif (pure simulator) untuk menghitung HPP produk secara dinamis berdasarkan komponen biaya yang diinput pengguna, serta memberikan saran harga jual berdasarkan target persentase margin keuntungan.

## 1. Arsitektur & Rute

Rute baru akan didaftarkan di Laravel dan dimuat melalui Inertia.js:
- **Rute Frontend**: `/hpp-calculator`
- **Nama Rute**: `hpp-calculator`
- **Proteksi**: Rute ini dibatasi hanya untuk pengguna yang telah terautentikasi (`auth` middleware).

### Rute Laravel (`routes/web.php`)
```php
Route::middleware(['auth', 'verified'])->group(function () {
    // ... rute lainnya
    Route::inertia('hpp-calculator', 'hpp-calculator/index')->name('hpp-calculator');
});
```

### Menu Navigasi (`resources/js/components/app-sidebar.tsx`)
Item menu baru ditambahkan ke kelompok **Keuangan** (Finance Group):
```typescript
{
    title: t('component.sidebar.hpp_calculator_menu_label', 'Kalkulator HPP'),
    href: '/hpp-calculator', // Rute URL kalkulator HPP
    icon: Calculator,
    role: [],
}
```

---

## 2. Antarmuka Pengguna (UI Layout)

Halaman ini menggunakan `AppLayout` dengan tata letak berdampingan (**Split View** / Dua Kolom):

### Kolom Kiri: Input Komponen Biaya (Dynamic Form)
- **Input Nama Produk**: Input teks opsional untuk memberi identitas pada simulasi.
- **Tabel Dinamis Biaya**:
  - Kolom **Nama Biaya** (Teks, misal: "Bahan Baku Utama", "Kemasan", "Ongkir").
  - Kolom **Nominal (Rp)** (Angka positif).
  - Tombol **Hapus** (Ikon Trash) di setiap baris.
- **Tombol Tambah Baris**: Menambahkan baris kosong baru di bawah baris terakhir.

### Kolom Kanan: Ringkasan & Saran Harga Jual (Sticky Card)
- **Target Margin (%)**: Input angka untuk menentukan target margin keuntungan (maksimal 99%, default 20%).
- **Tampilan Hasil Real-Time**:
  - **Total HPP**: Penjumlahan seluruh nominal biaya dari kolom kiri.
  - **Saran Harga Jual**: Harga jual ideal berdasarkan HPP dan target margin.
  - **Estimasi Profit (Rp)**: Selisih antara saran harga jual dengan total HPP.
- **Tombol Reset**: Mengembalikan semua data ke kondisi awal (1 baris kosong, margin 20%).

---

## 3. Logika Perhitungan & State Management

Seluruh perhitungan dilakukan di sisi client menggunakan state React untuk performa yang responsif tanpa delay jaringan.

### State Komponen
```typescript
interface CostItem {
  id: string;
  name: string;
  amount: number;
}

const [productName, setProductName] = useState<string>('');
const [costs, setCosts] = useState<CostItem[]>([
  { id: '1', name: '', amount: 0 }
]);
const [margin, setMargin] = useState<number>(20);
```

### Rumus Perhitungan (`useMemo`)
1. **Total HPP**:
   $$\text{Total HPP} = \sum_{i=1}^{n} \text{costs}[i].\text{amount}$$
2. **Saran Harga Jual**:
   $$\text{Harga Jual} = \frac{\text{Total HPP}}{1 - \frac{\text{margin}}{100}}$$
   *Catatan: Nilai margin dibatasi maksimal 99% untuk mencegah pembagian dengan nol.*
3. **Estimasi Profit**:
   $$\text{Profit} = \text{Harga Jual} - \text{Total HPP}$$

---

## 4. Penanganan Kasus Khusus (Edge Cases)

- **Nilai Kosong / Negatif**: Jika input nominal kosong atau kurang dari nol, sistem otomatis memperlakukannya sebagai `0`.
- **Margin di Atas 99%**: Jika pengguna memasukkan nilai margin $\ge 100\%$, input akan otomatis diset ke `99%` untuk mencegah pembagian dengan nol yang menghasilkan nilai tak terhingga (infinity).
- **Format Rupiah**: Semua tampilan nominal uang diformat menggunakan fungsi pemformat lokal Indonesia (`Rp xx.xxx`).

---

## 5. Rencana Pengujian (Testing Plan)

Untuk memverifikasi fungsionalitas, kita akan membuat Pest Feature Test di `tests/Feature/HppCalculatorTest.php`:
1. Memastikan pengguna yang belum masuk (tamu) diarahkan ke halaman login saat mengakses `/hpp-calculator`.
2. Memastikan pengguna yang telah terautentikasi dapat membuka halaman `/hpp-calculator` dengan status 200 OK.
