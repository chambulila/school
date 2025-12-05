<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            ['role_name' => 'Admin', 'description' => 'System administrator'],
            ['role_name' => 'Teacher', 'description' => null],
            ['role_name' => 'Accountant', 'description' => null],
            ['role_name' => 'Librarian', 'description' => null],
            ['role_name' => 'Parent', 'description' => null],
            ['role_name' => 'Student', 'description' => null],
        ];

        foreach ($roles as $r) {
            Role::firstOrCreate(['role_name' => $r['role_name']], ['description' => $r['description']]);
        }
    }
}

