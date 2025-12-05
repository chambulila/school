<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('roles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('role_name');
            $table->text('description')->nullable();
            $table->timestamps();

            $table->unique('role_name');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('roles');
    }
};

