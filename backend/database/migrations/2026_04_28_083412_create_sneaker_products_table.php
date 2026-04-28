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
        Schema::create('sneaker_products', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('parent_asin_id')->index();  // 既存 parent_asin.id を参照
            $table->string('name');                              // Amazonから自動取得
            $table->string('seo_name')->nullable();             // ダッシュボードで手動入力（SEO用）
            $table->string('brand', 100)->index();
            $table->text('image_url')->nullable();
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sneaker_products');
    }
};
