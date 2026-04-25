<?php

namespace Database\Seeders;

use App\Models\PaymentMethod;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PaymentMethodSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        PaymentMethod::insert([
            [
                "name" => "Cash",
                "desc" => "Pembayaran dengan uang tunai",
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                "name" => "Qris",
                "desc" => "Pembayaran dengan QRIS",
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);
    }
}
