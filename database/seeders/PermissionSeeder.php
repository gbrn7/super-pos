<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use App\Support\Enums\CapitalWalletPermissionEnums;
use App\Support\Enums\CategoryPermissionEnums;
use App\Support\Enums\DashboardPermissionEnums;
use App\Support\Enums\PaymentMethodPermissionEnums;
use App\Support\Enums\ProfitWalletPermissionEnums;
use App\Support\Enums\ReturnPermissionEnums;
use App\Support\Enums\RoleEnums;
use App\Support\Enums\RolePermissionEnums;
use App\Support\Enums\TransactionPermissionEnums;
use App\Support\Enums\UnitPermissionEnums;
use Illuminate\Database\Seeder;

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

            ProfitWalletPermissionEnums::READ_PROFIT_WALLET->value,
            ProfitWalletPermissionEnums::DISBURSE_PROFIT_WALLET->value,
            ProfitWalletPermissionEnums::WITHDRAW_CAPITAL_PROFIT_WALLET->value,

            CapitalWalletPermissionEnums::READ_CAPITAL_WALLET->value,
            CapitalWalletPermissionEnums::INJECT_CAPITAL_WALLET->value,
            CapitalWalletPermissionEnums::DRAWDOWN_CAPITAL_WALLET->value,
            CapitalWalletPermissionEnums::PURCHASE_PRODUCT_CAPITAL_WALLET->value,

            ReturnPermissionEnums::CREATE_RETURN->value,
            ReturnPermissionEnums::READ_RETURN->value,
            ReturnPermissionEnums::UPDATE_RETURN->value,
            ReturnPermissionEnums::DELETE_RETURN->value,
        ]);

        $user = Role::findByName(RoleEnums::USER->value);

        $user->givePermissionTo([
            DashboardPermissionEnums::READ_DASHBOARD->value,
            CategoryPermissionEnums::READ_CATEGORY->value,
            UnitPermissionEnums::READ_UNIT->value,
            ReturnPermissionEnums::READ_RETURN->value,
        ]);
    }
}
