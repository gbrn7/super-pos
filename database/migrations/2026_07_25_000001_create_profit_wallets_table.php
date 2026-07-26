<?php

use App\Support\Enums\ProfitWalletStatusEnums;
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
            $table->decimal('total_inflow', 15, 2)->default(0.00);
            $table->decimal('total_outflow', 15, 2)->default(0.00);
            $table->string('status')->default(ProfitWalletStatusEnums::ACTIVE->value);
            $table->unsignedBigInteger('created_at');
            $table->unsignedBigInteger('updated_at');
            $table->softDeletes();
        });

        $now = time();
        DB::table('profit_wallets')->insert([
            'balance' => 0.00,
            'total_inflow' => 0.00,
            'total_outflow' => 0.00,
            'status' => ProfitWalletStatusEnums::ACTIVE->value,
            'created_at' => $now,
            'updated_at' => $now,
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('profit_wallets');
    }
};
