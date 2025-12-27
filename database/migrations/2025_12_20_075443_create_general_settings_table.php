<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::dropIfExists('general_settings');

        // Schema::create('general_settings', function (Blueprint $table) {
        //     $table->id();
        //     $table->string('theme_primary_color')->default('#03635b'); // Fallback/Default
        //     $table->timestamps();
        // });

        // Insert default record
        // DB::table('general_settings')->insert([
        //     'theme_primary_color' => '#03635b',
        //     'created_at' => now(),
        //     'updated_at' => now(),
        // ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('general_settings');
    }
};
