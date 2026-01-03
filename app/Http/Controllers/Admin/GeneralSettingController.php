<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\GlobalSetting;
use Inertia\Inertia;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;

use Illuminate\Support\Facades\DB;
use App\Services\AuditService;

class GeneralSettingController extends Controller
{
    public function edit()
    {
        ifCan('view-settings');
        // Fetch all settings as key-value pairs
        $settings = GlobalSetting::all()->pluck('value', 'key');

        return Inertia::render('dashboard/Settings', [
            'settings' => $settings,
        ]);
    }

    public function update(Request $request)
    {
        ifCan('edit-setting');

        $request->validate([
            'theme_color' => 'nullable|string|regex:/^#[a-fA-F0-9]{6}$/',
            'app_name' => 'nullable|string|max:255',
            'app_short_name' => 'nullable|string|max:50',
            'app_logo_light' => 'nullable|image|max:2048', // 2MB
            'app_logo_dark' => 'nullable|image|max:2048',
            'app_favicon' => 'nullable|image|mimes:ico,png|max:1024',
        ]);

        return DB::transaction(function () use ($request) {
            try {
                $input = $request->except(['app_logo_light', 'app_logo_dark', 'app_favicon']);
                
                // Track changes for audit log
                $oldSettings = GlobalSetting::whereIn('key', array_keys($input))->pluck('value', 'key')->toArray();
                $updatedSettings = [];

                // Handle file uploads
                foreach (['app_logo_light', 'app_logo_dark', 'app_favicon'] as $fileKey) {
                    if ($request->hasFile($fileKey)) {
                        // Delete old file if exists
                        $oldPath = GlobalSetting::where('key', $fileKey)->value('value');
                        if ($oldPath && Storage::disk('public')->exists($oldPath)) {
                            Storage::disk('public')->delete($oldPath);
                        }

                        // Store new file
                        $path = $request->file($fileKey)->store('settings', 'public');
                        $input[$fileKey] = $path;
                        $updatedSettings[$fileKey] = $path;
                    }
                }

                // Map input keys to database keys
                foreach ($input as $key => $value) {
                    if ($value === null) continue;

                    $setting = GlobalSetting::updateOrCreate(
                        ['key' => $key],
                        ['value' => $value]
                    );
                    
                    if (!isset($oldSettings[$key]) || $oldSettings[$key] !== $value) {
                        $updatedSettings[$key] = $value;
                    }
                }

                if (!empty($updatedSettings)) {
                    AuditService::log(
                        actionType: 'UPDATE',
                        entityName: 'GlobalSetting',
                        entityId: 'GLOBAL', // Using 'GLOBAL' as this affects multiple records
                        oldValue: $oldSettings,
                        newValue: $updatedSettings,
                        module: 'Settings',
                        category: 'General Settings',
                        notes: "Updated general settings: " . implode(', ', array_keys($updatedSettings))
                    );
                }

                // Clear cache
                Cache::forget('global_settings_all');

                return redirect()->back()->with('success', 'Settings updated successfully.');
            } catch (\Exception $e) {
                logger("Problem while updating settings. ". $e->getMessage());
                // In a transaction, throwing exception rolls back
                throw $e; 
            }
        });
    }
}
