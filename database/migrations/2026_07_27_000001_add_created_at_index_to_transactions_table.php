<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->index('created_at');
            $table->index(['created_at', 'payment_method_id']);
        });

        Schema::table('transaction_detail', function (Blueprint $table) {
            $table->index(['transaction_id', 'product_id']);
        });
    }

    public function down(): void
    {
        Schema::table('transaction_detail', function (Blueprint $table) {
            $table->dropIndex(['transaction_id', 'product_id']);
        });

        Schema::table('transactions', function (Blueprint $table) {
            $table->dropIndex(['created_at', 'payment_method_id']);
            $table->dropIndex(['created_at']);
        });
    }
};
