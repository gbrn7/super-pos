<?php

use App\Models\PaymentMethod;
use App\Models\Transaction;
use App\Models\User;
use App\Repositories\TransactionRepository;
use App\Support\Models\Transaction\GetTransactionReqModel;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->repository = new TransactionRepository;
});

test('getAllByIndex returns paginated transactions', function () {
    $user = User::factory()->create();
    Transaction::factory()->count(3)->create(['user_id' => $user->id]);

    $reqModel = new GetTransactionReqModel(new Request(['limit' => 2]));
    $result = $this->repository->getAllByIndex($reqModel);

    expect($result)->toHaveCount(2);
});

test('getAllByIndex filters by invoice_number', function () {
    Transaction::factory()->create(['invoice_number' => 'INV-00001']);
    Transaction::factory()->create(['invoice_number' => 'INV-00002']);

    $reqModel = new GetTransactionReqModel(new Request(['invoice_number' => 'INV-00001']));
    $result = $this->repository->getAllByIndex($reqModel);

    expect($result)->toHaveCount(1)
        ->and($result->first()->invoice_number)->toBe('INV-00001');
});

test('getById returns transaction with relations', function () {
    $transaction = Transaction::factory()->create();

    $found = $this->repository->getById($transaction->id);

    expect($found)->not->toBeNull()
        ->and($found->id)->toBe($transaction->id);
});

test('getByInvoiceNumber returns expected transaction', function () {
    $transaction = Transaction::factory()->create(['invoice_number' => 'INV-12345']);

    $found = $this->repository->getByInvoiceNumber('INV-12345');

    expect($found)->not->toBeNull()
        ->and($found->invoice_number)->toBe('INV-12345');
});

test('create transaction', function () {
    $user = User::factory()->create();
    $pm = PaymentMethod::factory()->create();
    $data = [
        'user_id' => $user->id,
        'payment_method_id' => $pm->id,
        'invoice_number' => 'INV-99999',
        'total_amount' => 50000,
        'payment_amount' => 50000,
        'change_amount' => 0,
    ];

    $created = $this->repository->create($data);

    expect($created)->toBeInstanceOf(Transaction::class)
        ->and($created->invoice_number)->toBe('INV-99999');
});

test('update transaction', function () {
    $pm1 = PaymentMethod::factory()->create();
    $pm2 = PaymentMethod::factory()->create();
    $transaction = Transaction::factory()->create(['payment_method_id' => $pm1->id]);

    $updated = $this->repository->update($transaction, ['payment_method_id' => $pm2->id]);

    expect($updated)->toBeTrue()
        ->and($transaction->fresh()->payment_method_id)->toBe($pm2->id);
});

test('delete transaction', function () {
    $transaction = Transaction::factory()->create();

    $deleted = $this->repository->delete($transaction);

    expect($deleted)->toBeTrue()
        ->and(Transaction::find($transaction->id))->toBeNull();
});

test('deleteMany transactions', function () {
    $transactions = Transaction::factory()->count(3)->create();
    $ids = $transactions->pluck('id')->toArray();

    $deletedCount = $this->repository->deleteMany($ids);

    expect($deletedCount)->toBe(3);
});
