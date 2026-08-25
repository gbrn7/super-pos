<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\PurgeDataRequest;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DataManagementController extends Controller
{
    public function edit(): Response
    {
        return Inertia::render('settings/data-management');
    }

    public function purge(PurgeDataRequest $request): RedirectResponse
    {
        $modules = $request->input('modules');
        $period = $request->input('retention_period');

        $months = match ($period) {
            '1_month' => 1,
            '3_months' => 3,
            '6_months' => 6,
            '12_months' => 12,
        };

        $cutoffDate = Carbon::now()->subMonths($months);

        DB::transaction(function () use ($modules, $cutoffDate) {
            if (in_array('transactions', $modules)) {
                $transactionIds = DB::table('transactions')
                    ->where('created_at', '<', $cutoffDate)
                    ->pluck('id');

                DB::table('transaction_details')
                    ->whereIn('transaction_id', $transactionIds)
                    ->delete();

                DB::table('transactions')
                    ->whereIn('id', $transactionIds)
                    ->delete();
            }

            if (in_array('returns', $modules)) {
                $returnIds = DB::table('product_returns')
                    ->where('created_at', '<', $cutoffDate)
                    ->pluck('id');

                DB::table('return_details')
                    ->whereIn('product_return_id', $returnIds)
                    ->delete();

                DB::table('product_returns')
                    ->whereIn('id', $returnIds)
                    ->delete();
            }

            if (in_array('profit_wallet', $modules)) {
                DB::table('profit_wallet_transactions')
                    ->where('created_at', '<', $cutoffDate)
                    ->delete();
            }

            if (in_array('capital_wallet', $modules)) {
                DB::table('capital_wallet_transactions')
                    ->where('created_at', '<', $cutoffDate)
                    ->delete();
            }
        });

        // Run SQLite VACUUM to free space
        DB::statement('VACUUM');

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('message.success.data_purged'),
        ]);

        return to_route('data-management.edit');
    }
}
