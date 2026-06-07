<?php

namespace Database\Seeders;

use App\Support\Enums\CategoryPermissionEnums;
use App\Support\Enums\DashboardPermissionEnums;
use App\Support\Enums\RoleEnums;
use App\Support\Enums\RolePermissionEnums;
use Illuminate\Database\Seeder;
use App\Models\Permission;
use App\Models\Role;
use App\Support\Enums\PaymentMethodPermissionEnums;
use App\Support\Enums\UnitPermissionEnums;

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

        foreach (RolePermissionEnums::cases() as $permission) {
            Permission::firstOrCreate([
                'name' => $permission->value,
            ]);
        }

        foreach (UnitPermissionEnums::cases() as $permission) {
            Permission::firstOrCreate([
                'name' => $permission->value,
            ]);
        }

        foreach (PaymentMethodPermissionEnums::cases() as $permission) {
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

            RolePermissionEnums::READ_ROLE->value,
            UnitPermissionEnums::CREATE_UNIT->value,
            UnitPermissionEnums::READ_UNIT->value,
            UnitPermissionEnums::UPDATE_UNIT->value,
            UnitPermissionEnums::DELETE_UNIT->value,

            PaymentMethodPermissionEnums::READ_PAYMENT_METHOD->value,
        ]);

        $user = Role::findByName(RoleEnums::USER->value);

        $user->givePermissionTo([
            DashboardPermissionEnums::READ_DASHBOARD->value,
            CategoryPermissionEnums::READ_CATEGORY->value,
            UnitPermissionEnums::READ_UNIT->value,
        ]);
    }
}
