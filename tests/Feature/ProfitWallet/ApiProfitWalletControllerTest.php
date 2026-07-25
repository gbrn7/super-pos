<?php

use App\Models\User;
use App\Support\Enums\RoleEnums;
use App\Support\Interfaces\Services\ProfitWalletServiceInterface;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RoleSeeder::class);
    $this->seed(PermissionSeeder::class);
    $this->service = app(ProfitWalletServiceInterface::class);
});

test('api endpoints require authentication and permissions', function () {
    $this->getJson(route('apiProfitWallet.index'))->assertStatus(401);

    $userWithoutPerm = User::factory()->create();
    $this->actingAs($userWithoutPerm);
    $this->getJson(route('apiProfitWallet.index'))->assertStatus(403);
});

test('api index returns wallet transactions and summary', function () {
    $admin = User::factory()->create();
    $admin->assignRole(RoleEnums::ADMIN->value);
    $this->actingAs($admin);

    $this->service->recordSalesProfit(1200.00, 1);

    $response = $this->getJson(route('apiProfitWallet.index', ['limit' => 10]));
    $response->assertStatus(200)
        ->assertJsonPath('data.summary.current_balance', 1200)
        ->assertJsonCount(1, 'data.transactions.data');
});

test('api disburse executes payout successfully', function () {
    $admin = User::factory()->create();
    $admin->assignRole(RoleEnums::ADMIN->value);
    $this->actingAs($admin);

    $this->service->recordSalesProfit(1500.00, 1);

    $response = $this->postJson(route('apiProfitWallet.disburse'), [
        'amount' => 500.00,
        'notes' => 'Payout',
    ]);

    $response->assertStatus(200)
        ->assertJsonPath('data.balance_after', 1000);
});

test('api withdraw capital executes successfully', function () {
    $admin = User::factory()->create();
    $admin->assignRole(RoleEnums::ADMIN->value);
    $this->actingAs($admin);

    $this->service->recordSalesProfit(2000.00, 1);

    $response = $this->postJson(route('apiProfitWallet.withdrawCapital'), [
        'amount' => 1000.00,
        'notes' => 'Capital withdrawal',
    ]);

    $response->assertStatus(200)
        ->assertJsonPath('data.balance_after', 1000);
});
