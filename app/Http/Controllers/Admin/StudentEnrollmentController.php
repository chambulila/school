<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreStudentEnrollmentRequest;
use App\Http\Requests\Admin\UpdateStudentEnrollmentRequest;
use App\Models\AcademicYear;
use App\Models\ClassSection;
use App\Models\Student;
use App\Models\StudentEnrollment;
use App\Services\BillingService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

use App\Services\AuditService;
use Illuminate\Support\Facades\DB;

class StudentEnrollmentController extends Controller
{
    public function index(Request $request): Response
    {
        ifCan('view-student-enrollments');
        $perPage = (int) $request->input('perPage', 10);

        $enrollments = StudentEnrollment::query()
            ->filter($request)
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('dashboard/StudentEnrollments', [
            'enrollments' => $enrollments,
            'students' => Student::query()->with('user')->orderBy('admission_number')->get(),
            'sections' => ClassSection::query()->with('grade')->orderBy('section_name')->get(),
            'years' => AcademicYear::query()->orderBy('year_name')->get(),
            'filters' => $request->all(),
        ]);
    }

    public function store(StoreStudentEnrollmentRequest $request, BillingService $billingService)
    {
        ifCan('create-student-enrollment');

        return DB::transaction(function () use ($request, $billingService) {
            $enrollment = StudentEnrollment::create($request->validated());

            // Generate bill automatically
            $student = Student::find($enrollment->student_id);
            $academicYear = AcademicYear::find($enrollment->academic_year_id);

            AuditService::log(
                actionType: 'CREATE',
                entityName: 'StudentEnrollment',
                entityId: $enrollment->id,
                oldValue: null,
                newValue: $enrollment->toArray(),
                module: 'Academics',
                category: 'Student Enrollments',
                notes: "Enrolled student ID {$enrollment->student_id} in section ID {$enrollment->class_section_id}"
            );

            if ($student && $academicYear) {
                try {
                    $billingService->generateBill($student, $academicYear);
                    return back()->with('success', 'Student enrollment created and bill generated');
                } catch (\Exception $e) {
                    return back()->with('warning', 'Student enrollment created but bill generation failed: ' . $e->getMessage());
                }
            }

            return back()->with('success', 'Student enrollment created');
        });
    }

    public function update(UpdateStudentEnrollmentRequest $request, StudentEnrollment $studentEnrollment)
    {
        ifCan('edit-student-enrollment');

        return DB::transaction(function () use ($request, $studentEnrollment) {
            $oldValues = $studentEnrollment->toArray();
            $studentEnrollment->update($request->validated());

            AuditService::log(
                actionType: 'UPDATE',
                entityName: 'StudentEnrollment',
                entityId: $studentEnrollment->id,
                oldValue: $oldValues,
                newValue: $studentEnrollment->refresh()->toArray(),
                module: 'Academics',
                category: 'Student Enrollments',
                notes: "Updated enrollment ID {$studentEnrollment->id}"
            );

            return back()->with('success', 'Student enrollment updated');
        });
    }

    public function destroy(StudentEnrollment $studentEnrollment)
    {
        ifCan('delete-student-enrollment');

        return DB::transaction(function () use ($studentEnrollment) {
            $id = $studentEnrollment->id;
            $oldValues = $studentEnrollment->toArray();

            $studentEnrollment->delete();

            AuditService::log(
                actionType: 'DELETE',
                entityName: 'StudentEnrollment',
                entityId: $id,
                oldValue: $oldValues,
                newValue: null,
                module: 'Academics',
                category: 'Student Enrollments',
                notes: "Deleted enrollment ID {$id}"
            );

            return back()->with('success', 'Student enrollment deleted');
        });
    }
}

