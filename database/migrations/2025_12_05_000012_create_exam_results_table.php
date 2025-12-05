<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('exam_results', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('student_id')->constrained('students');
            $table->foreignUuid('subject_id')->constrained('subjects');
            $table->foreignUuid('exam_id')->constrained('exams');
            $table->foreignUuid('class_section_id')->constrained('class_sections');
            $table->decimal('score', 5, 2)->nullable();
            $table->string('grade', 2)->nullable();
            $table->text('remarks')->nullable();
            $table->timestamps();

            $table->unique(['student_id', 'subject_id', 'exam_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exam_results');
    }
};

