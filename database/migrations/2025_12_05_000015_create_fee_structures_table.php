<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('fee_structures')) {
        Schema::create('fee_structures', function (Blueprint $table) {
            $table->uuid('fee_structure_id')->primary();
            $table->foreignUuid('academic_year_id')->constrained('academic_years');
            $table->foreignUuid('grade_id')->constrained('grades');
            $table->uuid('fee_category_id');
            $table->decimal('amount', 10, 2);
            $table->timestamps();

            $table->foreign('fee_category_id')->references('fee_category_id')->on('fee_categories');
            $table->unique(['academic_year_id', 'grade_id', 'fee_category_id']);
        });
    }
    }

    public function down(): void
    {
        Schema::dropIfExists('fee_structures');
    }
};

