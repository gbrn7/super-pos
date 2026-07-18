<?php

use App\Models\Product;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use App\Support\Interfaces\Services\TransactionDetailServiceInterface;
use App\Support\Models\TransactionDetail\GetTransactionDetailReqModel;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->service = app(TransactionDetailServiceInterface::class);
});

test('getAllByIndex returns transaction details via service', function () {
    TransactionDetail::factory()->count(2)->create();

    $reqModel = new GetTransactionDetailReqModel(new Request([]));
    $result = $this->service->getAllByIndex($reqModel);

    expect($result)->toHaveCount(2);
});

test('getById returns transaction detail via service', function () {
    $detail = TransactionDetail::factory()->create();

    $found = $this->service->getById($detail->id);

    expect($found)->not->toBeNull()
        ->and($found->id)->toBe($detail->id);
});

test('getById throws exception when transaction detail not found', function () {
    $this->service->getById(999999);
})->throws(Exception::class);

test('getByTransactionId returns transaction details via service', function () {
    $tx = Transaction::factory()->create();
    TransactionDetail::factory()->count(2)->create(['transaction_id' => $tx->id]);

    $results = $this->service->getByTransactionId($tx->id);

    expect($results)->toHaveCount(2);
});

test('create transaction detail via service', function () {
    $tx = Transaction::factory()->create();
    $product = Product::factory()->create();

    $created = $this->service->create([
        'transaction_id' => $tx->id,
        'product_id' => $product->id,
        'unit_name' => 'PACK',
        'quantity' => 2,
        'cost_price' => 20000,
        'price' => 25000,
    ]);

    expect($created)->toBeInstanceOf(TransactionDetail::class)
        ->and($created->unit_name)->toBe('PACK');
});

test('update transaction detail via service', function () {
    $detail = TransactionDetail::factory()->create(['quantity' => 1]);

    $updated = $this->service->update($detail->id, ['quantity' => 4]);

    expect($updated)->not->toBeNull()
        ->and($updated->quantity)->toBe(4);
});

test('delete transaction detail via service', function () {
    $detail = TransactionDetail::factory()->create();

    $result = $this->service->delete($detail->id);

    expect($result)->toBeTrue()
        ->and(TransactionDetail::find($detail->id))->toBeNull();
});

test('bulkDelete transaction details via service', function () {
    $details = TransactionDetail::factory()->count(3)->create();
    $ids = $details->pluck('id')->toArray();

    $count = $this->service->bulkDelete($ids);

    expect($count)->toBe(3);
});
