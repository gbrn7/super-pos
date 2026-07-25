<?php

use App\Models\User;
use App\Support\Enums\RoleEnums;
use App\Support\Interfaces\Services\CapitalWalletServiceInterface;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RoleSeeder::class);
    $this->seed(PermissionSeeder::class);
    $this->service = app(CapitalWalletServiceInterface::class);
});

test('api endpoints require authentication and permissions', function () {
    $this->getJson(route('apiCapitalWallet.index'))->assertStatus(401);

    $userWithoutPerm = User::factory()->create();
    $this->actingAs($userWithoutPerm);
    $this->getJson(route('apiCapitalWallet.index'))->assertStatus(403);
});

test('api index returns wallet transactions and summary', function () {
    $admin = User::factory()->create();
    $admin->assignRole(RoleEnums::ADMIN->value);
    $this->actingAs($admin);

    $this->service->recordSalesCapital(1200.00, 1);

    $response = $this->getJson(route('apiCapitalWallet.index', ['limit' => 10]));
    $response->assertStatus(200)
        ->assertJsonPath('data.summary.current_balance', 1200)
        ->assertJsonCount(1, 'data.transactions.items');
});

test('api inject executes successfully', function () {
    $admin = User::factory()->create();
    $admin->assignRole(RoleEnums::ADMIN->value);
    $this->actingAs($admin);

    $response = $this->postJson(route('apiCapitalWallet.inject'), [
        'amount' => 1500.00,
        'notes' => 'Owner injection',
    ]);

    $response->assertStatus(200)
        ->assertJsonPath('data.balance_after', 1500);
});

test('api drawdown executes successfully', function () {
    $admin = User::factory()->create();
    $admin->assignRole(RoleEnums::ADMIN->value);
    $this->actingAs($admin);

    // Initial inject to have balance
    $this->postJson(route('apiCapitalWallet.inject'), [
        'amount' => 2000.00,
        'notes' => 'Initial capital',
    ]);

    $response = $this->postJson(route('apiCapitalWallet.drawdown'), [
        'amount' => 800.00,
        'notes' => 'Owner drawdown',
    ]);

    $response->assertStatus(200)
        ->assertJsonPath('data.balance_after', 1200);
});

test('api purchase product executes successfully', function () {
    $admin = User::factory()->create();
    $admin->assignRole(RoleEnums::ADMIN->value);
    $this->actingAs($admin);

    // Initial inject to have balance
    $this->postJson(route('apiCapitalWallet.inject'), [
        'amount' => 3000.00,
        'notes' => 'Initial capital',
    ]);

    $response = $this->postJson(route('apiCapitalWallet.purchaseProduct'), [
        'amount' => 1500.00,
        'notes' => 'Purchase new inventory',
    ]);

    $response->assertStatus(200)
        ->assertJsonPath('data.balance_after', 1500);
});

test('validation fails when amount is less than minimum or zero', function () {
    $admin = User::factory()->create();
    $admin->assignRole(RoleEnums::ADMIN->value);
    $this->actingAs($admin);

    $response = $this->postJson(route('apiCapitalWallet.inject'), [
        'amount' => 0.00,
        'notes' => 'Zero injection',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['amount']);
});
