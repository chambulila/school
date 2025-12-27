<?php

namespace Database\Seeders;

use App\Models\GlobalSetting;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class GlobalSettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
                // Seed default values
        $defaults = [
            'app.name' => 'School Management System',
            'app.short_name' => 'SMS',
            // 'theme.color' => '#000000',
            'theme_color' => '#03635b',
        ];

        foreach ($defaults as $key => $value) {
            GlobalSetting::updateOrCreate([
                'key' => $key,
                'value' => $value,
            ]);
        }
    }
}
