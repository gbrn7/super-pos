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
            'sku' => 'PRD-' . Str::upper(Str::random(6)),
            // 'master_code' => null,
            'category_id' => Category::factory(),
            'unit_id' => Unit::factory(),
            'barcode' => $this->faker->ean13() . Str::upper(Str::random(6)),
            'stock' => $this->faker->numberBetween(0, 100),
            // 'stock_alert' => 10,
            'cost_price' => $price,
            'price' => $price + 5000,
            'name' => $productName,
            'is_active' => $this->faker->boolean(),
            'is_unlimited' => $this->faker->boolean(),
            'desc' => $this->faker->sentence(),
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}
