<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\GeneralSetting;
use Inertia\Inertia;

class GeneralSettingController extends Controller
{
    public function edit()
    {
        $settings = GeneralSetting::first();

        return Inertia::render('dashboard/Settings', [
            'settings' => $settings,
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'theme_primary_color' => 'required|string|regex:/^#[a-fA-F0-9]{6}$/',
        ]);

        $settings = GeneralSetting::first();

        // If no record exists yet (though migration created one), create it
        try {
            if (!$settings) {
                $settings = new GeneralSetting();
            }

            $settings->theme_primary_color = $request->input('theme_primary_color');
            $settings->save();

            // Clear cache
            \Illuminate\Support\Facades\Cache::forget('general_settings');

            return redirect()->back()->with('success', 'Settings updated successfully.');
        } catch (\Exception $e) {
            logger("Problem while updating settings. ". $e->getMessage());
            return redirect()->back()->with('error', 'Failed to update settings: ' . $e->getMessage());
        }
    }
}
