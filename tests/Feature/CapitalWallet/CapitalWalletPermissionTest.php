<?php

use App\Models\Permission;
use App\Models\Role;
use App\Support\Enums\CapitalWalletPermissionEnums;
use App\Support\Enums\RoleEnums;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;

uses(RefreshDatabase::class);

test('capital wallet table exists and has default record', function () {
    $wallet = DB::table('capital_wallets')->first();
    expect($wallet)->not->toBeNull();
    expect($wallet->balance)->toEqual(0.00);
    expect($wallet->status)->toEqual('active');
});

test('capital wallet permissions are seeded and assigned to admin role correctly', function () {
    $this->seed(RoleSeeder::class);
    $this->seed(PermissionSeeder::class);

    foreach (CapitalWalletPermissionEnums::cases() as $perm) {
        expect(Permission::where('name', $perm->value)->exists())->toBeTrue();
    }

    $adminRole = Role::findByName(RoleEnums::ADMIN->value);
    expect($adminRole->hasPermissionTo(CapitalWalletPermissionEnums::READ_CAPITAL_WALLET->value))->toBeTrue()
        ->and($adminRole->hasPermissionTo(CapitalWalletPermissionEnums::INJECT_CAPITAL_WALLET->value))->toBeTrue()
        ->and($adminRole->hasPermissionTo(CapitalWalletPermissionEnums::DRAWDOWN_CAPITAL_WALLET->value))->toBeTrue()
        ->and($adminRole->hasPermissionTo(CapitalWalletPermissionEnums::PURCHASE_PRODUCT_CAPITAL_WALLET->value))->toBeTrue();
});
