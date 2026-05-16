<?php

namespace Database\Seeders;

use App\Models\User;
use App\Support\Enums\RoleEnums;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
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

        $admin = User::factory()->create([
            'name' => 'admin',
            'email' => 'admin@example.com',
        ]);

        $admin->assignRole(RoleEnums::ADMIN->value);

        $user = User::factory()->create([
            'name' => 'user',
            'email' => 'user@example.com',
        ]);

        $user->assignRole(RoleEnums::USER->value);
    }
}
