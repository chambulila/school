<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('class_sections', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('grade_id')->constrained('grades');
            $table->string('section_name');
            $table->uuid('class_teacher_id')->nullable();
            $table->timestamps();

            $table->unique(['grade_id', 'section_name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('class_sections');
    }
};
