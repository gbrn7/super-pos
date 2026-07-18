<?php

namespace App\Services;

use App\Models\TransactionDetail;
use App\Support\Interfaces\Repositories\TransactionDetailRepositoryInterface;
use App\Support\Interfaces\Services\TransactionDetailServiceInterface;
use App\Support\Models\TransactionDetail\GetTransactionDetailReqModel;
use App\Support\Utils\CheckException;
use Exception;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Http\Response;
use Illuminate\Support\Collection;

class TransactionDetailService implements TransactionDetailServiceInterface
{
    public function __construct(protected TransactionDetailRepositoryInterface $transactionDetailRepository) {}

    public function getAllByIndex(GetTransactionDetailReqModel $request): Paginator|Collection
    {
        try {
            return $this->transactionDetailRepository->getAllByIndex($request);
        } catch (\Throwable $th) {
            throw CheckException::Check($th);
        }
    }

    public function getById(int $id): ?TransactionDetail
    {
        try {
            $transactionDetail = $this->transactionDetailRepository->getById($id);

            if (! isset($transactionDetail)) {
                throw new Exception(trans('message.error.data_not_found'), Response::HTTP_NOT_FOUND);
            }

            return $transactionDetail;
        } catch (\Throwable $th) {
            throw CheckException::Check($th);
        }
    }

    public function getByTransactionId(int $transactionId): Collection
    {
        try {
            return $this->transactionDetailRepository->getByTransactionId($transactionId);
        } catch (\Throwable $th) {
            throw CheckException::Check($th);
        }
    }

    public function create(array $data): TransactionDetail
    {
        try {
            return $this->transactionDetailRepository->create($data);
        } catch (\Throwable $th) {
            throw CheckException::Check($th);
        }
    }

    public function update(int $id, array $data): ?TransactionDetail
    {
        try {
            $transactionDetail = $this->transactionDetailRepository->getById($id);

            if (! isset($transactionDetail)) {
                throw new Exception(trans('message.error.data_not_found'), Response::HTTP_NOT_FOUND);
            }

            $isSuccess = $this->transactionDetailRepository->update($transactionDetail, $data);

            if (! $isSuccess) {
                throw new Exception(trans('message.error.internal_server_error'), Response::HTTP_INTERNAL_SERVER_ERROR);
            }

            return $transactionDetail;
        } catch (\Throwable $th) {
            throw CheckException::Check($th);
        }
    }

    public function delete(int $id): bool
    {
        try {
            $transactionDetail = $this->transactionDetailRepository->getById($id);

            if (! isset($transactionDetail)) {
                throw new Exception(trans('message.error.data_not_found'), Response::HTTP_NOT_FOUND);
            }

            $isSuccess = $this->transactionDetailRepository->delete($transactionDetail);

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
            return $this->transactionDetailRepository->deleteMany($ids);
        } catch (\Throwable $th) {
            throw CheckException::Check($th);
        }
    }
}
