<?php

namespace App\Support\Interfaces\Repositories;

use App\Models\User;
use App\Support\Models\User\GetUserReqModel;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Support\Collection;

interface UserRepositoryInterface
{
    /**
     * Get all users.
     */
    public function getAllByIndex(GetUserReqModel $request): Paginator|Collection;

    /**
     * Get a user by its ID.
     */
    public function getById(int $id): ?User;

    /**
     * Create a new user.
     */
    public function create(array $data): User;

    /**
     * Update an existing user.
     */
    public function update(User $user, array $data): bool;

    /**
     * Delete a user by its ID.
     */
    public function delete(User $user): bool;

    /**
     * Delete a users by its Ids.
     */
    public function deleteMany(array $ids): int;

    /**
     * Insert new users.
     */
    public function insert(array $data): bool;

    /**
     * Get a user by its name.
     */
    public function getByName(string $name): ?User;

    /**
     * Get a user by its email except id.
     */
    public function getByEmailExceptID(string $email, int $id): ?User;
}
