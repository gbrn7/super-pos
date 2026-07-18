<?php

use App\Models\PaymentMethod;
use App\Models\Permission;
use App\Models\Role;
use App\Models\Transaction;
use App\Models\User;
use App\Support\Enums\RoleEnums;
use App\Support\Enums\TransactionPermissionEnums;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->role = Role::create(['name' => RoleEnums::SUPER_ADMIN->value]);
    Permission::create(['name' => TransactionPermissionEnums::READ_TRANSACTION->value]);
    Permission::create(['name' => TransactionPermissionEnums::CREATE_TRANSACTION->value]);
    Permission::create(['name' => TransactionPermissionEnums::UPDATE_TRANSACTION->value]);
    Permission::create(['name' => TransactionPermissionEnums::DELETE_TRANSACTION->value]);

    $this->user = User::factory()->create();
    $this->user->assignRole($this->role);
});

test('index returns transaction list', function () {
    Transaction::factory()->count(3)->create(['user_id' => $this->user->id]);

    $response = $this->actingAs($this->user)
        ->getJson(route('apiTransactions.index'));

    $response->assertOk()
        ->assertJsonPath('success', true);
});

test('store creates new transaction', function () {
    $paymentMethod = PaymentMethod::factory()->create();
    $payload = [
        'user_id' => $this->user->id,
        'payment_method_id' => $paymentMethod->id,
        'invoice_number' => 'INV-CTRL-001',
        'total_amount' => 50000,
        'payment_amount' => 50000,
        'change_amount' => 0,
    ];

    $response = $this->actingAs($this->user)
        ->postJson(route('apiTransactions.store'), $payload);

    $response->assertCreated()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.invoice_number', 'INV-CTRL-001');
});

test('show returns transaction details', function () {
    $transaction = Transaction::factory()->create(['user_id' => $this->user->id]);

    $response = $this->actingAs($this->user)
        ->getJson(route('apiTransactions.show', $transaction->id));

    $response->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.id', $transaction->id);
});

test('getByInvoiceNumber returns target transaction', function () {
    $transaction = Transaction::factory()->create(['invoice_number' => 'INV-INV-001']);

    $response = $this->actingAs($this->user)
        ->getJson(route('apiTransactions.getByInvoiceNumber', 'INV-INV-001'));

    $response->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.invoice_number', 'INV-INV-001');
});

test('update modifies transaction', function () {
    $pm1 = PaymentMethod::factory()->create();
    $pm2 = PaymentMethod::factory()->create();
    $transaction = Transaction::factory()->create(['payment_method_id' => $pm1->id]);

    $response = $this->actingAs($this->user)
        ->putJson(route('apiTransactions.update', $transaction->id), [
            'payment_method_id' => $pm2->id,
        ]);

    $response->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.payment_method_id', $pm2->id);
});

test('destroy removes transaction', function () {
    $transaction = Transaction::factory()->create();

    $response = $this->actingAs($this->user)
        ->deleteJson(route('apiTransactions.destroy', $transaction->id));

    $response->assertOk()
        ->assertJsonPath('success', true);
});

test('bulkDelete removes multiple transactions', function () {
    $transactions = Transaction::factory()->count(2)->create();
    $ids = $transactions->pluck('id')->toArray();

    $response = $this->actingAs($this->user)
        ->postJson(route('apiTransactions.bulkDelete'), ['ids' => $ids]);

    $response->assertOk()
        ->assertJsonPath('success', true);
});
