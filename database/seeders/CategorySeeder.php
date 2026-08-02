<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Sembako',
                'desc' => 'Beras, minyak goreng, gula, tepung, dan bahan pokok harian.',
            ],
            [
                'name' => 'Minuman',
                'desc' => 'Air mineral, kopi, teh, sirup, dan minuman kemasan.',
            ],
            [
                'name' => 'Makanan Ringan & Snack',
                'desc' => 'Biskuit, keripik, kue kering, dan camilan harian.',
            ],
            [
                'name' => 'Mie & Makanan Instan',
                'desc' => 'Mie instan, bubur instan, sarden, dan makanan kaleng.',
            ],
            [
                'name' => 'Bumbu & Bahan Dapur',
                'desc' => 'Garam, penyedap rasa, kecap, saus, dan bumbu racik.',
            ],
            [
                'name' => 'Perlengkapan Mandi & Cuci',
                'desc' => 'Sabun, shampoo, pasta gigi, detergen, dan pembersih pakaian.',
            ],
            [
                'name' => 'Kebutuhan Rumah Tangga',
                'desc' => 'Tisu, pembersih lantai, obat nyamuk, dan kantong plastik.',
            ],
            [
                'name' => 'Obat-Obatan & P3K',
                'desc' => 'Obat bebas, minyak kayu putih, plester, dan vitamin.',
            ],
            [
                'name' => 'Gas & Galon',
                'desc' => 'Gas LPG 3kg/12kg dan air galon.',
            ],
            [
                'name' => 'Rokok & Tembakau',
                'desc' => 'Berbagai merk rokok dan perlengkapannya.',
            ],
            [
                'name' => 'Alat Tulis & Kantor (ATK)',
                'desc' => 'Buku tulis, pulpen, pensil, dan kebutuhan sekolah/kantor sederhana.',
            ],
        ];

        foreach ($categories as $category) {
            Category::updateOrCreate(
                ['name' => $category['name']],
                ['desc' => $category['desc']]
            );
        }
    }
}
