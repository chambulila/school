<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('published_results', function (Blueprint $table) {
            if (!Schema::hasColumn('published_results', 'subject_id')) {
                $table->foreignUuid('subject_id')->nullable()->constrained('subjects');
            }
            if (!Schema::hasColumn('published_results', 'publish_scope')) {
                $table->string('publish_scope')->default('section');
            }
            $table->index(['exam_id', 'class_section_id', 'subject_id'], 'published_results_scope_idx');
        });
    }

    public function down(): void
    {
        Schema::table('published_results', function (Blueprint $table) {
            $table->dropIndex('published_results_scope_idx');
            if (Schema::hasColumn('published_results', 'subject_id')) {
                $table->dropConstrainedForeignId('subject_id');
            }
            if (Schema::hasColumn('published_results', 'publish_scope')) {
                $table->dropColumn('publish_scope');
            }
        });
    }
};

