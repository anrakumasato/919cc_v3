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
        Schema::create('posts', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('parent_asin_id')->index();
            $table->char('child_asin', 13);
            $table->string('size', 50);
            $table->string('platform', 20)->default('twitter');
            $table->timestamp('posted_at');
            // 同一商品・サイズの24時間重複投稿チェック用
            $table->index(['parent_asin_id', 'child_asin', 'posted_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('posts');
    }
};
