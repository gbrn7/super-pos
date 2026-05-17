<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Support\Enums\RoleEnums;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        foreach (RoleEnums::cases() as $role) {
            Role::firstOrCreate([
                'name' => $role->value,
            ]);
        }
    }
}
