<?php

use App\Http\Resources\TransactionResource;
use App\Models\CapitalWalletTransaction;
use App\Models\Product;
use App\Models\ProductReturn;
use App\Models\ProfitWalletTransaction;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use App\Models\User;
use App\Services\ReturnService;
use App\Support\Interfaces\Services\CapitalWalletServiceInterface;
use App\Support\Interfaces\Services\ProfitWalletServiceInterface;
use App\Support\Models\CapitalWallet\InjectCapitalWalletReqModel;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;

uses(RefreshDatabase::class);

test('return service processes partial return and updates product stock and wallets correctly', function () {
    $user = User::factory()->create();
    $product = Product::factory()->create(['stock' => 10]);

    // Initialize/Inject balances to Capital and Profit wallets
    $capitalService = resolve(CapitalWalletServiceInterface::class);
    $profitService = resolve(ProfitWalletServiceInterface::class);

    $capitalService->inject(new InjectCapitalWalletReqModel(new Request([
        'amount' => 50000.00,
        'notes' => 'Initial capital',
    ])));

    $profitWallet = $profitService->getOrCreateWallet();
    $profitService->recordSalesProfit(20000.00, 9999); // Seed some profit balance

    $transaction = Transaction::factory()->create();
    TransactionDetail::create([
        'transaction_id' => $transaction->id,
        'product_id' => $product->id,
        'unit_name' => 'Pcs',
        'quantity' => 5,
        'price' => 20000,
        'cost_price' => 15000,
        'discount' => 0,
    ]);

    $service = resolve(ReturnService::class);
    $return = $service->processReturn(
        transactionId: $transaction->id,
        items: [
            ['product_id' => $product->id, 'quantity' => 2],
        ],
        reason: 'Customer tukar ukuran',
        user: $user
    );

    expect($return)->not->toBeNull();
    expect((float) $return->total_refund_amount)->toEqual(40000.0);
    expect($product->fresh()->stock)->toBe(12);

    // Assert Capital Wallet deduction
    // Initial: 50000, Deducted: 2 * 15000 = 30000, Remaining: 20000
    $capitalWallet = $capitalService->getOrCreateWallet();
    expect((float) $capitalWallet->balance)->toEqual(20000.0);

    $capitalTx = CapitalWalletTransaction::where('reference_id', $return->id)
        ->where('reference_type', ProductReturn::class)
        ->first();
    expect($capitalTx)->not->toBeNull();
    expect((float) $capitalTx->amount)->toEqual(30000.0);
    expect($capitalTx->type)->toBe('out');
    expect($capitalTx->transaction_type)->toBe('sales_return_deduction');

    // Assert Profit Wallet deduction
    // Initial: 20000, Deducted: 2 * (20000 - 15000) = 10000, Remaining: 10000
    $profitWallet = $profitService->getOrCreateWallet();
    expect((float) $profitWallet->balance)->toEqual(10000.0);

    $profitTx = ProfitWalletTransaction::where('reference_id', $return->id)
        ->where('reference_type', ProductReturn::class)
        ->first();
    expect($profitTx)->not->toBeNull();
    expect((float) $profitTx->amount)->toEqual(10000.0);
    expect($profitTx->type)->toBe('out');
    expect($profitTx->transaction_type)->toBe('sales_return_deduction');
});

test('transaction detail resource returns returned_quantity when returns relation is loaded', function () {
    $product = Product::factory()->create();
    $transaction = Transaction::factory()->create();
    $detail = TransactionDetail::create([
        'transaction_id' => $transaction->id,
        'product_id' => $product->id,
        'unit_name' => 'Pcs',
        'quantity' => 5,
        'price' => 20000,
        'cost_price' => 15000,
        'discount' => 0,
    ]);

    $user = User::factory()->create();
    $service = resolve(ReturnService::class);
    $service->processReturn($transaction->id, [['product_id' => $product->id, 'quantity' => 2]], 'Reason', $user);

    $freshTx = Transaction::with(['returns.details', 'transactionDetails'])->find($transaction->id);
    $resource = new TransactionResource($freshTx);
    $response = $resource->response()->getData(true);

    $returnedQty = $response['data']['details'][0]['returned_quantity'];
    expect($returnedQty)->toBe(2);
});
