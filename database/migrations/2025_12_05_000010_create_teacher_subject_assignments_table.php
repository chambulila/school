<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('teacher_subject_assignments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('teacher_id')->constrained('teachers');
            $table->foreignUuid('subject_id')->constrained('subjects');
            $table->foreignUuid('class_section_id')->constrained('class_sections');
            $table->timestamps();

            $table->unique(['teacher_id', 'subject_id', 'class_section_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('teacher_subject_assignments');
    }
};

