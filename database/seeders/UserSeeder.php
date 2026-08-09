<?php

namespace Database\Seeders;

use App\Models\User;
use App\Support\Enums\RoleEnums;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        $password = Hash::make('password');
        $rememberToken = Str::random(10);
        $now = now();

        $superadmin = User::create([
            'name' => 'super admin',
            'email' => 'superadmin@praktispos.com',
            'email_verified_at' => $now,
            'password' => $password,
            'remember_token' => $rememberToken,
        ]);

        $superadmin->assignRole(RoleEnums::SUPER_ADMIN->value);

        $owner = User::create([
            'name' => 'owner',
            'email' => 'owner@praktispos.com',
            'email_verified_at' => $now,
            'password' => $password,
            'remember_token' => $rememberToken,
        ]);

        $owner->assignRole(RoleEnums::SUPER_ADMIN->value);

        $admin = User::create([
            'name' => 'admin',
            'email' => 'admin@praktispos.com',
            'email_verified_at' => $now,
            'password' => $password,
            'remember_token' => $rememberToken,
        ]);

        $admin->assignRole(RoleEnums::ADMIN->value);

        $kasir = User::create([
            'name' => 'kasir',
            'email' => 'kasir@praktispos.com',
            'email_verified_at' => $now,
            'password' => $password,
            'remember_token' => $rememberToken,
        ]);

        $kasir->assignRole(RoleEnums::KASIR->value);
    }
}
