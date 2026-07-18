<?php

use App\Models\Permission;
use App\Models\Product;
use App\Models\Role;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use App\Models\User;
use App\Support\Enums\RoleEnums;
use App\Support\Enums\TransactionDetailPermissionEnums;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->role = Role::create(['name' => RoleEnums::SUPER_ADMIN->value]);
    Permission::create(['name' => TransactionDetailPermissionEnums::READ_TRANSACTION_DETAIL->value]);
    Permission::create(['name' => TransactionDetailPermissionEnums::CREATE_TRANSACTION_DETAIL->value]);
    Permission::create(['name' => TransactionDetailPermissionEnums::UPDATE_TRANSACTION_DETAIL->value]);
    Permission::create(['name' => TransactionDetailPermissionEnums::DELETE_TRANSACTION_DETAIL->value]);

    $this->user = User::factory()->create();
    $this->user->assignRole($this->role);
});

test('index returns transaction details list', function () {
    TransactionDetail::factory()->count(2)->create();

    $response = $this->actingAs($this->user)
        ->getJson(route('apiTransactionDetails.index'));

    $response->assertOk()
        ->assertJsonPath('success', true);
});

test('store creates transaction detail', function () {
    $tx = Transaction::factory()->create();
    $product = Product::factory()->create();

    $payload = [
        'transaction_id' => $tx->id,
        'product_id' => $product->id,
        'unit_name' => 'UNIT-TEST',
        'quantity' => 2,
        'cost_price' => 10000,
        'price' => 15000,
    ];

    $response = $this->actingAs($this->user)
        ->postJson(route('apiTransactionDetails.store'), $payload);

    $response->assertCreated()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.unit_name', 'UNIT-TEST');
});

test('show returns transaction detail', function () {
    $detail = TransactionDetail::factory()->create();

    $response = $this->actingAs($this->user)
        ->getJson(route('apiTransactionDetails.show', $detail->id));

    $response->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.id', $detail->id);
});

test('getByTransactionId returns transaction details for transaction', function () {
    $tx = Transaction::factory()->create();
    TransactionDetail::factory()->count(2)->create(['transaction_id' => $tx->id]);

    $response = $this->actingAs($this->user)
        ->getJson(route('apiTransactionDetails.getByTransactionId', $tx->id));

    $response->assertOk()
        ->assertJsonPath('success', true);
});

test('update modifies transaction detail', function () {
    $detail = TransactionDetail::factory()->create(['quantity' => 1]);

    $response = $this->actingAs($this->user)
        ->putJson(route('apiTransactionDetails.update', $detail->id), [
            'quantity' => 5,
        ]);

    $response->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.quantity', 5);
});

test('destroy removes transaction detail', function () {
    $detail = TransactionDetail::factory()->create();

    $response = $this->actingAs($this->user)
        ->deleteJson(route('apiTransactionDetails.destroy', $detail->id));

    $response->assertOk()
        ->assertJsonPath('success', true);
});

test('bulkDelete removes multiple transaction details', function () {
    $details = TransactionDetail::factory()->count(2)->create();
    $ids = $details->pluck('id')->toArray();

    $response = $this->actingAs($this->user)
        ->postJson(route('apiTransactionDetails.bulkDelete'), ['ids' => $ids]);

    $response->assertOk()
        ->assertJsonPath('success', true);
});
