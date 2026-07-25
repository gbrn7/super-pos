<?php

namespace App\Repositories;

use App\Models\ProfitWallet;
use App\Models\ProfitWalletTransaction;
use App\Models\Transaction;
use App\Support\Interfaces\Repositories\ProfitWalletRepositoryInterface;
use App\Support\Models\ProfitWallet\GetProfitWalletTransactionReqModel;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Support\Collection;

class ProfitWalletRepository implements ProfitWalletRepositoryInterface
{
    public function getActiveWallet(): ?ProfitWallet
    {
        return ProfitWallet::where('status', 'active')->first();
    }

    public function lockActiveWalletForUpdate(): ?ProfitWallet
    {
        return ProfitWallet::where('status', 'active')->lockForUpdate()->first();
    }

    public function lockWalletForUpdate(int $id): ?ProfitWallet
    {
        return ProfitWallet::where('id', $id)->lockForUpdate()->first();
    }

    public function createWallet(array $data): ProfitWallet
    {
        return ProfitWallet::create($data);
    }

    public function updateWalletBalance(ProfitWallet $wallet, float $balance): bool
    {
        return $wallet->update(['balance' => $balance]);
    }

    public function createTransaction(array $data): ProfitWalletTransaction
    {
        return ProfitWalletTransaction::create($data);
    }

    public function getTransactions(GetProfitWalletTransactionReqModel $request): Paginator|Collection
    {
        $query = ProfitWalletTransaction::query()->with('reference');

        if ($request->start_date) {
            $startTimestamp = Carbon::parse($request->start_date)->startOfDay()->getTimestamp();
            $query->where('created_at', '>=', $startTimestamp);
        }
        if ($request->end_date) {
            $endTimestamp = Carbon::parse($request->end_date)->endOfDay()->getTimestamp();
            $query->where('created_at', '<=', $endTimestamp);
        }
        if ($request->type) {
            $query->where('type', $request->type);
        }
        if ($request->transaction_type) {
            $query->where('transaction_type', $request->transaction_type);
        }
        if ($request->keyword) {
            $query->where(function ($q) use ($request) {
                $q->where('notes', 'ilike', "%{$request->keyword}%")
                    ->orWhere(function ($sub) use ($request) {
                        $sub->where('reference_type', Transaction::class)
                            ->whereHasMorph('reference', [Transaction::class], function ($morphQuery) use ($request) {
                                $morphQuery->where('invoice_number', 'ilike', "%{$request->keyword}%");
                            });
                    });
            });
        }

        $query->orderBy('id', 'desc');

        if ($request->limit === null) {
            return $query->get();
        }

        return $query->paginate($request->limit)->onEachSide(1);
    }

    public function getTransactionSummary(GetProfitWalletTransactionReqModel $request, float $currentBalance): array
    {
        $query = ProfitWalletTransaction::query();

        if ($request->start_date) {
            $query->where('created_at', '>=', Carbon::parse($request->start_date)->startOfDay()->getTimestamp());
        }
        if ($request->end_date) {
            $query->where('created_at', '<=', Carbon::parse($request->end_date)->endOfDay()->getTimestamp());
        }
        if ($request->type) {
            $query->where('type', $request->type);
        }
        if ($request->transaction_type) {
            $query->where('transaction_type', $request->transaction_type);
        }
        if ($request->keyword) {
            $query->where(function ($q) use ($request) {
                $q->where('notes', 'ilike', "%{$request->keyword}%")
                    ->orWhere(function ($sub) use ($request) {
                        $sub->where('reference_type', Transaction::class)
                            ->whereHasMorph('reference', [Transaction::class], function ($morphQuery) use ($request) {
                                $morphQuery->where('invoice_number', 'ilike', "%{$request->keyword}%");
                            });
                    });
            });
        }

        return [
            'current_balance' => $currentBalance,
            'total_inflow' => (float) $query->clone()->where('type', 'in')->sum('amount'),
            'total_outflow' => (float) $query->clone()->where('type', 'out')->sum('amount'),
        ];
    }
}
