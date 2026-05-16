<?php

namespace Database\Seeders;

use App\Support\Enums\PermissionEnums;
use App\Support\Enums\RoleEnums;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        foreach (PermissionEnums::cases() as $permission) {
            Permission::firstOrCreate([
                'name' => $permission->value,
            ]);
        }

        //super admin already have access, the setup gate on appServiceProvider

        $admin = Role::findByName(RoleEnums::ADMIN->value);

        $admin->givePermissionTo([
            PermissionEnums::READ_CATEGORY->value,
            PermissionEnums::CREATE_CATEGORY->value,
            // PermissionEnums::EDIT_CATEGORY->value,
            // PermissionEnums::DELETE_CATEGORY->value,
        ]);

        $user = Role::findByName(RoleEnums::USER->value);

        $user->givePermissionTo([
            PermissionEnums::READ_CATEGORY->value,
            // PermissionEnums::CREATE_CATEGORY->value,
            // PermissionEnums::EDIT_CATEGORY->value,
            // PermissionEnums::DELETE_CATEGORY->value,
        ]);
    }
}
