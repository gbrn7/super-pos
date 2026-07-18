<?php

namespace App\Services;

use App\Models\Transaction;
use App\Support\Interfaces\Repositories\TransactionRepositoryInterface;
use App\Support\Interfaces\Services\TransactionServiceInterface;
use App\Support\Models\Transaction\GetTransactionReqModel;
use App\Support\Utils\CheckException;
use Exception;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Http\Response;
use Illuminate\Support\Collection;

class TransactionService implements TransactionServiceInterface
{
    public function __construct(protected TransactionRepositoryInterface $transactionRepository) {}

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
}
