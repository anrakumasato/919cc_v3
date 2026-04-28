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
        Schema::create('size_prices', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('parent_asin_id')->index();
            $table->char('child_asin', 13);                          // 子ASIN
            $table->string('size', 50);                              // "22.5cm" など
            $table->unsignedInteger('price');                        // 現在価格（円）
            $table->unsignedInteger('standard_price');               // 中央値（標準価格）
            $table->boolean('is_anomaly')->default(false)->index();
            $table->decimal('discount_rate', 5, 4)->nullable();      // 0.1500 = 15%
            $table->timestamp('fetched_at');
            $table->index(['parent_asin_id', 'fetched_at']);
            $table->index(['is_anomaly', 'fetched_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('size_prices');
    }
};
