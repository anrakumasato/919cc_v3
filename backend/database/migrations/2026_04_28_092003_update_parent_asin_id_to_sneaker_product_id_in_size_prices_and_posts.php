<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement('ALTER TABLE size_prices CHANGE parent_asin_id sneaker_product_id INT(10) UNSIGNED NOT NULL');
        DB::statement('ALTER TABLE posts CHANGE parent_asin_id sneaker_product_id INT(10) UNSIGNED NOT NULL');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE size_prices CHANGE sneaker_product_id parent_asin_id INT(10) UNSIGNED NOT NULL');
        DB::statement('ALTER TABLE posts CHANGE sneaker_product_id parent_asin_id INT(10) UNSIGNED NOT NULL');
    }
};
