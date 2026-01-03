<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('leave_approvals', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('leave_request_id')->constrained('leave_requests')->cascadeOnDelete();
            $table->foreignUuid('approver_id')->constrained('users');
            $table->string('action'); // Approved|Rejected|Cancelled
            $table->text('comment')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('leave_approvals');
    }
};

