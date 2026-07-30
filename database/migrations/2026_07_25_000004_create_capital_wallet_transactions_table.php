<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('capital_wallet_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('capital_wallet_id')->constrained('capital_wallets')->cascadeOnDelete();
            $table->decimal('amount', 15, 2);
            $table->enum('type', ['in', 'out']);
            $table->string('transaction_type');
            $table->nullableMorphs('reference');
            $table->decimal('balance_before', 15, 2);
            $table->decimal('balance_after', 15, 2);
            $table->text('notes')->nullable();
            $table->unsignedBigInteger('created_at');
            $table->unsignedBigInteger('updated_at');
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('capital_wallet_transactions');
    }
};
