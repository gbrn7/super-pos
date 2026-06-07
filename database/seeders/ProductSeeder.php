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
                'is_active' => 1,
                'name' => 'Beras Rojo Lele',
                'stock' => 100,
                'sku' => Str::of('Beras Rojo Lele')
                    ->headline()
                    ->replaceMatches('/[^A-Z]/', '').'-'.strtoupper(Str::random(8)),
                'price' => 10000,
                'cost_price' => 7000,
                'created_at' => now()->unix(),
                'updated_at' => now()->unix(),
            ],
        ]);
    }
}
