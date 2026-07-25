<?php

use App\Http\Requests\ProfitWallet\DisburseProfitWalletRequest;
use App\Http\Requests\ProfitWallet\IndexProfitWalletRequest;
use App\Http\Requests\ProfitWallet\WithdrawCapitalProfitWalletRequest;
use App\Support\Models\ProfitWallet\DisburseProfitWalletReqModel;
use App\Support\Models\ProfitWallet\GetProfitWalletTransactionReqModel;
use App\Support\Models\ProfitWallet\WithdrawCapitalProfitWalletReqModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

test('index profit wallet request validates filters correctly', function () {
    $rules = (new IndexProfitWalletRequest)->rules();

    $validator = Validator::make([
        'start_date' => 'not-a-date',
        'type' => 'invalid-type',
        'limit' => 200,
    ], $rules);

    expect($validator->fails())->toBeTrue()
        ->and($validator->errors()->has('start_date'))->toBeTrue()
        ->and($validator->errors()->has('type'))->toBeTrue()
        ->and($validator->errors()->has('limit'))->toBeTrue();
});

test('disburse request validates amount requirements', function () {
    $rules = (new DisburseProfitWalletRequest)->rules();

    $validator1 = Validator::make(['amount' => 0.00], $rules);
    $validator2 = Validator::make(['amount' => -100.00], $rules);
    $validator3 = Validator::make(['amount' => 500.50], $rules);

    expect($validator1->fails())->toBeTrue()
        ->and($validator2->fails())->toBeTrue()
        ->and($validator3->fails())->toBeFalse();
});

test('withdraw capital request validates amount requirements', function () {
    $rules = (new WithdrawCapitalProfitWalletRequest)->rules();

    $validator1 = Validator::make(['amount' => 0.00], $rules);
    $validator2 = Validator::make(['amount' => -100.00], $rules);
    $validator3 = Validator::make(['amount' => 500.50], $rules);

    expect($validator1->fails())->toBeTrue()
        ->and($validator2->fails())->toBeTrue()
        ->and($validator3->fails())->toBeFalse();
});

test('request models map request inputs correctly', function () {
    $indexReq = Request::create('/api/profit-wallet', 'GET', [
        'start_date' => '2026-01-01',
        'end_date' => '2026-01-31',
        'type' => 'in',
        'transaction_type' => 'sales_profit',
        'keyword' => 'test',
        'page' => 1,
        'limit' => 15,
    ]);
    $getReqModel = new GetProfitWalletTransactionReqModel($indexReq);

    expect($getReqModel->start_date)->toBe('2026-01-01')
        ->and($getReqModel->end_date)->toBe('2026-01-31')
        ->and($getReqModel->type)->toBe('in')
        ->and($getReqModel->transaction_type)->toBe('sales_profit')
        ->and($getReqModel->keyword)->toBe('test')
        ->and($getReqModel->page)->toBe(1)
        ->and($getReqModel->limit)->toBe(15);

    $disburseReq = Request::create('/api/profit-wallet/disburse', 'POST', [
        'amount' => '150000.50',
        'notes' => 'Payout profit',
    ]);
    $disburseReqModel = new DisburseProfitWalletReqModel($disburseReq);

    expect($disburseReqModel->amount)->toBe(150000.50)
        ->and($disburseReqModel->notes)->toBe('Payout profit');

    $withdrawReq = Request::create('/api/profit-wallet/withdraw-capital', 'POST', [
        'amount' => '50000',
        'notes' => 'Withdraw capital',
    ]);
    $withdrawReqModel = new WithdrawCapitalProfitWalletReqModel($withdrawReq);

    expect($withdrawReqModel->amount)->toBe(50000.0)
        ->and($withdrawReqModel->notes)->toBe('Withdraw capital');
});
