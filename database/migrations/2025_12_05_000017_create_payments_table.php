<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->uuid('payment_id')->primary();
            $table->uuid('bill_id');
            $table->foreignUuid('student_id')->constrained('students');
            $table->date('payment_date');
            $table->decimal('amount_paid', 10, 2);
            $table->enum('payment_method', ['Cash', 'Bank', 'Mobile Money'])->nullable();
            $table->string('transaction_reference')->nullable();
            $table->foreignUuid('received_by')->constrained('users');
            $table->timestamps();

            $table->foreign('bill_id')->references('bill_id')->on('student_billing')->cascadeOnDelete();
            $table->unique('transaction_reference');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};

