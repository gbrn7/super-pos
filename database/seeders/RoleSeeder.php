<?php

namespace Database\Seeders;

use App\Support\Enums\RoleEnums;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

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
