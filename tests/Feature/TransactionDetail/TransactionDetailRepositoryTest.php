<?php

use App\Models\Product;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use App\Repositories\TransactionDetailRepository;
use App\Support\Models\TransactionDetail\GetTransactionDetailReqModel;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->repository = new TransactionDetailRepository;
});

test('getAllByIndex returns paginated transaction details', function () {
    $transaction = Transaction::factory()->create();
    TransactionDetail::factory()->count(3)->create(['transaction_id' => $transaction->id]);

    $reqModel = new GetTransactionDetailReqModel(new Request(['limit' => 2]));
    $result = $this->repository->getAllByIndex($reqModel);

    expect($result)->toHaveCount(2);
});

test('getAllByIndex filters by transaction_id', function () {
    $tx1 = Transaction::factory()->create();
    $tx2 = Transaction::factory()->create();

    TransactionDetail::factory()->create(['transaction_id' => $tx1->id]);
    TransactionDetail::factory()->create(['transaction_id' => $tx2->id]);

    $reqModel = new GetTransactionDetailReqModel(new Request(['transaction_id' => $tx1->id]));
    $result = $this->repository->getAllByIndex($reqModel);

    expect($result)->toHaveCount(1)
        ->and($result->first()->transaction_id)->toBe($tx1->id);
});

test('getById returns transaction detail with relations', function () {
    $detail = TransactionDetail::factory()->create();

    $found = $this->repository->getById($detail->id);

    expect($found)->not->toBeNull()
        ->and($found->id)->toBe($detail->id);
});

test('getByTransactionId returns all items for transaction', function () {
    $tx = Transaction::factory()->create();
    TransactionDetail::factory()->count(2)->create(['transaction_id' => $tx->id]);

    $results = $this->repository->getByTransactionId($tx->id);

    expect($results)->toHaveCount(2);
});

test('create transaction detail', function () {
    $tx = Transaction::factory()->create();
    $product = Product::factory()->create();

    $data = [
        'transaction_id' => $tx->id,
        'product_id' => $product->id,
        'unit_name' => 'BOX',
        'quantity' => 5,
        'cost_price' => 10000,
        'price' => 15000,
    ];

    $created = $this->repository->create($data);

    expect($created)->toBeInstanceOf(TransactionDetail::class)
        ->and($created->unit_name)->toBe('BOX');
});

test('update transaction detail', function () {
    $detail = TransactionDetail::factory()->create(['quantity' => 1]);

    $updated = $this->repository->update($detail, ['quantity' => 3]);

    expect($updated)->toBeTrue()
        ->and($detail->fresh()->quantity)->toBe(3);
});

test('delete transaction detail', function () {
    $detail = TransactionDetail::factory()->create();

    $deleted = $this->repository->delete($detail);

    expect($deleted)->toBeTrue()
        ->and(TransactionDetail::find($detail->id))->toBeNull();
});

test('deleteMany transaction details', function () {
    $details = TransactionDetail::factory()->count(3)->create();
    $ids = $details->pluck('id')->toArray();

    $deletedCount = $this->repository->deleteMany($ids);

    expect($deletedCount)->toBe(3);
});
