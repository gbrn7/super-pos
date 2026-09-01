<?php

namespace Database\Seeders;

use App\Models\PaymentMethod;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use App\Models\User;
use App\Support\Interfaces\Services\CapitalWalletServiceInterface;
use App\Support\Interfaces\Services\ProfitWalletServiceInterface;
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
            throw new \RuntimeException('Users data is empty. Please run UserSeeder or ensure users exist before running TransactionSeeder.');
        }

        $products = Product::with('unit')->get();
        if ($products->isEmpty()) {
            throw new \RuntimeException('Products data is empty. Please run ProductSeeder or ensure products exist before running TransactionSeeder.');
        }

        $paymentMethods = PaymentMethod::all();
        if ($paymentMethods->isEmpty()) {
            throw new \RuntimeException('Payment methods data is empty. Please run PaymentMethodSeeder or ensure payment methods exist before running TransactionSeeder.');
        }

        // Generate 200 transactions spread across recent dates
        for ($i = 1; $i <= 200; $i++) {
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
            $invoiceNumber = 'INV-'.$createdAt->format('Ymd').'-'.str_pad((string) $i, 4, '0', STR_PAD_LEFT).'-'.str_pad((string) rand(0, 999999), 6, '0', STR_PAD_LEFT);

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

            $totalCost = 0;
            foreach ($detailsData as $detail) {
                $detail['transaction_id'] = $transaction->id;
                TransactionDetail::create($detail);
                $totalCost += $detail['cost_price'] * $detail['quantity'];

                // Update product sold quantity
                Product::where('id', $detail['product_id'])->increment('sold_quantity', $detail['quantity']);
            }

            // Record mutations in Profit Wallet & Capital Wallet
            $profitService = app(ProfitWalletServiceInterface::class);
            $capitalService = app(CapitalWalletServiceInterface::class);

            $profit = $totalAmount - $totalCost;
            $profitTx = $profitService->recordSalesProfit($profit, $transaction->id);
            $profitTx->update(['created_at' => $createdAt, 'updated_at' => $createdAt]);

            if ($totalCost > 0) {
                $capitalTx = $capitalService->recordSalesCapital($totalCost, $transaction->id);
                $capitalTx->update(['created_at' => $createdAt, 'updated_at' => $createdAt]);
            }
        }
    }
}
