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
use App\Services\AuditService;
use Illuminate\Support\Facades\DB;

class TeacherController extends Controller
{
    public function index(Request $request): Response
    {
        ifCan('view-teachers');
        $teachers = Teacher::query()
            ->with('user')
            ->filter($request->only('search'))
            ->orderBy('employee_number')
            ->paginate($request->input('perPage', 10))
            ->withQueryString();

        return Inertia::render('dashboard/Teachers', [
            'teachers' => $teachers,
            'users' => User::query()->orderBy('first_name')->get(),
            'filters' => $request->only('search'),
        ]);
    }

    public function store(StoreTeacherRequest $request): RedirectResponse
    {
        ifCan('create-teacher');

        return DB::transaction(function () use ($request) {
            $data = $request->validated();
            $userCreated = false;
            
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
                $userCreated = true;
                
                // Assign teacher role if exists
                $role = \App\Models\Role::where('slug', 'teacher')->first();
                if ($role) {
                    $user->roles()->syncWithoutDetaching([$role->id]);
                }
            }
            
            unset($data['first_name'], $data['last_name'], $data['email'], $data['password'], $data['phone'], $data['gender'], $data['date_of_birth'], $data['address'], $data['guardian_name'], $data['guardian_phone']);
            
            $teacher = Teacher::create($data);

            AuditService::log(
                actionType: 'CREATE',
                entityName: 'Teacher',
                entityId: $teacher->id,
                oldValue: null,
                newValue: $teacher->toArray(),
                module: 'Academics',
                category: 'Teachers',
                notes: "Created teacher profile for user ID {$teacher->user_id}" . ($userCreated ? " (New User Created)" : "")
            );

            return back()->with('success', 'Teacher created');
        });
    }

    public function update(UpdateTeacherRequest $request, Teacher $teacher): RedirectResponse
    {
        ifCan('edit-teacher');

        return DB::transaction(function () use ($request, $teacher) {
            $oldValues = $teacher->toArray();
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
                    $userUpdate['password'] = Hash::make($userUpdate['password']);
                } else {
                    unset($userUpdate['password']);
                }
                $teacher->user()->update($userUpdate);
            }
            
            $teacher->update($data);

            AuditService::log(
                actionType: 'UPDATE',
                entityName: 'Teacher',
                entityId: $teacher->id,
                oldValue: $oldValues,
                newValue: $teacher->refresh()->toArray(),
                module: 'Academics',
                category: 'Teachers',
                notes: "Updated teacher profile for ID {$teacher->id}"
            );

            return back()->with('success', 'Teacher updated');
        });
    }

    public function destroy(Teacher $teacher): RedirectResponse
    {
        ifCan('delete-teacher');

        return DB::transaction(function () use ($teacher) {
            $id = $teacher->id;
            $oldValues = $teacher->toArray();
            
            $teacher->delete();

            AuditService::log(
                actionType: 'DELETE',
                entityName: 'Teacher',
                entityId: $id,
                oldValue: $oldValues,
                newValue: null,
                module: 'Academics',
                category: 'Teachers',
                notes: "Deleted teacher ID {$id}"
            );

            return back()->with('success', 'Teacher deleted');
        });
    }
}
