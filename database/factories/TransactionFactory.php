<?php

namespace Database\Factories;

use App\Models\Transaction;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Transaction>
 */
class TransactionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'payment_method_name' => fake()->word(),
            'invoice_number' => 'INV-'.fake()->unique()->numerify('#####'),
            'total_amount' => 100000,
            'payment_amount' => 100000,
            'change_amount' => 0,
        ];
    }
}
