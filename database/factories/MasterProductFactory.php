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
        $price = $this->faker->numberBetween(1000, 100000);

        return [
            'category_name' => $this->faker->sentence(2),
            'unit_name' => 'Pcs',
            'name' => $this->faker->word(),
            'barcode' => $this->faker->ean13(),
            'desc' => $this->faker->sentence(),
            'price' => $price,
            'cost_price' => (80 / 100) * $price,
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}
