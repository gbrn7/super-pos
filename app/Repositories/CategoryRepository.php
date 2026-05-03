<?php

namespace App\Repositories;

use App\Models\Category;
use App\Support\Interfaces\Repositories\CategoryRepositoryInterface;
use App\Support\Models\Category\GetCategoryReqModel;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Support\Collection;
use Override;

class CategoryRepository implements CategoryRepositoryInterface
{
    public function getAllByIndex(GetCategoryReqModel $request): Paginator|Collection
    {
        $query = Category::query()
            ->orderBy('id', 'desc')
            ->when($request->name, fn($query) => $query->where('name', 'like', "%{$request->name}%"));

        if ($request->limit === null) {
            return $query->get();
        }

        return $query->paginate($request->limit)->onEachSide(1);
    }

    public function getById(int $id): ?Category
    {
        return Category::find($id);
    }

    public function create(array $data): Category
    {
        return Category::create($data);
    }

    public function update(Category $category, array $data): bool
    {
        return $category->update($data);
    }

    public function delete(Category $category): bool
    {
        return $category->delete();
    }


    public function deleteMany(array $ids): int
    {
        return Category::destroy($ids);
    }
}
