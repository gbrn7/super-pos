<?php

namespace App\Repositories;

use App\Models\PaymentMethod;
use App\Support\Interfaces\Repositories\PaymentMethodRepositoryInterface;
use App\Support\Models\PaymentMethod\GetPaymentMethodReqModel;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Support\Collection;

class PaymentMethodRepository implements PaymentMethodRepositoryInterface
{
    public function getAllByIndex(GetPaymentMethodReqModel $request): Paginator|Collection
    {
        $query = PaymentMethod::query()
            ->orderBy('id', 'desc')
            ->when($request->name, fn ($query) => $query->where('name', 'like', "%{$request->name}%"));

        if ($request->limit === null) {
            return $query->get();
        }

        return $query->paginate($request->limit)->onEachSide(1);
    }

    public function getById(int $id): ?PaymentMethod
    {
        return PaymentMethod::find($id);
    }

    public function create(array $data): PaymentMethod
    {
        return PaymentMethod::create($data);
    }

    public function update(PaymentMethod $paymentMethod, array $data): bool
    {
        return $paymentMethod->update($data);
    }

    public function delete(PaymentMethod $paymentMethod): bool
    {
        return $paymentMethod->delete();
    }

    public function deleteMany(array $ids): int
    {
        return PaymentMethod::destroy($ids);
    }

    public function insert(array $data): bool
    {
        return PaymentMethod::insert($data);
    }

    public function getByName(string $name): ?PaymentMethod
    {
        return PaymentMethod::where('name', $name)->first();
    }

    public function getByNameExceptID(string $name, int $id): ?PaymentMethod
    {
        return PaymentMethod::where('name', $name)->where('id', '!=', $id)->first();
    }
}
