<?php

use App\Models\PaymentMethod;
use App\Models\Permission;
use App\Models\Transaction;
use App\Models\User;
use App\Support\Enums\TransactionPermissionEnums;
use App\Support\Interfaces\Repositories\TransactionRepositoryInterface;
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

test('export filename includes date range when specified', function () {
    $user = User::factory()->create();
    $user->givePermissionTo(TransactionPermissionEnums::READ_TRANSACTION->value);

    $responsePdf = $this->actingAs($user)->get(route('apiTransactions.exportData', [
        'format' => 'pdf',
        'start_date' => '2026-08-01',
        'end_date' => '2026-08-31',
    ]));

    $responsePdf->assertStatus(200);
    expect($responsePdf->headers->get('content-disposition'))->toContain('laporan-transaksi-2026-08-01-sd-2026-08-31.pdf');

    $responseExcel = $this->actingAs($user)->get(route('apiTransactions.exportData', [
        'format' => 'excel',
        'start_date' => '2026-08-01',
        'end_date' => '2026-08-01',
    ]));

    $responseExcel->assertStatus(200);
    expect($responseExcel->headers->get('content-disposition'))->toContain('laporan-transaksi-2026-08-01.xlsx');
});

test('authenticated user can export transactions with data to pdf and excel', function () {
    $user = User::factory()->create();
    $user->givePermissionTo(TransactionPermissionEnums::READ_TRANSACTION->value);

    $pm = PaymentMethod::factory()->create();
    Transaction::factory()->count(10)->create([
        'user_id' => $user->id,
        'payment_method_id' => $pm->id,
        'total_amount' => 50000,
    ]);

    $responsePdf = $this->actingAs($user)->get(route('apiTransactions.exportData', ['format' => 'pdf']));
    $responsePdf->assertStatus(200);
    $responsePdf->assertHeader('content-type', 'application/pdf');

    $responseExcel = $this->actingAs($user)->get(route('apiTransactions.exportData', ['format' => 'excel']));
    $responseExcel->assertStatus(200);
});

test('export pdf returns 422 if transaction count exceeds limit', function () {
    $user = User::factory()->create();
    $user->givePermissionTo(TransactionPermissionEnums::READ_TRANSACTION->value);

    // Mock getTransactionSummary to return count > 2000
    $mockRepo = Mockery::mock(TransactionRepositoryInterface::class);
    $mockRepo->shouldReceive('getTransactionSummary')
        ->once()
        ->andReturn([
            'count' => 2500,
            'gross_sales' => 1000000,
            'total_discounts' => 0,
            'total_returns' => 0,
            'gross_profit' => 500000,
            'net_sales' => 1000000,
            'net_profit' => 500000,
        ]);

    $this->app->instance(TransactionRepositoryInterface::class, $mockRepo);

    $response = $this->actingAs($user)->getJson(route('apiTransactions.exportData', ['format' => 'pdf']));

    $response->assertStatus(422);
    $response->assertJson([
        'success' => false,
    ]);
    expect($response->json('message'))->toContain('2.500');
});
