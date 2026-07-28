<?php

namespace App\Http\Controllers;

use App\Models\ReturnModel;
use App\Models\Transaction;
use App\Services\ReturnService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReturnController extends Controller
{
    public function index(): Response
    {
        $returns = ReturnModel::with(['transaction', 'user', 'details.product'])
            ->latest()
            ->paginate(10);

        return Inertia::render('returns/index', [
            'returns' => $returns,
        ]);
    }

    public function store(Request $request, ReturnService $returnService)
    {
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

        if ($request->wantsJson() || $request->ajax()) {
            return response()->json([
                'success' => true,
                'message' => 'Retur barang berhasil diproses.',
                'data' => $return,
            ]);
        }

        return redirect()->back()->with('success', 'Retur barang berhasil diproses.');
    }
}
