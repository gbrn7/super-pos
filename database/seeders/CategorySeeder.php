<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

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
                    'name' => fake()->unique()->name(),
                    'desc' => fake()->sentence(),
                    'created_at' => Carbon::now()->unix(),
                    'updated_at' => Carbon::now()->unix(),
                ]
            );
        }
    }
}
