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

use App\Services\AuditService;
use Illuminate\Support\Facades\DB;

class TeacherSubjectAssignmentController extends Controller
{
    public function index(Request $request): Response
    {
        ifCan('view-teacher-subjects');
        $perPage = (int) $request->input('perPage', 10);

        $assignments = TeacherSubjectAssignment::query()
            ->filter($request)
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('dashboard/TeacherSubjectAssignments', [
            'assignments' => $assignments,
            'teachers' => Teacher::query()->with('user')->orderBy('employee_number')->get(),
            'subjects' => Subject::query()->orderBy('subject_name')->get(),
            'sections' => ClassSection::query()->with('grade')->orderBy('section_name')->get(),
            'filters' => $request->all(),
        ]);
    }

    public function store(StoreTeacherSubjectAssignmentRequest $request)
    {
        ifCan('create-teacher-subject');

        return DB::transaction(function () use ($request) {
            $assignment = TeacherSubjectAssignment::create($request->validated());

            AuditService::log(
                actionType: 'CREATE',
                entityName: 'TeacherSubjectAssignment',
                entityId: $assignment->id,
                oldValue: null,
                newValue: $assignment->toArray(),
                module: 'Academics',
                category: 'Teacher Subjects',
                notes: "Assigned subject ID {$assignment->subject_id} to teacher ID {$assignment->teacher_id}"
            );

            return back()->with('success', 'Teacher subject assignment created');
        });
    }

    public function update(UpdateTeacherSubjectAssignmentRequest $request, TeacherSubjectAssignment $teacherSubjectAssignment)
    {
        ifCan('edit-teacher-subject');

        return DB::transaction(function () use ($request, $teacherSubjectAssignment) {
            $oldValues = $teacherSubjectAssignment->toArray();
            $teacherSubjectAssignment->update($request->validated());

            AuditService::log(
                actionType: 'UPDATE',
                entityName: 'TeacherSubjectAssignment',
                entityId: $teacherSubjectAssignment->id,
                oldValue: $oldValues,
                newValue: $teacherSubjectAssignment->refresh()->toArray(),
                module: 'Academics',
                category: 'Teacher Subjects',
                notes: "Updated assignment ID {$teacherSubjectAssignment->id}"
            );

            return back()->with('success', 'Teacher subject assignment updated');
        });
    }

    public function destroy(TeacherSubjectAssignment $teacherSubjectAssignment)
    {
        ifCan('delete-teacher-subject');

        return DB::transaction(function () use ($teacherSubjectAssignment) {
            $id = $teacherSubjectAssignment->id;
            $oldValues = $teacherSubjectAssignment->toArray();

            $teacherSubjectAssignment->delete();

            AuditService::log(
                actionType: 'DELETE',
                entityName: 'TeacherSubjectAssignment',
                entityId: $id,
                oldValue: $oldValues,
                newValue: null,
                module: 'Academics',
                category: 'Teacher Subjects',
                notes: "Deleted assignment ID {$id}"
            );

            return back()->with('success', 'Teacher subject assignment deleted');
        });
    }
}

