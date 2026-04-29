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
        Schema::table('sneaker_products', function (Blueprint $table) {
            $table->char('parent_asin', 13)->after('id')->index();
        });
    }

    public function down(): void
    {
        Schema::table('sneaker_products', function (Blueprint $table) {
            $table->dropIndex(['parent_asin']);
            $table->dropColumn('parent_asin');
        });
    }
};
