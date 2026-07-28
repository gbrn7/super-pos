<?php

namespace App\Http\Controllers;

use App\Models\ReturnModel;
use App\Models\Transaction;
use App\Services\ReturnService;
use Illuminate\Http\RedirectResponse;
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

        return Inertia::render('Returns/Index', [
            'returns' => $returns,
        ]);
    }

    public function store(Request $request, ReturnService $returnService): RedirectResponse
    {
        $validated = $request->validate([
            'transaction_id' => ['required', 'exists:transactions,id'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'reason' => ['nullable', 'string', 'max:500'],
        ]);

        $transaction = Transaction::findOrFail($validated['transaction_id']);

        $returnService->processReturn(
            transaction: $transaction,
            items: $validated['items'],
            reason: $validated['reason'] ?? null,
            user: $request->user()
        );

        return redirect()->back()->with('success', 'Retur barang berhasil diproses.');
    }
}
