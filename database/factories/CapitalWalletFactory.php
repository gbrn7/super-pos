<?php

namespace Database\Factories;

use App\Models\CapitalWallet;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Carbon;

class CapitalWalletFactory extends Factory
{
    protected $model = CapitalWallet::class;

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
