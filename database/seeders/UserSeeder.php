<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
                $user = User::updateOrCreate(
            ['email' => 'admin@gmail.com'],
            [
                'first_name' => 'SuperAdmin',
                'last_name' => 'User',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        $adminRoleId = Role::where('role_name', 'super-admin')->value('id');
        if ($adminRoleId) {
            $user->roles()->sync([$adminRoleId]);
        }
    }
}
