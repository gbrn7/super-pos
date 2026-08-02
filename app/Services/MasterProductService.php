<?php

namespace App\Services;

use App\Exports\MasterProductExport;
use App\Imports\MasterProductImport;
use App\Models\MasterProduct;
use App\Support\Constants\Constants;
use App\Support\Constants\ErrorCode;
use App\Support\Interfaces\Repositories\MasterProductRepositoryInterface;
use App\Support\Interfaces\Services\MasterProductServiceInterface;
use App\Support\Models\MasterProduct\GetMasterProductReqModel;
use App\Support\Utils\CheckException;
use Barryvdh\DomPDF\Facade\Pdf;
use Exception;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class MasterProductService implements MasterProductServiceInterface
{
    public function __construct(
        protected MasterProductRepositoryInterface $MasterproductRepository,
    ) {}

    public function getAllByIndex(GetMasterProductReqModel $request): Paginator|Collection
    {
        try {
            return $this->MasterproductRepository->getAllByIndex($request);
        } catch (\Throwable $th) {
            dd($th->getMessage());
            throw CheckException::Check($th);
        }
    }

    public function getById(int $id): ?MasterProduct
    {
        try {
            return $this->MasterproductRepository->getById($id);
        } catch (\Throwable $th) {
            throw CheckException::Check($th);
        }
    }

    public function getByBarcode(string $barcode): ?MasterProduct
    {
        try {
            $masterProduct = $this->MasterproductRepository->getByBarcode($barcode);

            if (! isset($masterProduct)) {
                throw new Exception(trans('message.error.data_not_found'), Response::HTTP_NOT_FOUND);
            }

            return $masterProduct;
        } catch (\Throwable $th) {
            throw CheckException::Check($th);
        }
    }

    public function create(array $data): MasterProduct
    {
        try {
            if ($data['cost_price'] > $data['price']) {
                throw new Exception(
                    trans('message.error.cost_price_greater_than_price_validation'),
                    Response::HTTP_INTERNAL_SERVER_ERROR
                );
            }

            return $this->MasterproductRepository->create($data);
        } catch (\Throwable $th) {
            throw CheckException::Check($th);
        }
    }

    public function update(int $id, array $data): ?MasterProduct
    {
        try {
            $Masterproduct = $this->MasterproductRepository->getById($id);

            if (! isset($Masterproduct)) {
                throw new Exception(trans('message.error.data_not_found'), Response::HTTP_NOT_FOUND);
            }

            if ($data['cost_price'] > $data['price']) {
                throw new Exception(
                    trans('message.error.cost_price_greater_than_price_validation'),
                    Response::HTTP_INTERNAL_SERVER_ERROR
                );
            }

            $isSuccess = $this->MasterproductRepository->update($Masterproduct, $data);

            if (! $isSuccess) {
                throw new Exception(trans('message.error.internal_server_error'), Response::HTTP_INTERNAL_SERVER_ERROR);
            }

            return $Masterproduct;
        } catch (\Throwable $th) {
            throw CheckException::Check($th);
        }
    }

    public function delete(int $id): bool
    {
        try {
            $Masterproduct = $this->MasterproductRepository->getById($id);

            if (! isset($Masterproduct)) {
                throw new Exception(trans('message.error.data_not_found'), Response::HTTP_NOT_FOUND);
            }

            $isSuccess = $this->MasterproductRepository->delete($Masterproduct);

            if (! $isSuccess) {
                throw new Exception(trans('message.error.internal_server_error'), Response::HTTP_INTERNAL_SERVER_ERROR);
            }

            return true;
        } catch (\Throwable $th) {
            throw CheckException::Check($th);
        }
    }

    public function bulkDelete(array $ids): int
    {
        try {
            $ids = Collection::make($ids);

            $deletedCount = $this->MasterproductRepository->deleteMany($ids->toArray());

            return $deletedCount;
        } catch (\Throwable $th) {
            throw CheckException::Check($th);
        }
    }

    public function importExcel(UploadedFile $file): int
    {
        try {
            // set max time for this process
            set_time_limit(300);

            $data = Excel::toArray(new MasterProductImport, $file);
            $chunks = array_chunk($data[0], 1000);

            $now = now();

            $insertedCount = 0;

            DB::beginTransaction();
            foreach ($chunks as $chunk) {
                $newData = Collection::make();
                foreach ($chunk as $row) {
                    $newMasterProduct = [
                        'name' => Str::upper($row['nama']),
                        'category_name' => $row['kategori'],
                        'unit_name' => $row['satuan'],
                        'barcode' => $row['barcode_opsional'],
                        'cost_price' => $row['harga_modal'] ?? Constants::EMPTY_NUMBER_VALUE,
                        'price' => $row['harga_jual'] ?? Constants::EMPTY_NUMBER_VALUE,
                        'desc' => $row['deskripsi_opsional'] ?? Constants::EMPTY_STRING_VALUE,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ];

                    if ($newMasterProduct['name'] == Constants::EMPTY_STRING_VALUE) {
                        throw new Exception(
                            trans('message.error.blank_name_template_validation'),
                            Response::HTTP_UNPROCESSABLE_ENTITY
                        );
                    }

                    if ($newMasterProduct['cost_price'] > $newMasterProduct['price']) {
                        throw new Exception(
                            sprintf(trans('message.error.cost_price_greater_than_price_template_validaion'), $newMasterProduct['name']),
                            Response::HTTP_UNPROCESSABLE_ENTITY
                        );
                    }

                    $newData->push($newMasterProduct);
                }

                $isSuccess = $this->MasterproductRepository->insert($newData->toArray());
                if (! $isSuccess) {
                    throw new Exception(trans('message.error.internal_server_error'), Response::HTTP_INTERNAL_SERVER_ERROR);
                }

                $insertedCount = $insertedCount + $newData->count();
            }
            DB::commit();

            return $insertedCount;
        } catch (\Throwable $th) {
            DB::rollback();
            if ($th->getCode() === ErrorCode::SQL_UNIQUE_VIOLATION) {
                $th = new Exception(trans('message.error.duplicate_data_error_import'), Response::HTTP_INTERNAL_SERVER_ERROR);
            }

            throw CheckException::Check($th);
        }
    }

    public function exportExcel(): BinaryFileResponse
    {
        try {
            set_time_limit(600);
            ini_set('memory_limit', '512M');

            return Excel::download(new MasterProductExport, 'Masterproducts-export.xlsx');
        } catch (\Throwable $th) {
            dd($th->getMessage());
            throw CheckException::Check($th);
        }
    }

    public function exportPdf(): BinaryFileResponse
    {
        try {
            $request = new GetMasterProductReqModel(new Request(['limit' => null]));
            $Masterproducts = $this->MasterproductRepository->getAllByIndex($request);

            $temporaryFilePath = tempnam(sys_get_temp_dir(), 'MasterProducts-export-').'.pdf';

            Pdf::loadView('exports.master-products-pdf', ['masterproducts' => $Masterproducts])
                ->setPaper('a4', 'landscape')
                ->save($temporaryFilePath);

            return response()->download($temporaryFilePath, 'Masterproducts-export.pdf')->deleteFileAfterSend(true);
        } catch (\Throwable $th) {
            throw CheckException::Check($th);
        }
    }
}
