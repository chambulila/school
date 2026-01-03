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
        Schema::table('published_results', function (Blueprint $table) {
            $table->foreignUuid('subject_id')->nullable()->constrained('subjects');
            $table->string('publish_scope')->default('section');
            $table->index(['exam_id', 'class_section_id', 'subject_id'], 'published_results_scope_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('published_results', function (Blueprint $table) {
            $table->dropIndex('published_results_scope_idx');
            $table->dropConstrainedForeignId('subject_id');
            $table->dropColumn('publish_scope');
        });
    }
};
