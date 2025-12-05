<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('grades', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('grade_name');
            $table->timestamps();

            $table->unique('grade_name');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('grades');
    }
};

