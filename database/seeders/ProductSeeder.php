<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Product::insert([
            [
                'category_id' => 1,
                'unit_id' => 1,
                'name' => 'Gulaku 1KG',
                'stock' => 0,
                'sku' => Str::of('Gulaku 1KG')
                    ->headline()
                    ->replaceMatches('/[^A-Z]/', '') . '-' . strtoupper(Str::random(8)),
                'price' => 17000,
                'cost_price' => 12000,
                'is_active' => false,
                'image' => 'product/test.jpg',
                'is_unlimited' => true,
                'desc' => "Test Desc",
                'created_at' => now()->unix(),
                'updated_at' => now()->unix(),
            ],
            [
                'category_id' => 1,
                'unit_id' => 2,
                'name' => 'Minyak Kita',
                'stock' => 12,
                'sku' => Str::of('Minyak Kita')
                    ->headline()
                    ->replaceMatches('/[^A-Z]/', '') . '-' . strtoupper(Str::random(8)),
                'price' => 14000,
                'image' => 'product/test2.jpg',
                'cost_price' => 11000,
                'is_active' => false,
                'is_unlimited' => false,
                'desc' => "Test Desc",
                'created_at' => now()->unix(),
                'updated_at' => now()->unix(),
            ],
            [
                'category_id' => 1,
                'unit_id' => 1,
                'name' => 'Beras Rojo Lele',
                'stock' => 20,
                'image' => 'product/test4.jpg',
                'sku' => Str::of('Beras Rojo Lele')
                    ->headline()
                    ->replaceMatches('/[^A-Z]/', '') . '-' . strtoupper(Str::random(8)),
                'price' => 10000,
                'cost_price' => 7000,
                'is_active' => true,
                'is_unlimited' => false,
                'desc' => "Test Desc",
                'created_at' => now()->unix(),
                'updated_at' => now()->unix(),
            ],
            [
                'category_id' => 2,
                'unit_id' => 2,
                'name' => 'Teh Pucuk Harum 1 Liter',
                'stock' => 6,
                'sku' => Str::of('Teh Pucuk Harum 1 Liter')
                    ->headline()
                    ->replaceMatches('/[^A-Z]/', '') . '-' . strtoupper(Str::random(8)),
                'price' => 9000,
                'image' => 'product/test4.jpg',
                'cost_price' => 7000,
                'is_active' => true,
                'is_unlimited' => false,
                'desc' => "Test Desc",
                'created_at' => now()->unix(),
                'updated_at' => now()->unix(),
            ],
        ]);
    }
}
