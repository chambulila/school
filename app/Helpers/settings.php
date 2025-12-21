<?php

if (! function_exists('setting')) {
    function setting($key, $default = null)
    {
        // Try to get from cache first
        $settings = \Illuminate\Support\Facades\Cache::remember('global_settings_all', 3600, function () {
            return \App\Models\GlobalSetting::all()->pluck('value', 'key');
        });

        return $settings->get($key, $default);
    }
}
