<?php

namespace Database\Factories;

use App\Models\StoreSetting;
use Illuminate\Database\Eloquent\Factories\Factory;

class StoreSettingFactory extends Factory
{
    protected $model = StoreSetting::class;

    public function definition(): array
    {
        return [
            'name' => 'PRAKTIS POS Store',
            'address' => 'Jl. Jenderal Sudirman No. 123, Jakarta',
            'phone' => '021-5551234',
            'email' => 'store@example.com',
            'tax_number' => '12.345.678.9-012.000',
            'receipt_footer' => 'Barang yang sudah dibeli tidak dapat ditukar',
        ];
    }
}
