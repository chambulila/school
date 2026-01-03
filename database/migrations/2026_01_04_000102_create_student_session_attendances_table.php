<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student_session_attendances', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('student_id')->constrained('students');
            $table->foreignUuid('class_section_id')->constrained('class_sections');
            $table->foreignUuid('subject_id')->constrained('subjects');
            $table->date('date');
            $table->string('period')->nullable();
            $table->string('status');
            $table->text('remarks')->nullable();
            $table->foreignUuid('marked_by')->constrained('users');
            $table->timestamps();
            $table->unique(['student_id', 'class_section_id', 'subject_id', 'date', 'period']);
            $table->index(['class_section_id', 'subject_id', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_session_attendances');
    }
};

