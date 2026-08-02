<?php

namespace Database\Factories;

use App\Models\ProfitWallet;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Carbon;

class ProfitWalletFactory extends Factory
{
    protected $model = ProfitWallet::class;

    public function definition(): array
    {
        return [
            'balance' => 0.00,
            'status' => 'active',
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ];
    }
}
