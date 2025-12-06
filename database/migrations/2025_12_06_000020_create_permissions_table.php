<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('permissions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('module');
            $table->string('slug');
            $table->string('name');
            $table->string('description')->nullable();
            $table->timestamps();
            $table->unique(['module', 'slug']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('permissions');
    }
};

