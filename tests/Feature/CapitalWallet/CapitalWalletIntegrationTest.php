<?php

use App\Models\PaymentMethod;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\User;
use App\Support\Interfaces\Services\CapitalWalletServiceInterface;
use App\Support\Interfaces\Services\ProfitWalletServiceInterface;
use App\Support\Interfaces\Services\TransactionServiceInterface;
use App\Support\Models\CapitalWallet\InjectCapitalWalletReqModel;
use App\Support\Models\ProfitWallet\WithdrawCapitalProfitWalletReqModel;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->transactionService = app(TransactionServiceInterface::class);
    $this->profitWalletService = app(ProfitWalletServiceInterface::class);
    $this->capitalWalletService = app(CapitalWalletServiceInterface::class);
});

test('checkout records capital recovery in capital wallet', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $paymentMethod = PaymentMethod::factory()->create();
    $product1 = Product::factory()->create([
        'price' => 10000,
        'cost_price' => 7000,
        'stock' => 10,
        'is_active' => true,
        'is_unlimited' => false,
    ]);
    $product2 = Product::factory()->create([
        'price' => 5000,
        'cost_price' => 3000,
        'stock' => 5,
        'is_active' => true,
        'is_unlimited' => false,
    ]);

    $checkoutData = [
        'payment_method_id' => $paymentMethod->id,
        'discount_amount' => 1000,
        'payment_amount' => 15000,
        'items' => [
            [
                'product_id' => $product1->id,
                'unit_name' => 'PCS',
                'quantity' => 2,
                'price' => 10000,
                'cost_price' => 7000,
                'discount' => 0,
            ],
            [
                'product_id' => $product2->id,
                'unit_name' => 'PCS',
                'quantity' => 1,
                'price' => 5000,
                'cost_price' => 3000,
                'discount' => 0,
            ],
        ],
    ];

    // Total cost = (7000 * 2) + (3000 * 1) = 17000
    // Total price = (10000 * 2) + 5000 = 25000. Less 1000 discount = 24000
    // Profit = 24000 - 17000 = 7000

    $transaction = $this->transactionService->checkout($checkoutData);

    // Verify profit wallet transaction
    $this->assertDatabaseHas('profit_wallet_transactions', [
        'amount' => 7000.00,
        'type' => 'in',
        'transaction_type' => 'sales_profit',
        'reference_id' => $transaction->id,
    ]);

    // Verify capital wallet transaction (sales recovery)
    $this->assertDatabaseHas('capital_wallet_transactions', [
        'amount' => 17000.00,
        'type' => 'in',
        'transaction_type' => 'sales_capital_recovery',
        'reference_id' => $transaction->id,
    ]);

    // Check balance in Capital Wallet
    $wallet = $this->capitalWalletService->getOrCreateWallet();
    expect($wallet->balance)->toEqual(17000.00);
});

test('withdrawing capital from profit wallet triggers reinvestment in capital wallet', function () {
    $transaction = Transaction::factory()->create();

    // 1. Setup balance in Profit Wallet
    $this->profitWalletService->recordSalesProfit(10000.00, $transaction->id);
    $profitWallet = $this->profitWalletService->getOrCreateWallet();
    expect($profitWallet->balance)->toEqual(10000.00);

    // 2. Setup initial balance in Capital Wallet (e.g. 5000.00)
    $this->capitalWalletService->inject(new InjectCapitalWalletReqModel(new Request([
        'amount' => 5000.00,
        'notes' => 'Initial capital',
    ])));
    $capitalWallet = $this->capitalWalletService->getOrCreateWallet();
    expect($capitalWallet->balance)->toEqual(5000.00);

    // 3. Perform Capital Withdrawal / Reinvestment
    $withdrawReq = new WithdrawCapitalProfitWalletReqModel(new Request([
        'amount' => 4000.00,
        'notes' => 'Reinvest 4000 from profit into capital',
    ]));
    $profitTx = $this->profitWalletService->withdrawCapital($withdrawReq);

    // 4. Verify Profit Wallet Balance decreased
    expect($profitWallet->fresh()->balance)->toEqual(6000.00);

    // 5. Verify Capital Wallet Balance increased
    expect($capitalWallet->fresh()->balance)->toEqual(9000.00);

    // 6. Verify Profit Wallet transaction is created
    $this->assertDatabaseHas('profit_wallet_transactions', [
        'id' => $profitTx->id,
        'amount' => 4000.00,
        'type' => 'out',
        'transaction_type' => 'capital_withdrawal',
    ]);

    // 7. Verify Capital Wallet transaction (reinvestment) is created referencing profit wallet transaction
    $this->assertDatabaseHas('capital_wallet_transactions', [
        'amount' => 4000.00,
        'type' => 'in',
        'transaction_type' => 'reinvestment',
        'reference_id' => $profitTx->id,
        'reference_type' => get_class($profitTx),
    ]);
});
