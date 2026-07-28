<?php

namespace App\Services;

use App\Models\ReturnModel;
use App\Models\Transaction;
use App\Models\User;
use App\Support\Interfaces\Repositories\ProductRepositoryInterface;
use App\Support\Interfaces\Repositories\ReturnRepositoryInterface;
use App\Support\Interfaces\Services\ReturnServiceInterface;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use InvalidArgumentException;

class ReturnService implements ReturnServiceInterface
{
    public function __construct(
        protected ReturnRepositoryInterface $returnRepository,
        protected ProductRepositoryInterface $productRepository
    ) {}

    public function getAll(int $limit = 10): Paginator|Collection
    {
        return $this->returnRepository->getAll($limit);
    }

    public function processReturn(Transaction $transaction, array $items, ?string $reason, User $user): ReturnModel
    {
        return DB::transaction(function () use ($transaction, $items, $reason, $user) {
            $totalRefund = 0;
            $returnDetailsData = [];

            // Load transaction details
            $transaction->load('transactionDetails');
            $existingReturns = $this->returnRepository->getByTransactionId($transaction->id);

            foreach ($items as $item) {
                $productId = $item['product_id'];
                $returnQty = (int) $item['quantity'];

                if ($returnQty <= 0) {
                    continue;
                }

                $txDetail = $transaction->transactionDetails->where('product_id', $productId)->first();
                if (! $txDetail) {
                    throw new InvalidArgumentException("Product ID {$productId} is not in transaction.");
                }

                // Calculate already returned qty
                $alreadyReturnedQty = $existingReturns->flatMap->details
                    ->where('product_id', $productId)
                    ->sum('quantity');

                $maxReturnable = $txDetail->quantity - $alreadyReturnedQty;

                if ($returnQty > $maxReturnable) {
                    throw new InvalidArgumentException("Return quantity ({$returnQty}) exceeds maximum returnable quantity ({$maxReturnable}).");
                }

                $pricePerUnit = $txDetail->price;
                $subtotal = $returnQty * $pricePerUnit;
                $totalRefund += $subtotal;

                $returnDetailsData[] = [
                    'product_id' => $productId,
                    'quantity' => $returnQty,
                    'price_per_unit' => $pricePerUnit,
                    'subtotal' => $subtotal,
                ];
            }

            if (empty($returnDetailsData)) {
                throw new InvalidArgumentException('No valid items to return.');
            }

            $returnModel = $this->returnRepository->create([
                'return_number' => 'RET-'.date('Ymd').'-'.strtoupper(Str::random(4)),
                'transaction_id' => $transaction->id,
                'user_id' => $user->id,
                'total_refund_amount' => $totalRefund,
                'reason' => $reason,
            ]);

            foreach ($returnDetailsData as $detail) {
                $this->returnRepository->createDetail([
                    'return_id' => $returnModel->id,
                    'product_id' => $detail['product_id'],
                    'quantity' => $detail['quantity'],
                    'price_per_unit' => $detail['price_per_unit'],
                    'subtotal' => $detail['subtotal'],
                ]);

                // Restore Product Stock via ProductRepositoryInterface
                $productObj = $this->productRepository->getById($detail['product_id']);
                if ($productObj) {
                    $this->productRepository->incrementStock($productObj, $detail['quantity']);
                }
            }

            return $returnModel;
        });
    }
}
