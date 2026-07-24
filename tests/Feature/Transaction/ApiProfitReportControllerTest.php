<?php

use App\Models\PaymentMethod;
use App\Models\Permission;
use App\Models\Transaction;
use App\Models\TransactionProfit;
use App\Models\User;
use App\Support\Enums\TransactionPermissionEnums;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('admin with read-transaction-profit permission can access profit report API', function () {
    $user = User::factory()->create();
    $permission = Permission::firstOrCreate(['name' => TransactionPermissionEnums::READ_TRANSACTION_PROFIT->value]);
    $user->givePermissionTo($permission);
    $this->actingAs($user);

    $paymentMethod = PaymentMethod::factory()->create();
    $transaction = Transaction::create([
        'user_id' => $user->id,
        'payment_method_id' => $paymentMethod->id,
        'invoice_number' => 'INV-PROFIT-001',
        'total_amount' => 150000.00,
        'payment_amount' => 200000.00,
        'change_amount' => 50000.00,
    ]);

    TransactionProfit::create([
        'transaction_id' => $transaction->id,
        'total_revenue' => 150000.00,
        'total_cost' => 100000.00,
        'profit' => 50000.00,
    ]);

    $response = $this->getJson(route('apiProfitReport.index'));

    $response->assertStatus(200)
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.summary.total_revenue', 150000)
        ->assertJsonPath('data.summary.total_cost', 100000)
        ->assertJsonPath('data.summary.total_net_profit', 50000);
});

test('unauthorized user cannot access profit report API', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->getJson(route('apiProfitReport.index'));
    $response->assertStatus(403);
});
