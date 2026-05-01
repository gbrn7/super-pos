<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        for ($index = 0; $index < 100; $index++) {
            Category::create(
                [
                    "name" => fake()->word(),
                    "desc" => fake()->sentence(),
                    "created_at" => now(),
                    "updated_at" => now(),
                ]
            );
        }
    }
}
