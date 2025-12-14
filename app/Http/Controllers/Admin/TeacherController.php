<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreTeacherRequest;
use App\Http\Requests\Admin\UpdateTeacherRequest;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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
        Teacher::create($request->validated());
        return back()->with('success', 'Teacher created');
    }

    public function update(UpdateTeacherRequest $request, Teacher $teacher): RedirectResponse
    {
        $teacher->update($request->validated());
        return back()->with('success', 'Teacher updated');
    }

    public function destroy(Teacher $teacher): RedirectResponse
    {
        $teacher->delete();
        return back()->with('success', 'Teacher deleted');
    }
}

