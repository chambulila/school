<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fee_notifications', function (Blueprint $table) {
            $table->uuid('fee_notification_id')->primary();
            $table->foreignUuid('student_id')->constrained('students');
            $table->uuid('bill_id');
            $table->text('message');
            $table->timestamp('sent_at')->nullable();
            $table->timestamps();

            $table->foreign('bill_id')->references('bill_id')->on('student_billing')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fee_notifications');
    }
};

