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
        $now = now();
        Unit::insert([
            [
                'name' => 'Kilogram',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Liter',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Box',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Lusin',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Pcs',
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);
    }
}
