<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cash_profits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transaction_id')->constrained('transactions')->cascadeOnDelete();
            $table->decimal('profit', 15, 2);
            $table->timestamps();
        });

        // Calculate and migrate historical transaction profits
        $transactions = DB::table('transactions')->get();
        foreach ($transactions as $tx) {
            $details = DB::table('transaction_detail')
                ->where('transaction_id', $tx->id)
                ->get();

            $totalCost = 0;
            $totalRevenue = $tx->total_amount;

            foreach ($details as $detail) {
                $totalCost += $detail->cost_price * $detail->quantity;
            }

            $profit = $totalRevenue - $totalCost;

            DB::table('cash_profits')->insert([
                'transaction_id' => $tx->id,
                'profit' => $profit,
                'created_at' => $tx->created_at,
                'updated_at' => $tx->updated_at,
            ]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('cash_profits');
    }
};
