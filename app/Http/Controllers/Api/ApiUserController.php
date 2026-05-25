<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\BulkDeleteUserRequest;
use App\Http\Requests\User\StoreUserRequest;
use App\Http\Requests\User\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Support\Enums\UserPermissionEnums;
use App\Support\Interfaces\Services\UserServiceInterface;
use App\Support\Models\User\GetUserReqModel;
use App\Support\Utils\ResponseApi;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class ApiUserController extends Controller implements HasMiddleware
{

    public function __construct(protected UserServiceInterface $userService) {}


    public static function middleware(): array
    {
        return [
            new Middleware(
                'permission:' . UserPermissionEnums::READ_USER->value,
                only: ['index', 'show']
            ),

            new Middleware(
                'permission:' . UserPermissionEnums::CREATE_USER->value,
                only: ['store']
            ),

            new Middleware(
                'permission:' . UserPermissionEnums::UPDATE_USER->value,
                only: ['update']
            ),

            new Middleware(
                'permission:' . UserPermissionEnums::DELETE_USER->value,
                only: ['destroy', 'bulkDelete']
            ),
        ];
    }
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {

            $users = $this->userService->getAllByIndex(new GetUserReqModel($request));

            $data = UserResource::collection($users);

            return ResponseApi::make(true, trans('message.success.success'), $data);
        } catch (\Throwable $th) {
            return ResponseApi::make(false, $th->getMessage(), null, $th->getcode());
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreUserRequest $request)
    {
        try {
            $user = $this->userService->create($request->validated());

            $data = UserResource::make($user);

            return ResponseApi::make(true, trans('message.success.created'), $data, Response::HTTP_CREATED);
        } catch (\Throwable $th) {
            return ResponseApi::make(false, $th->getMessage(), null, $th->getcode());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try {
            $data = $this->userService->getById($id);

            $data = UserResource::make($data);

            return ResponseApi::make(true, trans('message.success.success'), $data);
        } catch (\Throwable $th) {
            return ResponseApi::make(false, $th->getMessage(), null, $th->getcode());
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateUserRequest $request, string $id)
    {
        try {
            $data = $request->validated();
            if (empty($data['password'])) {
                unset($data['password']);
            }

            $user = $this->userService->update($id, $data);

            $data = UserResource::make($user);

            return ResponseApi::make(true, trans('message.success.updated'), $data);
        } catch (\Throwable $th) {
            return ResponseApi::make(false, $th->getMessage(), null, $th->getcode());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            $isSuccessDelete = $this->userService->delete($id);

            if (!$isSuccessDelete) throw new Exception(trans('message.error.internal_server_error'), Response::HTTP_INTERNAL_SERVER_ERROR);

            return ResponseApi::make(true, trans('message.success.deleted'), null, Response::HTTP_OK);
        } catch (\Throwable $th) {
            return ResponseApi::make(false, $th->getMessage(), null, $th->getcode());
        }
    }


    /**
     * Bulk delete resources.
     */
    public function bulkDelete(BulkDeleteUserRequest $request)
    {
        try {
            $deletedCount = $this->userService->bulkDelete($request->validated('ids'));

            return ResponseApi::make(true, trans('message.success.bulk_deleted', ['count' => $deletedCount]), null, Response::HTTP_OK);
        } catch (\Throwable $th) {
            return ResponseApi::make(false, $th->getMessage(), null, $th->getcode());
        }
    }
}
