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
use Illuminate\Support\Facades\DB;

class TransactionSeeder extends Seeder
{
    public function __construct(public int $count = 10000) {}

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        @set_time_limit(0);
        @ini_set('memory_limit', '512M');

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

        $profitService = app(ProfitWalletServiceInterface::class);
        $capitalService = app(CapitalWalletServiceInterface::class);

        $totalCount = app()->environment('testing') && $this->count === 10000 ? 10 : $this->count;
        $batchSize = 250;
        $productSoldQuantities = [];

        for ($chunkStart = 1; $chunkStart <= $totalCount; $chunkStart += $batchSize) {
            $chunkEnd = min($chunkStart + $batchSize - 1, $totalCount);

            DB::transaction(function () use ($chunkStart, $chunkEnd, $users, $paymentMethods, $products, &$productSoldQuantities, $profitService, $capitalService) {
                for ($i = $chunkStart; $i <= $chunkEnd; $i++) {
                    $user = $users->random();
                    $paymentMethod = $paymentMethods->random();
                    $createdAt = Carbon::now()->subDays(rand(0, 30))->subHours(rand(0, 23))->subMinutes(rand(0, 59));

                    // Select 1 to 5 random products for this transaction
                    $sampleSize = rand(1, min(5, $products->count()));
                    $selectedProducts = $products->random($sampleSize);

                    $detailsData = [];
                    $totalAmount = 0;
                    $totalCost = 0;

                    foreach ($selectedProducts as $product) {
                        $qty = rand(1, 4);
                        $price = (float) ($product->price > 0 ? $product->price : 10000);
                        $costPrice = (float) ($product->cost_price > 0 ? $product->cost_price : $price * 0.8);
                        $subtotal = $price * $qty;

                        $totalAmount += $subtotal;
                        $totalCost += $costPrice * $qty;

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

                        $productSoldQuantities[$product->id] = ($productSoldQuantities[$product->id] ?? 0) + $qty;
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

                    foreach ($detailsData as &$detail) {
                        $detail['transaction_id'] = $transaction->id;
                    }
                    unset($detail);

                    TransactionDetail::insert($detailsData);

                    $profit = $totalAmount - $totalCost;
                    $profitTx = $profitService->recordSalesProfit($profit, $transaction->id);
                    $profitTx->update(['created_at' => $createdAt, 'updated_at' => $createdAt]);

                    if ($totalCost > 0) {
                        $capitalTx = $capitalService->recordSalesCapital($totalCost, $transaction->id);
                        $capitalTx->update(['created_at' => $createdAt, 'updated_at' => $createdAt]);
                    }
                }
            });
        }

        // Bulk update product sold quantities
        if (! empty($productSoldQuantities)) {
            DB::transaction(function () use ($productSoldQuantities) {
                foreach ($productSoldQuantities as $productId => $qty) {
                    Product::where('id', $productId)->increment('sold_quantity', $qty);
                }
            });
        }
    }
}
