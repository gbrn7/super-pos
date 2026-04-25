<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Product::insert([
            [
                "category_id" => 1,
                "unit_id" => 1,
                "is_active" => 1,
                "name" => "Beras",
                "stock" => 100,
                "price" => 10000,
                "cost_price" => 7000,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
