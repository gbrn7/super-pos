<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Product;
use App\Models\Unit;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $productName = Str::ucfirst($this->faker->word());
        $price = $this->faker->numberBetween(1000, 100000);

        return [
            'category_id' => Category::factory(),
            'unit_id' => Unit::factory(),
            'sku' => 'SKU-'.Str::upper(Str::random(6)),
            'name' => $productName,
            'barcode' => $this->faker->ean13(),
            'is_active' => $this->faker->boolean(),
            'is_unlimited' => $this->faker->boolean(),
            'desc' => $this->faker->sentence(),
            'stock' => $this->faker->numberBetween(0, 100),
            'sold_quantity' => 0,
            'price' => $price + 5000,
            'cost_price' => $price,
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}
