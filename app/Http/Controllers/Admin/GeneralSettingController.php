<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\GlobalSetting;
use Inertia\Inertia;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;

class GeneralSettingController extends Controller
{
    public function edit()
    {
        // Fetch all settings as key-value pairs
        $settings = GlobalSetting::all()->pluck('value', 'key');

        return Inertia::render('dashboard/Settings', [
            'settings' => $settings,
        ]);
    }

    public function update(Request $request)
    {
        dd($request->all());
        $request->validate([
            'theme_color' => 'nullable|string|regex:/^#[a-fA-F0-9]{6}$/',
            'app_name' => 'nullable|string|max:255',
            'app_short_name' => 'nullable|string|max:50',
            'app_logo_light' => 'nullable|image|max:2048', // 2MB
            'app_logo_dark' => 'nullable|image|max:2048',
            'app_favicon' => 'nullable|image|mimes:ico,png|max:1024',
        ]);

        try {
            $input = $request->except(['app_logo_light', 'app_logo_dark', 'app_favicon']);

            // Handle file uploads
            foreach (['app_logo_light', 'app_logo_dark', 'app_favicon'] as $fileKey) {
                if ($request->hasFile($fileKey)) {
                    // Delete old file if exists
                    $oldPath = GlobalSetting::where('key', str_replace('_', '.', $fileKey))->value('value');
                    if ($oldPath && Storage::disk('public')->exists($oldPath)) {
                        Storage::disk('public')->delete($oldPath);
                    }

                    // Store new file
                    $path = $request->file($fileKey)->store('settings', 'public');
                    $input[$fileKey] = $path;
                }
            }

            // Map input keys to database keys (underscores to dots for standard config style if preferred,
            // but we are using underscores in input for easier JS handling, converting to dots for storage)
            foreach ($input as $key => $value) {
                if ($value === null) continue;

                $dbKey = str_replace('_', '.', $key); // theme_primary_color -> theme.primary_color

                GlobalSetting::updateOrCreate(
                    ['key' => $dbKey],
                    ['value' => $value]
                );
            }

            // Clear cache
            Cache::forget('global_settings_all');

            return redirect()->back()->with('success', 'Settings updated successfully.');
        } catch (\Exception $e) {
            logger("Problem while updating settings. ". $e->getMessage());
            return redirect()->back()->with('error', 'Failed to update settings: ' . $e->getMessage());
        }
    }
}
