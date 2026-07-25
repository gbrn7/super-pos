<?php

use App\Models\ProfitWalletTransaction;
use App\Models\Transaction;
use App\Support\Interfaces\Services\CapitalWalletServiceInterface;
use App\Support\Models\CapitalWallet\DrawdownCapitalWalletReqModel;
use App\Support\Models\CapitalWallet\GetCapitalWalletTransactionReqModel;
use App\Support\Models\CapitalWallet\InjectCapitalWalletReqModel;
use App\Support\Models\CapitalWallet\PurchaseProductCapitalWalletReqModel;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->service = app(CapitalWalletServiceInterface::class);
});

test('service handles wallet creation and basic operations correctly', function () {
    $wallet = $this->service->getOrCreateWallet();
    expect($wallet->balance)->toEqual(0.00);

    // 1. Inject
    $tx1 = $this->service->inject(new InjectCapitalWalletReqModel(new Request([
        'amount' => 1000.00,
        'notes' => 'Injection test',
    ])));
    expect($tx1->balance_before)->toEqual(0.00)
        ->and($tx1->balance_after)->toEqual(1000.00)
        ->and($tx1->type)->toBe('in')
        ->and($tx1->transaction_type)->toBe('capital_injection')
        ->and($tx1->notes)->toBe('Injection test');

    expect($wallet->fresh()->balance)->toEqual(1000.00);

    // 2. Sales capital recovery
    $transaction = Transaction::factory()->create();
    $tx2 = $this->service->recordSalesCapital(500.00, $transaction->id);
    expect($tx2->balance_before)->toEqual(1000.00)
        ->and($tx2->balance_after)->toEqual(1500.00)
        ->and($tx2->type)->toBe('in')
        ->and($tx2->transaction_type)->toBe('sales_capital_recovery')
        ->and($tx2->reference_id)->toBe($transaction->id);

    expect($wallet->fresh()->balance)->toEqual(1500.00);

    // 3. Reinvestment
    $profitTx = ProfitWalletTransaction::factory()->create();
    $tx3 = $this->service->recordReinvestment(300.00, $profitTx->id);
    expect($tx3->balance_before)->toEqual(1500.00)
        ->and($tx3->balance_after)->toEqual(1800.00)
        ->and($tx3->type)->toBe('in')
        ->and($tx3->transaction_type)->toBe('reinvestment')
        ->and($tx3->reference_id)->toBe($profitTx->id);

    expect($wallet->fresh()->balance)->toEqual(1800.00);

    // 4. Drawdown
    $tx4 = $this->service->drawdown(new DrawdownCapitalWalletReqModel(new Request([
        'amount' => 200.00,
        'notes' => 'Drawdown notes',
    ])));
    expect($tx4->balance_before)->toEqual(1800.00)
        ->and($tx4->balance_after)->toEqual(1600.00)
        ->and($tx4->type)->toBe('out')
        ->and($tx4->transaction_type)->toBe('capital_drawdown')
        ->and($tx4->notes)->toBe('Drawdown notes');

    expect($wallet->fresh()->balance)->toEqual(1600.00);

    // 5. Purchase Product
    $tx5 = $this->service->purchaseProduct(new PurchaseProductCapitalWalletReqModel(new Request([
        'amount' => 400.00,
        'notes' => 'Purchase product notes',
    ])));
    expect($tx5->balance_before)->toEqual(1600.00)
        ->and($tx5->balance_after)->toEqual(1200.00)
        ->and($tx5->type)->toBe('out')
        ->and($tx5->transaction_type)->toBe('product_purchase')
        ->and($tx5->notes)->toBe('Purchase product notes');

    expect($wallet->fresh()->balance)->toEqual(1200.00);
});

test('drawdown throws exception on insufficient balance', function () {
    $this->service->getOrCreateWallet();
    $this->service->drawdown(new DrawdownCapitalWalletReqModel(new Request([
        'amount' => 100.00,
        'notes' => 'Insufficient drawdown',
    ])));
})->throws(Exception::class);

test('purchaseProduct throws exception on insufficient balance', function () {
    $this->service->getOrCreateWallet();
    $this->service->purchaseProduct(new PurchaseProductCapitalWalletReqModel(new Request([
        'amount' => 100.00,
        'notes' => 'Insufficient purchase',
    ])));
})->throws(Exception::class);

test('inject throws exception on zero or negative amount', function (float $amount) {
    $this->service->getOrCreateWallet();
    $this->service->inject(new InjectCapitalWalletReqModel(new Request([
        'amount' => $amount,
        'notes' => 'Invalid inject',
    ])));
})->with([0.0, -10.0])->throws(Exception::class);

test('drawdown throws exception on zero or negative amount', function (float $amount) {
    $this->service->getOrCreateWallet();
    $this->service->inject(new InjectCapitalWalletReqModel(new Request([
        'amount' => 100.00,
        'notes' => 'Setup',
    ])));
    $this->service->drawdown(new DrawdownCapitalWalletReqModel(new Request([
        'amount' => $amount,
        'notes' => 'Invalid drawdown',
    ])));
})->with([0.0, -10.0])->throws(Exception::class);

test('purchaseProduct throws exception on zero or negative amount', function (float $amount) {
    $this->service->getOrCreateWallet();
    $this->service->inject(new InjectCapitalWalletReqModel(new Request([
        'amount' => 100.00,
        'notes' => 'Setup',
    ])));
    $this->service->purchaseProduct(new PurchaseProductCapitalWalletReqModel(new Request([
        'amount' => $amount,
        'notes' => 'Invalid purchase',
    ])));
})->with([0.0, -10.0])->throws(Exception::class);

test('recordSalesCapital throws exception on zero or negative amount', function (float $amount) {
    $this->service->getOrCreateWallet();
    $this->service->recordSalesCapital($amount, 1);
})->with([0.0, -10.0])->throws(Exception::class);

test('recordReinvestment throws exception on zero or negative amount', function (float $amount) {
    $this->service->getOrCreateWallet();
    $this->service->recordReinvestment($amount, 1);
})->with([0.0, -10.0])->throws(Exception::class);

test('transactions can be listed and summarized', function () {
    $this->service->getOrCreateWallet();
    $this->service->inject(new InjectCapitalWalletReqModel(new Request([
        'amount' => 1000.00,
        'notes' => 'Injection matching keyword ABC',
    ])));
    $this->service->drawdown(new DrawdownCapitalWalletReqModel(new Request([
        'amount' => 200.00,
        'notes' => 'Drawdown matching keyword XYZ',
    ])));

    $reqModel = new GetCapitalWalletTransactionReqModel(new Request([
        'keyword' => 'ABC',
    ]));

    $transactions = $this->service->getTransactions($reqModel);
    expect($transactions)->toHaveCount(1)
        ->and($transactions->first()->notes)->toContain('ABC');

    $summary = $this->service->getTransactionSummary($reqModel);
    expect($summary['current_balance'])->toEqual(800.00)
        ->and($summary['total_inflow'])->toEqual(1000.00)
        ->and($summary['total_outflow'])->toEqual(0.00);
});
