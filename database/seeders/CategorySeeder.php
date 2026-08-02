<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Category::insert(
            [
                [
                    'name' => 'Sembako',
                    'desc' => fake()->sentence(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'name' => 'Minuman',
                    'desc' => fake()->sentence(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'name' => 'Snack',
                    'desc' => fake()->sentence(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'name' => 'Obat Obatan',
                    'desc' => fake()->sentence(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'name' => 'Gas',
                    'desc' => fake()->sentence(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ]
        );

        Category::factory(10)->create();
    }
}
