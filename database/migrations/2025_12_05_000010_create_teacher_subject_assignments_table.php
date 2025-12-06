<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('teacher_subject_assignments')) {
            Schema::create('teacher_subject_assignments', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->foreignUuid('teacher_id')->constrained('teachers');
                $table->foreignUuid('subject_id')->constrained('subjects');
                $table->foreignUuid('class_section_id')->constrained('class_sections');
                $table->timestamps();
            });
        }

        $indexExists = DB::table('information_schema.statistics')
            ->where('table_schema', DB::getDatabaseName())
            ->where('table_name', 'teacher_subject_assignments')
            ->where('index_name', 'teacher_subject_unique')
            ->exists();

        if (! $indexExists) {
            Schema::table('teacher_subject_assignments', function (Blueprint $table) {
                $table->unique(['teacher_id', 'subject_id', 'class_section_id'], 'teacher_subject_unique');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('teacher_subject_assignments');
    }
};
