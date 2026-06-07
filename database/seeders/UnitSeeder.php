<?php

namespace Database\Seeders;

use App\Models\Unit;
use Illuminate\Database\Seeder;

class UnitSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Unit::insert([
            [
                'name' => 'Kilogram',
                'created_at' => now()->unix(),
                'updated_at' => now()->unix(),
            ],
            [
                'name' => 'Liter',
                'created_at' => now()->unix(),
                'updated_at' => now()->unix(),
            ],
            [
                'name' => 'Pcs',
                'created_at' => now()->unix(),
                'updated_at' => now()->unix(),
            ],
        ]);
    }
}
