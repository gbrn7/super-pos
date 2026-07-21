<?php

namespace Database\Factories;

use App\Models\MasterProduct;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<MasterProduct>
 */
class MasterProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $price = fake()->numberBetween(1000, 100000);

        return [
            'category_name' => fake()->sentence(2),
            'unit_name' => 'Pcs',
            'name' => fake()->word(),
            'barcode' => fake()->ean13(),
            'desc' => fake()->sentence(),
            'price' => $price,
            'cost_price' => (80 / 100) * $price,
            'created_at' => now()->unix(),
            'updated_at' => now()->unix(),
        ];
    }
}
