<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Gate;
use App\Models\User;
use App\Models\Permission;
use Illuminate\Support\Facades\Schema;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::before(function (User $user, $ability) {
            if ($user->roles()->where('role_name', 'super-admin')->exists()) {
                return true;
            }
        });

        // Dynamically define gates for all permissions
        try {
            if (Schema::hasTable('permissions')) {
                // Fetch all permission slugs.
                // Using cache here would be better for performance in production.
                $permissions = cache()->remember('permissions.slugs', 3600, function () {
                    return Permission::pluck('slug');
                });

                foreach ($permissions as $slug) {
                    Gate::define($slug, function (User $user) use ($slug) {
                        return $user->hasPermission($slug);
                    });
                }
            }
        } catch (\Exception $e) {
            // Permissions table might not exist yet during migration
        }
    }
}
