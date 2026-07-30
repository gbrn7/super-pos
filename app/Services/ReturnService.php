<?php

namespace App\Services;

use App\Models\ProductReturn;
use App\Models\Transaction;
use App\Models\User;
use App\Support\Interfaces\Repositories\ProductRepositoryInterface;
use App\Support\Interfaces\Repositories\ReturnRepositoryInterface;
use App\Support\Interfaces\Repositories\TransactionRepositoryInterface;
use App\Support\Interfaces\Services\CapitalWalletServiceInterface;
use App\Support\Interfaces\Services\ProfitWalletServiceInterface;
use App\Support\Interfaces\Services\ReturnServiceInterface;
use App\Support\Models\ProductReturn\GetProductReturnReqModel;
use App\Support\Utils\CheckException;
use Exception;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use InvalidArgumentException;
use Symfony\Component\HttpFoundation\Response;

class ReturnService implements ReturnServiceInterface
{
    public function __construct(
        protected ReturnRepositoryInterface $returnRepository,
        protected ProductRepositoryInterface $productRepository,
        protected TransactionRepositoryInterface $transactionRepository,
        protected CapitalWalletServiceInterface $capitalWalletService,
        protected ProfitWalletServiceInterface $profitWalletService
    ) {}

    public function getAll(GetProductReturnReqModel $request): Paginator|Collection
    {
        try {
            return $this->returnRepository->getAll($request);
        } catch (\Throwable $th) {
            throw CheckException::Check($th);
        }
    }

    public function processReturn(int $transactionId, array $items, ?string $reason, User $user): ProductReturn
    {
        try {
            $transaction = $this->transactionRepository->getById($transactionId);
            if (! $transaction) {
                throw new Exception(
                    trans('message.error.data_not_found'),
                    Response::HTTP_NOT_FOUND
                );
            }

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
                        throw new InvalidArgumentException(
                            trans('message.error.returns.product_not_in_transaction', ['product_id' => $productId]),
                            Response::HTTP_UNPROCESSABLE_ENTITY
                        );
                    }

                    // Calculate already returned qty
                    $alreadyReturnedQty = $existingReturns->flatMap->details
                        ->where('product_id', $productId)
                        ->sum('quantity');

                    $maxReturnable = $txDetail->quantity - $alreadyReturnedQty;

                    if ($returnQty > $maxReturnable) {
                        throw new InvalidArgumentException(
                            trans('message.error.returns.return_qty_exceeds_max', [
                                'return_qty' => $returnQty,
                                'max_returnable' => $maxReturnable,
                            ]),
                            Response::HTTP_UNPROCESSABLE_ENTITY
                        );
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
                    throw new InvalidArgumentException(
                        trans('message.error.returns.no_valid_items'),
                        Response::HTTP_UNPROCESSABLE_ENTITY
                    );
                }

                $returnModel = $this->returnRepository->create([
                    'return_number' => 'RET-'.date('Ymd').'-'.strtoupper(Str::random(4)),
                    'transaction_id' => $transaction->id,
                    'user_id' => $user->id,
                    'total_refund_amount' => $totalRefund,
                    'reason' => $reason,
                ]);

                $totalCapitalDeduction = 0;
                $totalProfitDeduction = 0;

                foreach ($returnDetailsData as $detail) {
                    $this->returnRepository->createDetail([
                        'return_id' => $returnModel->id,
                        'product_id' => $detail['product_id'],
                        'quantity' => $detail['quantity'],
                        'price_per_unit' => $detail['price_per_unit'],
                        'subtotal' => $detail['subtotal'],
                    ]);

                    // Get cost price from original transaction details
                    $txDetail = $transaction->transactionDetails->where('product_id', $detail['product_id'])->first();
                    $costPrice = $txDetail ? (float) $txDetail->cost_price : 0.0;

                    $capitalCost = $detail['quantity'] * $costPrice;
                    $profit = $detail['subtotal'] - $capitalCost;

                    $totalCapitalDeduction += $capitalCost;
                    $totalProfitDeduction += $profit;

                    // Restore Product Stock via ProductRepositoryInterface
                    $productObj = $this->productRepository->getById($detail['product_id']);
                    if ($productObj) {
                        $this->productRepository->incrementStock($productObj, $detail['quantity']);
                        $this->productRepository->decrementSoldQuantity($productObj, $detail['quantity']);
                    }
                }

                if ($totalCapitalDeduction > 0) {
                    $this->capitalWalletService->recordReturnCapitalDeduction($totalCapitalDeduction, $returnModel->id, $transaction->invoice_number);
                }

                if ($totalProfitDeduction > 0) {
                    $this->profitWalletService->recordReturnProfitDeduction($totalProfitDeduction, $returnModel->id, $transaction->invoice_number);
                }

                return $returnModel;
            });
        } catch (\Throwable $th) {
            throw CheckException::Check($th);
        }
    }
}
