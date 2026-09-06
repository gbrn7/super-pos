<?php

namespace Database\Seeders;

use App\Models\StoreSetting;
use Illuminate\Database\Seeder;

class StoreSettingSeeder extends Seeder
{
    public function run(): void
    {
        StoreSetting::firstOrCreate(
            ['id' => 1],
            [
                'name' => 'PRAKTIS POS',
                'address' => 'Jl. Jenderal Sudirman No. 123, Jakarta',
                'receipt_footer' => 'Barang yang sudah dibeli tidak dapat ditukar',
            ]
        );
    }
}
