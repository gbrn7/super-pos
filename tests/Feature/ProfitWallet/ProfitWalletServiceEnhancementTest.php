<?php

use App\Support\Interfaces\Services\ProfitWalletServiceInterface;
use App\Support\Models\ProfitWallet\DisburseProfitWalletReqModel;
use App\Support\Models\ProfitWallet\GetProfitWalletTransactionReqModel;
use App\Support\Models\ProfitWallet\WithdrawCapitalProfitWalletReqModel;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->service = app(ProfitWalletServiceInterface::class);
});

test('service getTransactions returns correct paginated items and summary', function () {
    $wallet = $this->service->getOrCreateWallet();
    $this->service->recordSalesProfit(1000.00, 1);
    $this->service->recordSalesProfit(500.00, 2);

    $req = new GetProfitWalletTransactionReqModel(new Request(['limit' => 10]));
    $list = $this->service->getTransactions($req);
    $summary = $this->service->getTransactionSummary($req);

    expect($list)->toHaveCount(2)
        ->and($summary['current_balance'])->toEqual(1500.00)
        ->and($summary['total_inflow'])->toEqual(1500.00)
        ->and($summary['total_outflow'])->toEqual(0.00);
});

test('service disburse accepts DisburseProfitWalletReqModel', function () {
    $wallet = $this->service->getOrCreateWallet();
    $this->service->recordSalesProfit(1000.00, 1);

    $disburseReq = new DisburseProfitWalletReqModel(new Request(['amount' => 400.00, 'notes' => 'Weekly payout']));
    $tx = $this->service->disburse($disburseReq);

    expect($tx->balance_after)->toEqual(600.00)
        ->and($tx->notes)->toBe('Weekly payout');
});

test('service withdrawCapital accepts WithdrawCapitalProfitWalletReqModel', function () {
    $wallet = $this->service->getOrCreateWallet();
    $this->service->recordSalesProfit(1000.00, 1);

    $withdrawReq = new WithdrawCapitalProfitWalletReqModel(new Request(['amount' => 300.00, 'notes' => 'Business expansion']));
    $tx = $this->service->withdrawCapital($withdrawReq);

    expect($tx->balance_after)->toEqual(700.00)
        ->and($tx->notes)->toBe('Business expansion');
});
