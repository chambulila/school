<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreUserRequest;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $users = User::filter($request)
            ->paginate((int) $request->input('perPage', 10))
            ->withQueryString();

        return Inertia::render('dashboard/users', [ // Note: Ensure the view path matches your actual file structure (admin/users vs dashboard/users)
            'users' => $users,
            'roles' => Role::query()->orderBy('role_name')->get(),
            'filters' => $request->all(),
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

