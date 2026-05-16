<?php

namespace Database\Seeders;

use App\Support\Enums\CategoryPermissionEnums;
use App\Support\Enums\DashboardPermissionEnums;
use App\Support\Enums\RoleEnums;
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
        foreach (CategoryPermissionEnums::cases() as $permission) {
            Permission::firstOrCreate([
                'name' => $permission->value,
            ]);
        }

        foreach (DashboardPermissionEnums::cases() as $permission) {
            Permission::firstOrCreate([
                'name' => $permission->value,
            ]);
        }

        //super admin already have access, the setup gate on appServiceProvider

        $admin = Role::findByName(RoleEnums::ADMIN->value);

        $admin->givePermissionTo([
            DashboardPermissionEnums::READ_DASHBOARD->value,

            CategoryPermissionEnums::CREATE_CATEGORY->value,
            CategoryPermissionEnums::READ_CATEGORY->value,
            // CategoryPermissionEnums::UPDATE_CATEGORY->value,
            // CategoryPermissionEnums::DELETE_CATEGORY->value,
        ]);

        $user = Role::findByName(RoleEnums::USER->value);

        $user->givePermissionTo([
            DashboardPermissionEnums::READ_DASHBOARD->value,
            // CategoryPermissionEnums::READ_CATEGORY->value,
        ]);
    }
}
