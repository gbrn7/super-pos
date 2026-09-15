<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\MasterProduct;
use App\Models\Product;
use App\Models\Unit;
use App\Support\Utils\BarcodeGenerator;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductFromMasterProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // In-memory cache for category and unit name -> id mappings
        $categoryCache = Category::pluck('id', 'name')->toArray();
        $unitCache = Unit::pluck('id', 'name')->toArray();

        // Track barcodes seen to avoid duplicate barcode errors
        $existingBarcodes = Product::whereNotNull('barcode')->pluck('barcode')->flip()->toArray();

        MasterProduct::query()
            ->orderBy('id')
            ->chunkById(250, function ($masterProducts) use (&$categoryCache, &$unitCache, &$existingBarcodes) {
                $productsToInsert = [];
                $now = now();

                foreach ($masterProducts as $master) {
                    $barcode = filled($master->barcode) ? trim((string) $master->barcode) : null;

                    // If master product has a barcode and it already exists, skip it
                    if ($barcode !== null && isset($existingBarcodes[$barcode])) {
                        continue;
                    }

                    // Generate a new barcode if null
                    if ($barcode === null) {
                        do {
                            $barcode = BarcodeGenerator::generate();
                        } while (isset($existingBarcodes[$barcode]));
                    }

                    $existingBarcodes[$barcode] = true;

                    // Resolve category
                    $catName = filled($master->category_name) ? trim((string) $master->category_name) : 'Umum';
                    if (! isset($categoryCache[$catName])) {
                        $category = Category::firstOrCreate(['name' => $catName]);
                        $categoryCache[$catName] = $category->id;
                    }
                    $categoryId = $categoryCache[$catName];

                    // Resolve unit
                    $unitName = filled($master->unit_name) ? trim((string) $master->unit_name) : 'Pcs';
                    if (! isset($unitCache[$unitName])) {
                        $unit = Unit::firstOrCreate(['name' => $unitName]);
                        $unitCache[$unitName] = $unit->id;
                    }
                    $unitId = $unitCache[$unitName];

                    // Generate SKU
                    $prefix = Str::of($master->name)
                        ->headline()
                        ->replaceMatches('/[^A-Z]/', '')
                        ->toString();

                    if (empty($prefix)) {
                        $prefix = 'PRD';
                    }

                    $sku = $prefix.'-'.strtoupper(Str::random(8));

                    // Resolve prices: ensure defaults in thousands and divisible by 500 when 0
                    $prices = $this->resolvePrices((float) $master->cost_price, (float) $master->price);

                    $productsToInsert[] = [
                        'category_id' => $categoryId,
                        'unit_id' => $unitId,
                        'name' => $master->name,
                        'sku' => $sku,
                        'barcode' => $barcode,
                        'is_active' => true,
                        'is_unlimited' => false,
                        'desc' => $master->desc,
                        'stock' => rand(10, 50),
                        'sold_quantity' => 0,
                        'image' => null,
                        'price' => $prices['price'],
                        'cost_price' => $prices['cost_price'],
                        'created_at' => $now,
                        'updated_at' => $now,
                    ];
                }

                if (! empty($productsToInsert)) {
                    Product::insertOrIgnore($productsToInsert);
                }
            });
    }

    /**
     * Resolve cost price and selling price.
     * When master price is 0, provide default thousands divisible by 500.
     *
     * @return array{cost_price: float, price: float}
     */
    private function resolvePrices(float $costPrice, float $price): array
    {
        if ($costPrice <= 0 && $price <= 0) {
            $costPrice = rand(4, 40) * 500; // 2.000 - 20.000
            $price = $costPrice + (rand(2, 10) * 500); // 1.000 - 5.000 di atas harga modal
        } elseif ($costPrice <= 0) {
            $estimatedCost = ((int) floor(($price * 0.8) / 500)) * 500;
            $costPrice = max(1000, min((int) $price, $estimatedCost));
            if ($costPrice % 500 !== 0) {
                $costPrice = ((int) round($costPrice / 500)) * 500;
            }
        } elseif ($price <= 0) {
            $price = max(1000, ((int) ceil(($costPrice + 1000) / 500)) * 500);
        }

        return [
            'cost_price' => $costPrice,
            'price' => $price,
        ];
    }
}
