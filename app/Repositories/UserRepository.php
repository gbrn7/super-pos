<?php

namespace App\Repositories;

use App\Models\User;
use App\Support\Enums\RoleEnums;
use App\Support\Interfaces\Repositories\UserRepositoryInterface;
use App\Support\Models\User\GetUserReqModel;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Support\Collection;

class UserRepository implements UserRepositoryInterface
{
    public function getAllByIndex(GetUserReqModel $request): Paginator|Collection
    {
        $query = User::query()
            ->with('roles')
            ->orderBy('id', 'desc')
            ->when($request->name, fn ($query) => $query->where('name', 'like', "%{$request->name}%"))
            ->whereDoesntHave('roles', function ($query) {
                $query->where('name', RoleEnums::SUPER_ADMIN->value);
            });

        if ($request->limit === null) {
            return $query->get();
        }

        return $query->paginate($request->limit)->onEachSide(1);
    }

    public function getById(int $id): ?User
    {
        return User::with('roles')->find($id);
    }

    public function create(array $data): User
    {
        return User::create($data);
    }

    public function update(User $user, array $data): bool
    {
        return $user->update($data);
    }

    public function delete(User $user): bool
    {
        return $user->delete();
    }

    public function deleteMany(array $ids): int
    {
        return User::destroy($ids);
    }

    public function insert(array $data): bool
    {
        return User::insert($data);
    }

    public function getByName(string $name): ?User
    {
        return User::where('name', $name)->first();
    }

    public function getByEmailExceptID(string $email, int $id): ?User
    {
        return User::where('email', $email)->where('id', '!=', $id)->first();
    }
}
