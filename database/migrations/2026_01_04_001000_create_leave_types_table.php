<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('leave_types', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('applicant_scope')->default('both'); // teacher|student|both
            $table->boolean('enabled')->default(true);
            $table->integer('max_days_per_year')->nullable();
            $table->boolean('requires_attachment')->default(false);
            $table->boolean('requires_approval')->default(true);
            $table->boolean('paid')->nullable(); // null for student types
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('leave_types');
    }
};

