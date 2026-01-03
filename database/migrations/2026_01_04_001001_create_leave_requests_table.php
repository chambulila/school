<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('leave_requests', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('applicant_type'); // teacher|student
            $table->uuid('applicant_id');
            $table->foreignUuid('leave_type_id')->constrained('leave_types');
            $table->date('start_date');
            $table->date('end_date');
            $table->integer('total_days');
            $table->string('status')->default('Pending'); // Pending|Approved|Rejected|Cancelled
            $table->text('reason');
            $table->string('attachment_path')->nullable();
            $table->foreignUuid('requested_by')->constrained('users');
            $table->foreignUuid('approved_by')->nullable()->constrained('users');
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();
            $table->index(['applicant_type', 'applicant_id', 'start_date', 'end_date'], 'leave_requests_applicant_date_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('leave_requests');
    }
};

