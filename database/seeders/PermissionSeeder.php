<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use App\Support\Enums\CapitalWalletPermissionEnums;
use App\Support\Enums\CategoryPermissionEnums;
use App\Support\Enums\DashboardPermissionEnums;
use App\Support\Enums\MasterProductPermissionEnums;
use App\Support\Enums\PaymentMethodPermissionEnums;
use App\Support\Enums\ProductPermissionEnums;
use App\Support\Enums\ProfitWalletPermissionEnums;
use App\Support\Enums\ReturnPermissionEnums;
use App\Support\Enums\RoleEnums;
use App\Support\Enums\RolePermissionEnums;
use App\Support\Enums\TransactionDetailPermissionEnums;
use App\Support\Enums\TransactionPermissionEnums;
use App\Support\Enums\UnitPermissionEnums;
use App\Support\Enums\UserPermissionEnums;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        foreach (MasterProductPermissionEnums::cases() as $permission) {
            Permission::firstOrCreate([
                'name' => $permission->value,
            ]);
        }

        foreach (UserPermissionEnums::cases() as $permission) {
            Permission::firstOrCreate([
                'name' => $permission->value,
            ]);
        }

        foreach (TransactionDetailPermissionEnums::cases() as $permission) {
            Permission::firstOrCreate([
                'name' => $permission->value,
            ]);
        }

        foreach (ProductPermissionEnums::cases() as $permission) {
            Permission::firstOrCreate([
                'name' => $permission->value,
            ]);
        }

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

        foreach (TransactionPermissionEnums::cases() as $permission) {
            Permission::firstOrCreate([
                'name' => $permission->value,
            ]);
        }

        foreach (ProfitWalletPermissionEnums::cases() as $permission) {
            Permission::firstOrCreate([
                'name' => $permission->value,
            ]);
        }

        foreach (CapitalWalletPermissionEnums::cases() as $permission) {
            Permission::firstOrCreate([
                'name' => $permission->value,
            ]);
        }

        foreach (ReturnPermissionEnums::cases() as $permission) {
            Permission::firstOrCreate([
                'name' => $permission->value,
            ]);
        }

        // super admin already have access, the setup gate on appServiceProvider

        $admin = Role::findByName(RoleEnums::ADMIN->value);

        $profitWalletPermissions = array_map(
            fn (ProfitWalletPermissionEnums $permission) => $permission->value,
            ProfitWalletPermissionEnums::cases()
        );

        $allPermissions = Permission::whereNotIn('name', $profitWalletPermissions)->get();

        $admin->syncPermissions($allPermissions);
    }
}
