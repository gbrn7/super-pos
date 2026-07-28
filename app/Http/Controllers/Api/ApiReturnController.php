<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Services\ReturnService;
use App\Support\Utils\ResponseApi;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ApiReturnController extends Controller
{
    /**
     * Store a newly created return in storage.
     */
    public function store(Request $request, ReturnService $returnService)
    {
        try {
            $validated = $request->validate([
                'transaction_id' => ['required', 'exists:transactions,id'],
                'items' => ['required', 'array', 'min:1'],
                'items.*.product_id' => ['required', 'exists:products,id'],
                'items.*.quantity' => ['required', 'integer', 'min:1'],
                'reason' => ['nullable', 'string', 'max:500'],
            ]);

            $transaction = Transaction::findOrFail($validated['transaction_id']);

            $return = $returnService->processReturn(
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
