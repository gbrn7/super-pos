<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('master_products', function (Blueprint $table) {
            $table->id();
            $table->string('category_name')->nullable();
            $table->string('unit_name')->nullable();
            $table->string('name')->index();
            $table->string('barcode')->index()->unique()->nullable();
            $table->text('desc')->nullable();
            $table->decimal('price', 10, 2)->default(0);
            $table->decimal('cost_price', 10, 2)->default(0);
            $table->unsignedBigInteger('created_at');
            $table->unsignedBigInteger('updated_at');
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('master_products');
    }
};
