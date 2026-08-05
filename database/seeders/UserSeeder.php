<?php

namespace Database\Seeders;

use App\Models\User;
use App\Support\Enums\RoleEnums;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        $superadmin = User::factory()->create([
            'name' => 'super admin',
            'email' => 'superadmin@example.com',
        ]);

        $superadmin->assignRole(RoleEnums::SUPER_ADMIN->value);

        $owner = User::factory()->create([
            'name' => 'owner',
            'email' => 'owner@example.com',
        ]);

        $owner->assignRole(RoleEnums::SUPER_ADMIN->value);

        $admin = User::factory()->create([
            'name' => 'admin',
            'email' => 'admin@example.com',
        ]);

        $admin->assignRole(RoleEnums::ADMIN->value);

        $kasir = User::factory()->create([
            'name' => 'kasir',
            'email' => 'kasir@example.com',
        ]);

        $kasir->assignRole(RoleEnums::KASIR->value);
    }
}
