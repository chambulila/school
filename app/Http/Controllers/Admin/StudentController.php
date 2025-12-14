<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreStudentRequest;
use App\Http\Requests\Admin\UpdateStudentRequest;
use App\Models\ClassSection;
use App\Models\Student;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StudentController extends Controller
{
    public function index(Request $request): Response
    {
        $search = (string) $request->input('search', '');
        $perPage = (int) $request->input('perPage', 10);

        $students = Student::query()
            ->with(['user', 'currentClass.grade'])
            ->when($search !== '', function ($q) use ($search) {
                $q->where('admission_number', 'like', '%'.$search.'%')
                  ->orWhereHas('user', function ($uq) use ($search) {
                      $uq->where('first_name', 'like', '%'.$search.'%')
                         ->orWhere('last_name', 'like', '%'.$search.'%')
                         ->orWhere('email', 'like', '%'.$search.'%');
                  })
                  ->orWhereHas('currentClass', function ($cq) use ($search) {
                      $cq->where('section_name', 'like', '%'.$search.'%');
                  });
            })
            ->orderBy('admission_number')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('dashboard/Students', [
            'students' => $students,
            'users' => User::query()->orderBy('first_name')->get(),
            'sections' => ClassSection::query()->with('grade')->orderBy('section_name')->get(),
            'filters' => [
                'search' => $search,
                'perPage' => $perPage,
            ],
        ]);
    }

    public function store(StoreStudentRequest $request): RedirectResponse
    {
        Student::create($request->validated());
        return back()->with('success', 'Student created');
    }

    public function update(UpdateStudentRequest $request, Student $student): RedirectResponse
    {
        $student->update($request->validated());
        return back()->with('success', 'Student updated');
    }

    public function destroy(Student $student): RedirectResponse
    {
        $student->delete();
        return back()->with('success', 'Student deleted');
    }
}

