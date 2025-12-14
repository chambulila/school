<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreTeacherSubjectAssignmentRequest;
use App\Http\Requests\Admin\UpdateTeacherSubjectAssignmentRequest;
use App\Models\ClassSection;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\TeacherSubjectAssignment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TeacherSubjectAssignmentController extends Controller
{
    public function index(Request $request): Response
    {
        $search = (string) $request->input('search', '');
        $perPage = (int) $request->input('perPage', 10);

        $assignments = TeacherSubjectAssignment::query()
            ->with(['teacher.user', 'subject', 'classSection.grade'])
            ->when($search !== '', function ($q) use ($search) {
                $q->whereHas('teacher.user', function ($uq) use ($search) {
                    $uq->where('name', 'like', '%'.$search.'%')
                       ->orWhere('first_name', 'like', '%'.$search.'%')
                       ->orWhere('last_name', 'like', '%'.$search.'%');
                })
                ->orWhereHas('subject', function ($sq) use ($search) {
                    $sq->where('subject_name', 'like', '%'.$search.'%')
                       ->orWhere('subject_code', 'like', '%'.$search.'%');
                })
                ->orWhereHas('classSection', function ($cq) use ($search) {
                    $cq->where('section_name', 'like', '%'.$search.'%');
                });
            })
            ->orderBy('created_at', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('dashboard/TeacherSubjectAssignments', [
            'assignments' => $assignments,
            'teachers' => Teacher::query()->with('user')->orderBy('employee_number')->get(),
            'subjects' => Subject::query()->orderBy('subject_name')->get(),
            'sections' => ClassSection::query()->with('grade')->orderBy('section_name')->get(),
            'filters' => [
                'search' => $search,
                'perPage' => $perPage,
            ],
        ]);
    }

    public function store(StoreTeacherSubjectAssignmentRequest $request)
    {
        TeacherSubjectAssignment::create($request->validated());
        return back()->with('success', 'Teacher subject assignment created');
    }

    public function update(UpdateTeacherSubjectAssignmentRequest $request, TeacherSubjectAssignment $teacherSubjectAssignment)
    {
        $teacherSubjectAssignment->update($request->validated());
        return back()->with('success', 'Teacher subject assignment updated');
    }

    public function destroy(TeacherSubjectAssignment $teacherSubjectAssignment)
    {
        $teacherSubjectAssignment->delete();
        return back()->with('success', 'Teacher subject assignment deleted');
    }
}

