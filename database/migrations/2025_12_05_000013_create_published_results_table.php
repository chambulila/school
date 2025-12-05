<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('published_results', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('exam_id')->constrained('exams');
            $table->foreignUuid('class_section_id')->constrained('class_sections');
            $table->foreignUuid('published_by')->constrained('users');
            $table->timestamp('published_at');
            $table->boolean('notification_sent')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('published_results');
    }
};

