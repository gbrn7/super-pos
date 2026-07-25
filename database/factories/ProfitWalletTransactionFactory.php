<?php

namespace Database\Factories;

use App\Models\ProfitWallet;
use App\Models\ProfitWalletTransaction;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Carbon;

class ProfitWalletTransactionFactory extends Factory
{
    protected $model = ProfitWalletTransaction::class;

    public function definition(): array
    {
        return [
            'profit_wallet_id' => ProfitWallet::factory(),
            'amount' => 5000.00,
            'type' => 'in',
            'transaction_type' => 'sales_profit',
            'balance_before' => 0.00,
            'balance_after' => 5000.00,
            'notes' => 'Test Transaction',
            'created_at' => Carbon::now()->unix(),
            'updated_at' => Carbon::now()->unix(),
        ];
    }
}
