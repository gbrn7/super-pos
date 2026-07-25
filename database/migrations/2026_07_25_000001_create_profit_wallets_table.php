<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('profit_wallets', function (Blueprint $table) {
            $table->id();
            $table->decimal('balance', 15, 2)->default(0.00);
            $table->string('status')->default('active');
            $table->unsignedBigInteger('created_at');
            $table->unsignedBigInteger('updated_at');
        });

        $now = time();
        DB::table('profit_wallets')->insert([
            'balance' => 0.00,
            'status' => 'active',
            'created_at' => $now,
            'updated_at' => $now,
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('profit_wallets');
    }
};
