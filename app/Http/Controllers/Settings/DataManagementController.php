<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\PurgeDataRequest;
use App\Support\Enums\RoleEnums;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DataManagementController extends Controller
{
    public function edit(): Response
    {
        if (! auth()->user()->hasRole(RoleEnums::SUPER_ADMIN->value)) {
            abort(403);
        }

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

                DB::table('transaction_detail')
                    ->whereIn('transaction_id', $transactionIds)
                    ->delete();

                DB::table('transactions')
                    ->whereIn('id', $transactionIds)
                    ->delete();
            }

            if (in_array('returns', $modules)) {
                $returnIds = DB::table('returns')
                    ->where('created_at', '<', $cutoffDate)
                    ->pluck('id');

                DB::table('return_details')
                    ->whereIn('return_id', $returnIds)
                    ->delete();

                DB::table('returns')
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
        if (DB::connection()->getDriverName() === 'sqlite') {
            DB::statement('VACUUM');
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('message.success.data_purged'),
        ]);

        return to_route('data-management.edit');
    }

    public function exportSql(): StreamedResponse
    {
        if (! auth()->user()->hasRole(RoleEnums::SUPER_ADMIN->value)) {
            abort(403);
        }

        $filename = 'praktis_pos_backup_'.now()->format('Y-m-d').'.sql';

        return response()->stream(function () {
            $out = fopen('php://output', 'w');

            fwrite($out, "-- Praktis-Pos Database Backup\n");
            fwrite($out, '-- Date: '.now()->toDateTimeString()."\n");
            fwrite($out, '-- Connection: '.DB::connection()->getDriverName()."\n\n");
            fwrite($out, "PRAGMA foreign_keys = OFF;\n\n");

            // Get all tables in the SQLite database
            $tables = DB::select("SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");

            foreach ($tables as $table) {
                $tableName = $table->name;
                $createSql = $table->sql;

                fwrite($out, 'DROP TABLE IF EXISTS `'.$tableName."`;\n");
                fwrite($out, $createSql.";\n\n");

                // Retrieve and stream table rows
                DB::table($tableName)->orderByRaw('1')->chunk(200, function ($rows) use ($out, $tableName) {
                    foreach ($rows as $row) {
                        $rowArray = (array) $row;
                        $columns = array_keys($rowArray);
                        $escapedColumns = array_map(fn ($col) => '`'.$col.'`', $columns);

                        $escapedValues = array_map(function ($val) {
                            if ($val === null) {
                                return 'NULL';
                            }

                            return "'".str_replace("'", "''", $val)."'";
                        }, array_values($rowArray));

                        $insertSql = 'INSERT INTO `'.$tableName.'` ('.implode(', ', $escapedColumns).') VALUES ('.implode(', ', $escapedValues).");\n";
                        fwrite($out, $insertSql);
                    }
                });

                fwrite($out, "\n");
            }

            fwrite($out, "PRAGMA foreign_keys = ON;\n");
            fclose($out);
        }, 200, [
            'Content-Type' => 'text/plain; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="'.$filename.'"',
        ]);
    }
}
