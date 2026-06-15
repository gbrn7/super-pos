<?php

namespace Database\Factories;

use App\Models\Product;
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
        $productName = Str::ucfirst(fake()->word());
        $price = fake()->numberBetween(1000, 100000);
        return [
            'category_id' => fake()->numberBetween(1, 5),
            'unit_id' => fake()->numberBetween(1, 5),
            'name' => $productName,
            'stock' => fake()->numberBetween(0, 100),
            'sku' => Str::of($productName)
                ->headline()
                ->replaceMatches('/[^A-Z]/', '') . '-' . strtoupper(Str::random(8)),
            'price' => $price,
            'cost_price' => (80 / 100) * $price,
            'is_active' => fake()->boolean(),
            'is_unlimited' => fake()->boolean(),
            'desc' => fake()->sentence(),
            'created_at' => now()->unix(),
            'updated_at' => now()->unix(),
        ];
    }
}
