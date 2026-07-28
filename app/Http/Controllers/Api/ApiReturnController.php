<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProductReturn\StoreProductReturnRequest;
use App\Models\Transaction;
use App\Support\Interfaces\Services\ReturnServiceInterface;
use App\Support\Models\ProductReturn\GetProductReturnReqModel;
use App\Support\Utils\ResponseApi;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ApiReturnController extends Controller
{
    public function __construct(protected ReturnServiceInterface $returnService) {}

    /**
     * Display a listing of returns.
     */
    public function index(Request $request)
    {
        try {
            $returns = $this->returnService->getAll(new GetProductReturnReqModel($request));

            return ResponseApi::make(true, 'Berhasil mengambil data retur.', $returns);
        } catch (\Throwable $th) {
            return ResponseApi::make(false, $th->getMessage(), null, (int) $th->getCode() ?: 500);
        }
    }

    /**
     * Store a newly created return in storage.
     */
    public function store(StoreProductReturnRequest $request)
    {
        try {
            $validated = $request->validated();

            $transaction = Transaction::findOrFail($validated['transaction_id']);

            $return = $this->returnService->processReturn(
                transaction: $transaction,
                items: $validated['items'],
                reason: $validated['reason'] ?? null,
                user: $request->user()
            );

            return ResponseApi::make(
                true,
                'Retur barang berhasil diproses.',
                $return,
                Response::HTTP_CREATED
            );
        } catch (\Throwable $th) {
            return ResponseApi::make(false, $th->getMessage(), null, (int) $th->getCode() ?: 500);
        }
    }
}
