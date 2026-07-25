<?php

namespace App\Services;

use App\Models\Transaction;
use App\Support\Interfaces\Repositories\ProductRepositoryInterface;
use App\Support\Interfaces\Repositories\TransactionDetailRepositoryInterface;
use App\Support\Interfaces\Repositories\TransactionRepositoryInterface;
use App\Support\Interfaces\Services\ProfitWalletServiceInterface;
use App\Support\Interfaces\Services\TransactionServiceInterface;
use App\Support\Models\Transaction\GetTransactionReqModel;
use App\Support\Utils\CheckException;
use Exception;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Http\Response;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class TransactionService implements TransactionServiceInterface
{
    public function __construct(
        protected TransactionRepositoryInterface $transactionRepository,
        protected TransactionDetailRepositoryInterface $transactionDetailRepository,
        protected ProductRepositoryInterface $productRepository,
        protected ProfitWalletServiceInterface $profitWalletService
    ) {}

    public function getAllByIndex(GetTransactionReqModel $request): Paginator|Collection
    {
        try {
            return $this->transactionRepository->getAllByIndex($request);
        } catch (\Throwable $th) {
            throw CheckException::Check($th);
        }
    }

    public function getById(int $id): ?Transaction
    {
        try {
            $transaction = $this->transactionRepository->getById($id);

            if (! isset($transaction)) {
                throw new Exception(trans('message.error.data_not_found'), Response::HTTP_NOT_FOUND);
            }

            return $transaction;
        } catch (\Throwable $th) {
            throw CheckException::Check($th);
        }
    }

    public function getByInvoiceNumber(string $invoiceNumber): ?Transaction
    {
        try {
            $transaction = $this->transactionRepository->getByInvoiceNumber($invoiceNumber);

            if (! isset($transaction)) {
                throw new Exception(trans('message.error.data_not_found'), Response::HTTP_NOT_FOUND);
            }

            return $transaction;
        } catch (\Throwable $th) {
            throw CheckException::Check($th);
        }
    }

    public function create(array $data): Transaction
    {
        try {
            return $this->transactionRepository->create($data);
        } catch (\Throwable $th) {
            throw CheckException::Check($th);
        }
    }

    public function update(int $id, array $data): ?Transaction
    {
        try {
            $transaction = $this->transactionRepository->getById($id);

            if (! isset($transaction)) {
                throw new Exception(trans('message.error.data_not_found'), Response::HTTP_NOT_FOUND);
            }

            $isSuccess = $this->transactionRepository->update($transaction, $data);

            if (! $isSuccess) {
                throw new Exception(trans('message.error.internal_server_error'), Response::HTTP_INTERNAL_SERVER_ERROR);
            }

            return $transaction;
        } catch (\Throwable $th) {
            throw CheckException::Check($th);
        }
    }

    public function delete(int $id): bool
    {
        try {
            $transaction = $this->transactionRepository->getById($id);

            if (! isset($transaction)) {
                throw new Exception(trans('message.error.data_not_found'), Response::HTTP_NOT_FOUND);
            }

            $isSuccess = $this->transactionRepository->delete($transaction);

            if (! $isSuccess) {
                throw new Exception(trans('message.error.internal_server_error'), Response::HTTP_INTERNAL_SERVER_ERROR);
            }

            return true;
        } catch (\Throwable $th) {
            throw CheckException::Check($th);
        }
    }

    public function bulkDelete(array $ids): int
    {
        try {
            return $this->transactionRepository->deleteMany($ids);
        } catch (\Throwable $th) {
            throw CheckException::Check($th);
        }
    }

    public function checkout(array $data): Transaction
    {
        try {
            return DB::transaction(function () use ($data) {
                $invoiceNumber = 'INV-'.now()->format('Ymd').'-'.strtoupper(Str::random(6));

                $itemsSubtotal = 0;
                $validatedItems = [];

                foreach ($data['items'] as $item) {
                    $product = $this->productRepository->getById($item['product_id']);

                    if (! isset($product)) {
                        throw new Exception(trans('message.error.data_not_found'), Response::HTTP_NOT_FOUND);
                    }

                    if (! $product->is_active) {
                        throw new Exception(trans('message.error.product_not_active'), Response::HTTP_UNPROCESSABLE_ENTITY);
                    }

                    if (! $product->is_unlimited && $product->stock < $item['quantity']) {
                        throw new Exception(trans('message.error.out_of_stock', ['product' => $product->name]), Response::HTTP_UNPROCESSABLE_ENTITY);
                    }

                    $itemDiscount = $item['discount'] ?? 0;
                    $itemsSubtotal += ($item['price'] - $itemDiscount) * $item['quantity'];

                    $validatedItems[] = [
                        'item' => $item,
                        'product' => $product,
                    ];
                }

                $discountAmount = $data['discount_amount'] ?? 0;
                $totalAmount = max(0, $itemsSubtotal - $discountAmount);
                $paymentAmount = $data['payment_amount'] ?? 0;
                $changeAmount = max(0, $paymentAmount - $totalAmount);

                $transaction = $this->transactionRepository->create([
                    'user_id' => Auth::id(),
                    'payment_method_id' => $data['payment_method_id'],
                    'invoice_number' => $invoiceNumber,
                    'total_amount' => $totalAmount,
                    'discount_amount' => $discountAmount,
                    'payment_amount' => $paymentAmount,
                    'change_amount' => $changeAmount,
                ]);

                $totalCost = 0;
                foreach ($validatedItems as $validated) {
                    $item = $validated['item'];
                    $product = $validated['product'];

                    $this->transactionDetailRepository->create([
                        'transaction_id' => $transaction->id,
                        'product_id' => $item['product_id'],
                        'unit_name' => $item['unit_name'],
                        'quantity' => $item['quantity'],
                        'price' => $item['price'],
                        'cost_price' => $item['cost_price'],
                        'discount' => $item['discount'] ?? 0,
                    ]);

                    $totalCost += $item['cost_price'] * $item['quantity'];

                    if (! $product->is_unlimited) {
                        $this->productRepository->decrementStock($product, $item['quantity']);
                    }
                }

                $profit = $transaction->total_amount - $totalCost;

                // Save net profit to cash_profits table
                $transaction->cashProfit()->create([
                    'profit' => $profit,
                ]);

                // Record sales profit to the store's profit wallet
                $this->profitWalletService->recordSalesProfit($profit, $transaction->id);

                return $transaction->fresh(['transactionDetails.product', 'paymentMethod', 'user', 'cashProfit']);
            });
        } catch (\Throwable $th) {
            throw CheckException::Check($th);
        }
    }
}
