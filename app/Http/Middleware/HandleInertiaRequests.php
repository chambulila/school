<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Session;
use App\Models\GeneralSetting;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');
        $user = $request->user();

        // Load user roles and permissions properly
        if ($user) {
            $user->load('roles');
            $permissions = $user->getAllPermissions()->pluck('name');
        } else {
            $permissions = collect();
        }

        $time = now()->format('H:i:s');
        $append = function ($msg) use ($time) {
            return $msg ? ($msg.' '.$time) : null;
        };

        // Cache settings for performance (1 hour)
        $settings = Cache::remember('general_settings', 3600, function () {
            return GeneralSetting::first();
        });

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'settings' => $settings,
            'auth' => [
                // 'user' => $request->user(),
                'user' => $request->user() ? [
                    'id' => $user->id,
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name,
                    'email' => $user->email,
                    'roles' => $user->roles->select(['id', 'role_name'])
                ] : null,
                'can' => $permissions,
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'flash' => [
                'success' => $append(Session::get('success')),
                'error' => $append(Session::get('error')),
                'warning' => $append(Session::get('warning')),
                'info' => $append(Session::get('info')),
            ],
        ];
    }
}
