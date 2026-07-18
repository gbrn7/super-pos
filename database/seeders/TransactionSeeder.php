<?php

namespace Database\Seeders;

use App\Models\PaymentMethod;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class TransactionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::all();
        if ($users->isEmpty()) {
            $users = User::factory(3)->create();
        }

        $products = Product::with('unit')->get();
        if ($products->isEmpty()) {
            Product::factory(10)->create();
            $products = Product::with('unit')->get();
        }

        $paymentMethods = PaymentMethod::all();
        if ($paymentMethods->isEmpty()) {
            foreach (['Cash', 'Qris', 'Transfer'] as $pmName) {
                PaymentMethod::create([
                    'name' => $pmName,
                    'created_at' => time(),
                    'updated_at' => time(),
                ]);
            }
            $paymentMethods = PaymentMethod::all();
        }

        // Generate 50 transactions spread across recent dates
        for ($i = 1; $i <= 50; $i++) {
            $user = $users->random();
            $paymentMethod = $paymentMethods->random();
            $createdAt = Carbon::now()->subDays(rand(0, 30))->subHours(rand(0, 23))->subMinutes(rand(0, 59));

            // Select 1 to 5 random products for this transaction
            $sampleSize = rand(1, min(5, $products->count()));
            $selectedProducts = $products->random($sampleSize);

            $detailsData = [];
            $totalAmount = 0;

            foreach ($selectedProducts as $product) {
                $qty = rand(1, 4);
                $price = (float) ($product->price > 0 ? $product->price : 10000);
                $costPrice = (float) ($product->cost_price > 0 ? $product->cost_price : $price * 0.8);
                $subtotal = $price * $qty;

                $totalAmount += $subtotal;

                $unitName = $product->unit?->name ?? 'PCS';

                $detailsData[] = [
                    'product_id' => $product->id,
                    'unit_name' => $unitName,
                    'quantity' => $qty,
                    'cost_price' => $costPrice,
                    'price' => $price,
                    'created_at' => $createdAt,
                    'updated_at' => $createdAt,
                ];
            }

            // Calculate payment amount & change
            if ($paymentMethod->name === 'Cash') {
                $paymentAmount = ceil($totalAmount / 10000) * 10000;
                if ($paymentAmount < $totalAmount) {
                    $paymentAmount = $totalAmount;
                }
            } else {
                $paymentAmount = $totalAmount;
            }

            $changeAmount = $paymentAmount - $totalAmount;
            $invoiceNumber = 'INV-'.$createdAt->format('Ymd').'-'.str_pad((string) $i, 4, '0', STR_PAD_LEFT).'-'.fake()->numerify('######');

            $transaction = Transaction::create([
                'user_id' => $user->id,
                'payment_method_id' => $paymentMethod->id,
                'invoice_number' => $invoiceNumber,
                'total_amount' => $totalAmount,
                'payment_amount' => $paymentAmount,
                'change_amount' => $changeAmount,
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ]);

            foreach ($detailsData as $detail) {
                $detail['transaction_id'] = $transaction->id;
                TransactionDetail::create($detail);
            }
        }
    }
}
