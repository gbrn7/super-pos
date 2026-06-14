<?php

namespace App\Repositories;

use App\Models\Unit;
use App\Support\Interfaces\Repositories\UnitRepositoryInterface;
use App\Support\Models\Unit\GetUnitReqModel;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Support\Collection;

class UnitRepository implements UnitRepositoryInterface
{
    public function getAllByIndex(GetUnitReqModel $request): Paginator|Collection
    {
        $query = Unit::query()
            ->orderBy('id', 'desc')
            ->when($request->name, fn($query) => $query->where('name', 'ilike', "%{$request->name}%"));

        if ($request->limit === null) {
            return $query->get();
        }

        return $query->paginate($request->limit)->onEachSide(1);
    }

    public function getById(int $id): ?Unit
    {
        return Unit::find($id);
    }

    public function create(array $data): Unit
    {
        return Unit::create($data);
    }

    public function update(Unit $unit, array $data): bool
    {
        return $unit->update($data);
    }

    public function delete(Unit $unit): bool
    {
        return $unit->delete();
    }

    public function deleteMany(array $ids): int
    {
        return Unit::destroy($ids);
    }

    public function insert(array $data): bool
    {
        return Unit::insert($data);
    }

    public function getByName(string $name): ?Unit
    {
        return Unit::where('name', $name)->first();
    }

    public function getByNameExceptID(string $name, int $id): ?Unit
    {
        return Unit::where('name', $name)->where('id', '!=', $id)->first();
    }
}
