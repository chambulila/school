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
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('user_name')->nullable();
            $table->string('role')->nullable();
            $table->string('action_type'); // CREATE, UPDATE, DELETE, LOGIN, etc.
            $table->string('entity_name'); // Model name e.g., Student, Payment
            $table->string('entity_id'); // ID of the entity
            $table->text('old_value')->nullable();
            $table->text('new_value')->nullable();
            $table->string('module')->nullable(); // e.g., Prospecting, Billing
            $table->string('category')->nullable(); // e.g., Engagement History
            $table->string('ip_address')->nullable();
            $table->string('browser')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
