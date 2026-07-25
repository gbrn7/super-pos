<?php

namespace App\Repositories;

use App\Models\CapitalWallet;
use App\Models\CapitalWalletTransaction;
use App\Models\Transaction;
use App\Support\Enums\CapitalWalletStatusEnums;
use App\Support\Enums\CapitalWalletTransactionDirectionEnums;
use App\Support\Interfaces\Repositories\CapitalWalletRepositoryInterface;
use App\Support\Models\CapitalWallet\GetCapitalWalletTransactionReqModel;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Support\Collection;

class CapitalWalletRepository implements CapitalWalletRepositoryInterface
{
    public function getActiveWallet(): ?CapitalWallet
    {
        return CapitalWallet::where('status', CapitalWalletStatusEnums::ACTIVE->value)->first();
    }

    public function lockActiveWalletForUpdate(): ?CapitalWallet
    {
        return CapitalWallet::where('status', CapitalWalletStatusEnums::ACTIVE->value)->lockForUpdate()->first();
    }

    public function lockWalletForUpdate(int $id): ?CapitalWallet
    {
        return CapitalWallet::where('id', $id)->lockForUpdate()->first();
    }

    public function createWallet(array $data): CapitalWallet
    {
        return CapitalWallet::create($data);
    }

    public function updateWalletBalance(CapitalWallet $wallet, float $balance, float $totalInflow, float $totalOutflow): bool
    {
        return $wallet->update([
            'balance' => $balance,
            'total_inflow' => $totalInflow,
            'total_outflow' => $totalOutflow,
        ]);
    }

    public function createTransaction(array $data): CapitalWalletTransaction
    {
        return CapitalWalletTransaction::create($data);
    }

    public function getTransactions(GetCapitalWalletTransactionReqModel $request): Paginator|Collection
    {
        $query = CapitalWalletTransaction::query()->with('reference');

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

    public function getTransactionSummary(GetCapitalWalletTransactionReqModel $request, CapitalWallet $wallet): array
    {
        $hasFilters = $request->start_date || $request->end_date || $request->type || $request->transaction_type || $request->keyword;

        if (! $hasFilters) {
            return [
                'current_balance' => (float) $wallet->balance,
                'total_inflow' => (float) $wallet->total_inflow,
                'total_outflow' => (float) $wallet->total_outflow,
            ];
        }

        $query = CapitalWalletTransaction::query();

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
            'current_balance' => (float) $wallet->balance,
            'total_inflow' => (float) $query->clone()->where('type', CapitalWalletTransactionDirectionEnums::IN->value)->sum('amount'),
            'total_outflow' => (float) $query->clone()->where('type', CapitalWalletTransactionDirectionEnums::OUT->value)->sum('amount'),
        ];
    }
}
