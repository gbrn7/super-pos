<?php

namespace App\Repositories;

use App\Models\MasterProduct;
use App\Support\Interfaces\Repositories\MasterProductRepositoryInterface;
use App\Support\Models\MasterProduct\GetMasterProductReqModel;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Support\Collection;

class MasterProductRepository implements MasterProductRepositoryInterface
{
    public function getAllByIndex(GetMasterProductReqModel $request): Paginator|Collection
    {
        $query = MasterProduct::query()
            ->with('product')
            ->when($request->keyword, function ($query) use ($request) {
                if ($request->field && $request->field != 'default') {
                    $query->where($request->field, 'ilike', "%{$request->keyword}%");
                } else {
                    $query
                        ->orwhere('name', 'ilike', "%{$request->keyword}%")
                        ->orwhere('category_name', 'ilike', "%{$request->keyword}%")
                        ->orwhere('unit_name', 'ilike', "%{$request->keyword}%")
                        ->orwhere('barcode', 'ilike', "%{$request->keyword}%")
                        ->orwhere('desc', 'ilike', "%{$request->keyword}%");
                }
            })
            ->when($request->name, fn ($query) => $query->where('name', 'ilike', "%{$request->name}%"))
            ->when($request->barcode, fn ($query) => $query->where('barcode', 'ilike', "%{$request->barcode}%"))
            ->when($request->category_name, fn ($query) => $query->where('category_name', 'ilike', "%{$request->category_name}%"))
            ->when($request->unit_name, fn ($query) => $query->where('unit_name', 'ilike', "%{$request->unit_name}%"))
            ->when($request->price, fn ($query) => $query->where('price', $request->price))
            ->when($request->cost_price, fn ($query) => $query->where('cost_price', $request->cost_price))
            ->when($request->is_added !== null && $request->is_added !== '', function ($query) use ($request) {
                if ($request->is_added === 'true' || $request->is_added === '1' || $request->is_added === true) {
                    $query->whereHas('product');
                } elseif ($request->is_added === 'false' || $request->is_added === '0' || $request->is_added === false) {
                    $query->whereDoesntHave('product');
                }
            })
            ->select('*');

        if (isset($request->order_by) && isset($request->order)) {
            if ($request->order_by == 'is_added') {
                $query->orderByRaw("
                (SELECT CASE WHEN EXISTS (
                SELECT 1 FROM products WHERE products.barcode = master_products.barcode
                ) THEN 0 ELSE 1 END) {$request->order}
                ");
            } else {
                $query->orderBy($request->order_by, $request->order);
            }
        } else {
            $query->orderBy('id', 'desc');
        }

        if ($request->limit === null) {
            return $query->get();
        }

        return $query->paginate($request->limit)->onEachSide(1);
    }

    public function getById(int $id): ?MasterProduct
    {
        return MasterProduct::find($id);
    }

    public function create(array $data): MasterProduct
    {
        return MasterProduct::create($data);
    }

    public function update(MasterProduct $MasterProduct, array $data): bool
    {
        return $MasterProduct->update($data);
    }

    public function delete(MasterProduct $MasterProduct): bool
    {
        return $MasterProduct->delete();
    }

    public function deleteMany(array $ids): int
    {
        return MasterProduct::destroy($ids);
    }

    public function insert(array $data): bool
    {
        return MasterProduct::insert($data);
    }

    public function getByName(string $name): ?MasterProduct
    {
        return MasterProduct::where('name', $name)->first();
    }

    public function getByIds(array $ids): ?Collection
    {
        return MasterProduct::whereIn('id', $ids)->get();
    }

    public function getByBarcode(string $barcode): ?MasterProduct
    {
        return MasterProduct::where('barcode', $barcode)->first();
    }
}
