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
                'phone' => '021-5551234',
                'email' => 'info@praktispos.com',
                'tax_number' => '12.345.678.9-012.000',
                'receipt_footer' => 'Barang yang sudah dibeli tidak dapat ditukar',
            ]
        );
    }
}
