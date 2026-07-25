<?php

use App\Models\Transaction;
use App\Support\Interfaces\Services\ProfitWalletServiceInterface;
use App\Support\Models\ProfitWallet\DisburseProfitWalletReqModel;
use App\Support\Models\ProfitWallet\WithdrawCapitalProfitWalletReqModel;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->service = app(ProfitWalletServiceInterface::class);
});

test('service handles top-ups, disbursements, and reinvestments correctly', function () {
    $wallet = $this->service->getOrCreateWallet();
    expect($wallet->balance)->toEqual(0.00);

    $transaction = Transaction::factory()->create();

    // 1. Sales profit update
    $tx1 = $this->service->recordSalesProfit(1000.00, $transaction->id);
    expect($tx1->balance_before)->toEqual(0.00)
        ->and($tx1->balance_after)->toEqual(1000.00)
        ->and($tx1->type)->toBe('in')
        ->and($tx1->transaction_type)->toBe('sales_profit');

    expect($wallet->fresh()->balance)->toEqual(1000.00);

    // 2. Disbursement
    $tx2 = $this->service->disburse(new DisburseProfitWalletReqModel(new Request(['amount' => 300.00, 'notes' => 'Test disburse'])));
    expect($tx2->balance_before)->toEqual(1000.00)
        ->and($tx2->balance_after)->toEqual(700.00)
        ->and($tx2->type)->toBe('out')
        ->and($tx2->transaction_type)->toBe('disbursement');

    expect($wallet->fresh()->balance)->toEqual(700.00);

    // 3. Capital Withdrawal
    $tx3 = $this->service->withdrawCapital(new WithdrawCapitalProfitWalletReqModel(new Request(['amount' => 200.00, 'notes' => 'Test capital'])));
    expect($tx3->balance_before)->toEqual(700.00)
        ->and($tx3->balance_after)->toEqual(500.00)
        ->and($tx3->type)->toBe('out')
        ->and($tx3->transaction_type)->toBe('capital_withdrawal');

    expect($wallet->fresh()->balance)->toEqual(500.00);
});

test('disburse throws exception on insufficient balance', function () {
    $this->service->getOrCreateWallet();
    $this->service->disburse(new DisburseProfitWalletReqModel(new Request(['amount' => 100.00])));
})->throws(Exception::class);

test('disburse throws exception on zero or negative amount', function (float $amount) {
    $wallet = $this->service->getOrCreateWallet();
    $this->service->recordSalesProfit(1000.00, 1);
    $this->service->disburse(new DisburseProfitWalletReqModel(new Request(['amount' => $amount])));
})->with([0.0, -100.0])->throws(Exception::class);

test('withdrawCapital throws exception on zero or negative amount', function (float $amount) {
    $wallet = $this->service->getOrCreateWallet();
    $this->service->recordSalesProfit(1000.00, 1);
    $this->service->withdrawCapital(new WithdrawCapitalProfitWalletReqModel(new Request(['amount' => $amount])));
})->with([0.0, -500.0])->throws(Exception::class);

test('recordSalesProfit handles negative profit correctly', function () {
    $wallet = $this->service->getOrCreateWallet();
    $transaction = Transaction::factory()->create();

    // Setup initial balance
    $this->service->recordSalesProfit(1000.00, $transaction->id);
    expect($wallet->fresh()->balance)->toEqual(1000.00);

    // Negative profit (loss)
    $tx = $this->service->recordSalesProfit(-200.00, $transaction->id);

    expect($tx->balance_before)->toEqual(1000.00)
        ->and($tx->balance_after)->toEqual(800.00)
        ->and($tx->amount)->toEqual(200.00)
        ->and($tx->type)->toBe('out')
        ->and($tx->transaction_type)->toBe('sales_profit');

    expect($wallet->fresh()->balance)->toEqual(800.00);
});
