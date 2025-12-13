<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Gate;
use App\Models\User;

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
        Gate::define('manage-users', function (User $user) {
            return $user->roles()->where('role_name', 'Admin')->exists();
        });

        Gate::define('manage-roles', function (User $user) {
            return $user->roles()->where('role_name', 'Admin')->exists();
        });

        Gate::define('manage-classes', function (User $user) {
            return $user->roles()->where('role_name', 'Admin')->exists();
        });
    }
}
