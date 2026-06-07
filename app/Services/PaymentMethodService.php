<?php

namespace App\Services;

use App\Models\PaymentMethod;
use App\Support\Constants\Constants;
use App\Support\Interfaces\Repositories\PaymentMethodRepositoryInterface;
use App\Support\Interfaces\Services\PaymentMethodServiceInterface;
use App\Support\Models\PaymentMethod\GetPaymentMethodReqModel;
use App\Support\Utils\CheckException;
use Exception;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Http\Response;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PaymentMethodService implements PaymentMethodServiceInterface
{
    public function __construct(protected PaymentMethodRepositoryInterface $paymentMethodRepository) {}

    public function getAllByIndex(GetPaymentMethodReqModel $request): Paginator|Collection
    {
        try {
            return $this->paymentMethodRepository->getAllByIndex($request);
        } catch (\Throwable $th) {
            dd($th->getMessage());
            throw CheckException::Check($th);
        }
    }

    public function getById(int $id): ?PaymentMethod
    {
        try {
            return $this->paymentMethodRepository->getById($id);
        } catch (\Throwable $th) {
            throw CheckException::Check($th);
        }
    }

    public function create(array $data): PaymentMethod
    {
        try {
            $isPaymentMethodExist = $this->paymentMethodRepository->getByName($data['name']);

            if (isset($isPaymentMethodExist)) {
                throw new Exception(trans('message.error.data_already_exists'), Response::HTTP_UNPROCESSABLE_ENTITY);
            }

            if (isset($data['image']) && $data['image'] instanceof UploadedFile) {
                $fileName = Str::random(10) . $data['image']->getClientOriginalName();
                $data['image']->storeAs(Constants::PAYMENT_METHOD_PUBLIC_PATH, $fileName, 'public');
                $data['image'] = Constants::PAYMENT_METHOD_PUBLIC_PATH . $fileName;
            }

            return $this->paymentMethodRepository->create($data);
        } catch (\Throwable $th) {
            throw CheckException::Check($th);
        }
    }

    public function update(int $id, array $data): ?PaymentMethod
    {
        try {
            $paymentMethod = $this->paymentMethodRepository->getById($id);

            if (!isset($paymentMethod)) {
                throw new Exception(trans("message.error.data_not_found"), Response::HTTP_NOT_FOUND);
            }

            $isPaymentMethodExist = $this->paymentMethodRepository->getByNameExceptID($data['name'], $id);

            if (isset($isPaymentMethodExist)) {
                throw new Exception(trans('message.error.data_already_exists'), Response::HTTP_UNPROCESSABLE_ENTITY);
            }

            if (isset($data['image']) && $data['image'] instanceof UploadedFile) {
                if ($paymentMethod->image && Storage::disk('public')->exists($paymentMethod->image)) {
                    Storage::disk('public')->delete($paymentMethod->image);
                }

                $fileName = Str::random(10) . $data['image']->getClientOriginalName();
                $data['image']->storeAs(Constants::PAYMENT_METHOD_PUBLIC_PATH, $fileName, 'public');
                $data['image'] = Constants::PAYMENT_METHOD_PUBLIC_PATH . $fileName;
            }

            $isSuccess = $this->paymentMethodRepository->update($paymentMethod, $data);

            if (! $isSuccess) {
                throw new Exception(trans('message.error.internal_server_error'), Response::HTTP_INTERNAL_SERVER_ERROR);
            }

            return $paymentMethod;
        } catch (\Throwable $th) {
            throw CheckException::Check($th);
        }
    }

    public function delete(int $id): bool
    {
        try {
            $paymentMethod = $this->paymentMethodRepository->getById($id);

            if (!isset($paymentMethod)) {
                throw new Exception(trans("message.error.data_not_found"), Response::HTTP_NOT_FOUND);
            }

            if ($paymentMethod->image && Storage::disk('public')->exists($paymentMethod->image)) {
                Storage::disk('public')->delete($paymentMethod->image);
            }

            $isSuccess = $this->paymentMethodRepository->delete($paymentMethod);

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
            $paymentMethods = PaymentMethod::whereIn('id', $ids)->get();

            $ids = Collection::make($ids);

            $deletedCount = $this->paymentMethodRepository->deleteMany($ids->toArray());

            if ($deletedCount == $ids->count()) {
                foreach ($paymentMethods as $paymentMethod) {
                    if ($paymentMethod->image && Storage::disk('public')->exists($paymentMethod->image)) {
                        Storage::delete('public/' . $paymentMethod->image);
                    }
                }
            }

            return $deletedCount;
        } catch (\Throwable $th) {
            throw CheckException::Check($th);
        }
    }
}
