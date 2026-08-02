<?php

namespace Database\Factories;

use App\Models\CapitalWallet;
use App\Models\CapitalWalletTransaction;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Carbon;

class CapitalWalletTransactionFactory extends Factory
{
    protected $model = CapitalWalletTransaction::class;

    public function definition(): array
    {
        return [
            'capital_wallet_id' => CapitalWallet::factory(),
            'amount' => 5000.00,
            'type' => 'in',
            'transaction_type' => 'capital_injection',
            'balance_before' => 0.00,
            'balance_after' => 5000.00,
            'notes' => 'Test Transaction',
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ];
    }
}
