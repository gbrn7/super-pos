<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Unit\BulkDeleteUnitRequest;
use App\Http\Requests\Unit\StoreUnitRequest;
use App\Http\Requests\Unit\UpdateUnitRequest;
use App\Http\Resources\UnitResource;
use App\Support\Enums\UnitPermissionEnums;
use App\Support\Interfaces\Services\UnitServiceInterface;
use App\Support\Models\Unit\GetUnitReqModel;
use App\Support\Utils\ResponseApi;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Symfony\Component\HttpFoundation\Response;

class ApiUnitController extends Controller implements HasMiddleware
{
    public function __construct(protected UnitServiceInterface $unitService) {}

    public static function middleware(): array
    {
        return [
            new Middleware(
                'permission:'.UnitPermissionEnums::READ_UNIT->value,
                only: ['index', 'show']
            ),

            new Middleware(
                'permission:'.UnitPermissionEnums::CREATE_UNIT->value,
                only: ['store']
            ),

            new Middleware(
                'permission:'.UnitPermissionEnums::UPDATE_UNIT->value,
                only: ['update']
            ),

            new Middleware(
                'permission:'.UnitPermissionEnums::DELETE_UNIT->value,
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
            $units = $this->unitService->getAllByIndex(new GetUnitReqModel($request));

            $data = UnitResource::collection($units);

            return ResponseApi::make(true, trans('message.success.success'), $data);
        } catch (\Throwable $th) {
            return ResponseApi::make(false, $th->getMessage(), null, $th->getcode());
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreUnitRequest $request)
    {
        try {
            $unit = $this->unitService->create($request->validated());

            return ResponseApi::make(true, trans('message.success.created'), $unit, Response::HTTP_CREATED);
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
            $data = $this->unitService->getById($id);

            return ResponseApi::make(true, trans('message.success.success'), $data);
        } catch (\Throwable $th) {
            return ResponseApi::make(false, $th->getMessage(), null, $th->getcode());
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateUnitRequest $request, string $id)
    {
        try {
            $unit = $this->unitService->update($id, $request->validated());

            return ResponseApi::make(true, trans('message.success.updated'), $unit);
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
            $isSuccessDelete = $this->unitService->delete($id);

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
    public function bulkDelete(BulkDeleteUnitRequest $request)
    {
        try {
            $deletedCount = $this->unitService->bulkDelete($request->validated('ids'));

            return ResponseApi::make(true, trans('message.success.bulk_deleted', ['count' => $deletedCount]), null, Response::HTTP_OK);
        } catch (\Throwable $th) {
            return ResponseApi::make(false, $th->getMessage(), null, $th->getcode());
        }
    }
}
