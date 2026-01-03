<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('leave_balances', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('teacher_id')->constrained('teachers')->cascadeOnDelete();
            $table->foreignUuid('leave_type_id')->constrained('leave_types')->cascadeOnDelete();
            $table->string('year');
            $table->integer('used_days')->default(0);
            $table->integer('limit_days')->nullable();
            $table->timestamps();
            $table->unique(['teacher_id', 'leave_type_id', 'year'], 'leave_balances_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('leave_balances');
    }
};

