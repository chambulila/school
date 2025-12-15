<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreTeacherRequest;
use App\Http\Requests\Admin\UpdateTeacherRequest;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class TeacherController extends Controller
{
    public function index(Request $request): Response
    {
        $search = (string) $request->input('search', '');
        $perPage = (int) $request->input('perPage', 10);

        $teachers = Teacher::query()
            ->with('user')
            ->when($search !== '', function ($q) use ($search) {
                $q->where('employee_number', 'like', '%'.$search.'%')
                  ->orWhereHas('user', function ($uq) use ($search) {
                         $uq->where('first_name', 'like', '%'.$search.'%')
                         ->orWhere('last_name', 'like', '%'.$search.'%')
                         ->orWhere('email', 'like', '%'.$search.'%');
                  });
            })
            ->orderBy('employee_number')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('dashboard/Teachers', [
            'teachers' => $teachers,
            'users' => User::query()->orderBy('first_name')->get(),
            'filters' => [
                'search' => $search,
                'perPage' => $perPage,
            ],
        ]);
    }

    public function store(StoreTeacherRequest $request): RedirectResponse
    {
        $data = $request->validated();
        if (empty($data['user_id'])) {
            $userPayload = [
                'first_name' => $data['first_name'],
                'last_name' => $data['last_name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'phone' => $data['phone'] ?? null,
                'gender' => $data['gender'] ?? null,
                'date_of_birth' => $data['date_of_birth'] ?? null,
                'address' => $data['address'] ?? null,
                'guardian_name' => $data['guardian_name'] ?? null,
                'guardian_phone' => $data['guardian_phone'] ?? null,
            ];
            $user = User::create($userPayload);
            $data['user_id'] = $user->id;
        }
        unset($data['first_name'], $data['last_name'], $data['email'], $data['password'], $data['phone'], $data['gender'], $data['date_of_birth'], $data['address'], $data['guardian_name'], $data['guardian_phone']);
        Teacher::create($data);
        return back()->with('success', 'Teacher created');
    }

    public function update(UpdateTeacherRequest $request, Teacher $teacher): RedirectResponse
    {
        $data = $request->validated();
        $userFields = ['first_name','last_name','email','password','phone','gender','date_of_birth','address','guardian_name','guardian_phone'];
        $hasUserUpdates = false;
        $userUpdate = [];
        foreach ($userFields as $field) {
            if (array_key_exists($field, $data)) {
                $hasUserUpdates = true;
                $userUpdate[$field] = $data[$field];
                unset($data[$field]);
            }
        }
        if ($hasUserUpdates) {
            if (!empty($userUpdate['password'])) {
                $userUpdate['password'] = \Illuminate\Support\Facades\Hash::make($userUpdate['password']);
            } else {
                unset($userUpdate['password']);
            }
            $teacher->user()->update($userUpdate);
        }
        $teacher->update($data);
        return back()->with('success', 'Teacher updated');
    }

    public function destroy(Teacher $teacher): RedirectResponse
    {
        $teacher->delete();
        return back()->with('success', 'Teacher deleted');
    }
}
