<?php

use App\Models\Permission;
use App\Models\Role;
use App\Support\Enums\ProfitWalletPermissionEnums;
use App\Support\Enums\RoleEnums;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('permissions are seeded and assigned to admin role correctly', function () {
    $this->seed(RoleSeeder::class);
    $this->seed(PermissionSeeder::class);

    foreach (ProfitWalletPermissionEnums::cases() as $perm) {
        expect(Permission::where('name', $perm->value)->exists())->toBeTrue();
    }

    $adminRole = Role::findByName(RoleEnums::ADMIN->value);
    expect($adminRole->hasPermissionTo(ProfitWalletPermissionEnums::READ_PROFIT_WALLET->value))->toBeTrue()
        ->and($adminRole->hasPermissionTo(ProfitWalletPermissionEnums::DISBURSE_PROFIT_WALLET->value))->toBeTrue()
        ->and($adminRole->hasPermissionTo(ProfitWalletPermissionEnums::WITHDRAW_CAPITAL_PROFIT_WALLET->value))->toBeTrue();
});
