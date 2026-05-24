<?php

namespace App\Support\Interfaces\Repositories;

use App\Models\User;
use App\Support\Models\User\GetUserReqModel;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Support\Collection;

interface UserRepositoryInterface
{
  /**
   * Get all categories.
   * @param GetUserReqModel $request
   * @return Paginator|Collection
   */
  public function getAllByIndex(GetUserReqModel $request): Paginator|Collection;

  /**
   * Get a user by its ID.
   *
   * @param int $id
   * @return User|null
   */
  public function getById(int $id): ?User;

  /**
   * Create a new user.
   *
   * @param array $data
   * @return User
   */
  public function create(array $data): User;

  /**
   * Update an existing user.
   *
   * @param User $user
   * @param array $data
   * @return bool
   */
  public function update(User $user, array $data): bool;

  /**
   * Delete a user by its ID.
   *
   * @param User $user
   * @return bool
   */
  public function delete(User $user): bool;

  /**
   * Delete a categories by its Ids.
   *
   * @param array $ids
   * @return int
   */
  public function deleteMany(array $ids): int;


  /**
   * Insert new categories.
   *
   * @param array $data
   * @return bool
   */
  public function insert(array $data): bool;

  /**
   * Get a user by its name.
   *
   * @param string $name
   * @return User|null
   */
  public function getByName(string $name): ?User;


  /**
   * Get a user by its email except id.
   *
   * @param string $email
   * @param int $id
   * @return User|null
   */
  public function getByEmailExceptID(string $email, int $id): ?User;
}
