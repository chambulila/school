<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_receipts', function (Blueprint $table) {
            $table->uuid('receipt_id')->primary();
            $table->uuid('payment_id');
            $table->string('receipt_number')->unique();
            $table->timestamp('issued_at');
            $table->foreignUuid('generated_by')->constrained('users');
            $table->timestamps();

            $table->foreign('payment_id')->references('payment_id')->on('payments')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_receipts');
    }
};

