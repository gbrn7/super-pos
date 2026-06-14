<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Role\BulkDeleteRoleRequest;
use App\Http\Requests\Role\StoreRoleRequest;
use App\Http\Requests\Role\UpdateRoleRequest;
use App\Http\Resources\RoleResource;
use App\Support\Enums\RolePermissionEnums;
use App\Support\Interfaces\Services\RoleServiceInterface;
use App\Support\Models\Role\GetRoleReqModel;
use App\Support\Utils\ResponseApi;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Symfony\Component\HttpFoundation\Response;

class ApiRoleController extends Controller implements HasMiddleware
{
    public function __construct(protected RoleServiceInterface $roleService) {}

    public static function middleware(): array
    {
        return [
            new Middleware(
                'permission:' . RolePermissionEnums::READ_ROLE->value,
                only: ['index', 'show']
            ),

            new Middleware(
                'permission:' . RolePermissionEnums::CREATE_ROLE->value,
                only: ['store', 'getRoleImportTemplate', 'importRoleExcelData']
            ),

            new Middleware(
                'permission:' . RolePermissionEnums::UPDATE_ROLE->value,
                only: ['update']
            ),

            new Middleware(
                'permission:' . RolePermissionEnums::DELETE_ROLE->value,
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
            $data = $this->roleService->getAllByIndex(new GetRoleReqModel($request));


            return ResponseApi::make(true, trans('message.success.success'), $data);
        } catch (\Throwable $th) {
            return ResponseApi::make(false, $th->getMessage(), null, $th->getcode());
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreRoleRequest $request)
    {
        try {
            $role = $this->roleService->create($request->validated());

            $data = RoleResource::make($role);

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
            $data = $this->roleService->getById($id);

            $data = RoleResource::make($data);

            return ResponseApi::make(true, trans('message.success.success'), $data);
        } catch (\Throwable $th) {
            return ResponseApi::make(false, $th->getMessage(), null, $th->getcode());
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateRoleRequest $request, string $id)
    {
        try {
            $role = $this->roleService->update($id, $request->validated());

            $data = RoleResource::make($role);

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
            $isSuccessDelete = $this->roleService->delete($id);

            if (! $isSuccessDelete) {
                throw new Exception(trans('message.error.internal_server_error'), Response::HTTP_INTERNAL_SERVER_ERROR);
            }

            return ResponseApi::make(true, trans('message.success.deleted'), null, Response::HTTP_OK);
        } catch (\Throwable $th) {
            return ResponseApi::make(false, $th->getMessage(), null, $th->getcode());
        }
    }

    /**
     * Bulk delete resources.
     */
    public function bulkDelete(BulkDeleteRoleRequest $request)
    {
        try {
            $deletedCount = $this->roleService->bulkDelete($request->validated('ids'));

            return ResponseApi::make(true, trans('message.success.bulk_deleted', ['count' => $deletedCount]), null, Response::HTTP_OK);
        } catch (\Throwable $th) {
            return ResponseApi::make(false, $th->getMessage(), null, $th->getcode());
        }
    }

    public function getRoleImportTemplate()
    {
        $fileName = 'import-role-template.xlsx';
        $publiFilePath = 'template/' . $fileName;

        if (! file_exists($publiFilePath)) {
            return ResponseApi::make(false, trans('message.error.not_found', ['resource' => 'file']), null, Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        return ResponseApi::download($fileName, $publiFilePath);
    }
}
