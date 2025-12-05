<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fee_categories', function (Blueprint $table) {
            $table->uuid('fee_category_id')->primary();
            $table->string('category_name');
            $table->text('description')->nullable();
            $table->timestamps();

            $table->unique('category_name');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fee_categories');
    }
};

