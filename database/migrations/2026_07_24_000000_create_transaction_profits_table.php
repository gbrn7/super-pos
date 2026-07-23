<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transaction_profits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transaction_id')->constrained('transactions')->onDelete('cascade');
            $table->decimal('total_revenue', 10, 2);
            $table->decimal('total_cost', 10, 2);
            $table->decimal('profit', 10, 2);
            $table->timestamps();
        });

        // Populate historical transaction data
        $transactions = DB::table('transactions')->get();
        foreach ($transactions as $tx) {
            $totalCost = DB::table('transaction_detail')
                ->where('transaction_id', $tx->id)
                ->sum(DB::raw('cost_price * quantity'));

            DB::table('transaction_profits')->insert([
                'transaction_id' => $tx->id,
                'total_revenue' => $tx->total_amount,
                'total_cost' => $totalCost,
                'profit' => $tx->total_amount - $totalCost,
                'created_at' => $tx->created_at,
                'updated_at' => $tx->updated_at,
            ]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('transaction_profits');
    }
};
