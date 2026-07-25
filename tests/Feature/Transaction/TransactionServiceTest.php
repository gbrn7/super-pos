<?php

use App\Models\PaymentMethod;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\User;
use App\Support\Interfaces\Services\TransactionServiceInterface;
use App\Support\Models\Transaction\GetTransactionReqModel;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->service = app(TransactionServiceInterface::class);
});

test('getAllByIndex returns transactions via service', function () {
    $user = User::factory()->create();
    Transaction::factory()->count(2)->create(['user_id' => $user->id]);

    $reqModel = new GetTransactionReqModel(new Request([]));
    $result = $this->service->getAllByIndex($reqModel);

    expect($result)->toHaveCount(2);
});

test('getById returns transaction', function () {
    $transaction = Transaction::factory()->create();

    $found = $this->service->getById($transaction->id);

    expect($found)->not->toBeNull()
        ->and($found->id)->toBe($transaction->id);
});

test('getById throws exception when transaction not found', function () {
    $this->service->getById(999999);
})->throws(Exception::class);

test('getByInvoiceNumber returns transaction via service', function () {
    $transaction = Transaction::factory()->create(['invoice_number' => 'INV-SERVICE-1']);

    $found = $this->service->getByInvoiceNumber('INV-SERVICE-1');

    expect($found)->not->toBeNull()
        ->and($found->invoice_number)->toBe('INV-SERVICE-1');
});

test('create transaction via service', function () {
    $user = User::factory()->create();
    $pm = PaymentMethod::factory()->create();

    $created = $this->service->create([
        'user_id' => $user->id,
        'payment_method_id' => $pm->id,
        'invoice_number' => 'INV-SERVICE-CREATE',
        'total_amount' => 75000,
        'payment_amount' => 75000,
        'change_amount' => 0,
    ]);

    expect($created)->toBeInstanceOf(Transaction::class)
        ->and($created->invoice_number)->toBe('INV-SERVICE-CREATE');
});

test('update transaction via service', function () {
    $pm1 = PaymentMethod::factory()->create();
    $pm2 = PaymentMethod::factory()->create();
    $transaction = Transaction::factory()->create(['payment_method_id' => $pm1->id]);

    $updated = $this->service->update($transaction->id, ['payment_method_id' => $pm2->id]);

    expect($updated)->not->toBeNull()
        ->and($updated->payment_method_id)->toBe($pm2->id);
});

test('delete transaction via service', function () {
    $transaction = Transaction::factory()->create();

    $result = $this->service->delete($transaction->id);

    expect($result)->toBeTrue()
        ->and(Transaction::find($transaction->id))->toBeNull();
});

test('bulkDelete transactions via service', function () {
    $transactions = Transaction::factory()->count(3)->create();
    $ids = $transactions->pluck('id')->toArray();

    $count = $this->service->bulkDelete($ids);

    expect($count)->toBe(3);
});

test('checkout records profit data successfully', function () {
    $user = User::factory()->create();
    $this->actingAs($user);
    $paymentMethod = PaymentMethod::factory()->create();
    $product = Product::factory()->create([
        'price' => 10000,
        'cost_price' => 7000,
        'stock' => 10,
        'is_active' => true,
        'is_unlimited' => false,
    ]);

    $checkoutData = [
        'payment_method_id' => $paymentMethod->id,
        'discount_amount' => 1000,
        'payment_amount' => 10000,
        'items' => [
            [
                'product_id' => $product->id,
                'unit_name' => 'PCS',
                'quantity' => 1,
                'price' => 10000,
                'cost_price' => 7000,
                'discount' => 0,
            ],
        ],
    ];

    $transaction = $this->service->checkout($checkoutData);

    $this->assertDatabaseHas('profit_wallet_transactions', [
        'amount' => 2000.00,
        'type' => 'in',
        'transaction_type' => 'sales_profit',
        'reference_id' => $transaction->id,
        'reference_type' => get_class($transaction),
    ]);
});
