<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student_billing', function (Blueprint $table) {
            $table->uuid('bill_id')->primary();
            $table->foreignUuid('student_id')->constrained('students');
            $table->foreignUuid('academic_year_id')->constrained('academic_years');
            $table->decimal('total_amount', 10, 2);
            $table->decimal('amount_paid', 10, 2)->default(0);
            $table->decimal('balance', 10, 2);
            $table->enum('status', ['Pending', 'Partially Paid', 'Fully Paid'])->default('Pending');
            $table->timestamps();

            $table->index(['student_id', 'academic_year_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_billing');
    }
};

