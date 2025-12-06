<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreUserRequest;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('dashboard/users', [
            'users' => User::query()->with('roles')->orderBy('first_name')->get(),
            'roles' => Role::query()->orderBy('role_name')->get(),
        ]);
    }

    public function store(StoreUserRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['password'] = Hash::make($data['password']);
        $user = User::create($data);
        if (!empty($data['roles'])) {
            $user->roles()->sync($data['roles']);
        }
        return back()->with('success', 'User created');
    }

    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $data = $request->validated();
        if (!empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }
        $user->update($data);
        if (array_key_exists('roles', $data)) {
            $user->roles()->sync($data['roles'] ?? []);
        }
        return back()->with('success', 'User updated');
    }

    public function destroy(User $user): RedirectResponse
    {
        $user->delete();
        return back()->with('success', 'User deleted');
    }
}

