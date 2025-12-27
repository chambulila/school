<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Permission;
use App\Models\Role;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        $modules = [
            'User Management' => ['view', 'create', 'edit', 'delete'],
            'Roles' => ['view', 'create', 'edit', 'delete', 'manage-permissions'],
            'People' => ['view'],
            'Products' => ['view'],
            'Sales' => ['view'],
        ];

        foreach ($modules as $module => $actions) {
            foreach ($actions as $slug) {
                Permission::firstOrCreate(
                    ['module' => $module, 'slug' => $slug],
                    ['name' => ucfirst($slug), 'description' => null]
                );
            }
        }

        $admin = Role::where('role_name', 'Admin')->first();
        if ($admin) {
            $permissionIds = Permission::pluck('id')->all();
            $admin->permissions()->syncWithoutDetaching($permissionIds);
        }
    }
}

