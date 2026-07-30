<?php

use App\Models\Permission;
use App\Models\User;
use App\Support\Enums\TransactionPermissionEnums;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    Permission::create(['name' => TransactionPermissionEnums::READ_TRANSACTION->value]);
});

test('authenticated user with read permission can export transactions as pdf', function () {
    $user = User::factory()->create();
    $user->givePermissionTo(TransactionPermissionEnums::READ_TRANSACTION->value);

    $response = $this->actingAs($user)->get(route('apiTransactions.exportData', ['format' => 'pdf']));

    $response->assertStatus(200);
    $response->assertHeader('content-type', 'application/pdf');
});

test('authenticated user with read permission can export transactions as excel', function () {
    $user = User::factory()->create();
    $user->givePermissionTo(TransactionPermissionEnums::READ_TRANSACTION->value);

    $response = $this->actingAs($user)->get(route('apiTransactions.exportData', ['format' => 'excel']));

    $response->assertStatus(200);
    $response->assertHeader('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
});

test('unauthorized user cannot export transactions', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('apiTransactions.exportData', ['format' => 'pdf']));

    $response->assertStatus(403);
});
