<?php

namespace App\Support\Interfaces\Services;

use App\Models\User;
use App\Support\Models\User\GetUserReqModel;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Support\Collection;

interface UserServiceInterface
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
    public function update(int $id, array $data): ?User;

    /**
     * Delete a user by its ID.
     */
    public function delete(int $id): bool;

    /**
     * Bulk delete a users by ids.
     */
    public function bulkDelete(array $ids): int;
}
