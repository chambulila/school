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

class StudentEnrollmentController extends Controller
{
    public function index(Request $request): Response
    {
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
        $enrollment = StudentEnrollment::create($request->validated());
        
        // Generate bill automatically
        $student = Student::find($enrollment->student_id);
        $academicYear = AcademicYear::find($enrollment->academic_year_id);
        
        if ($student && $academicYear) {
            try {
                $billingService->generateBill($student, $academicYear);
                return back()->with('success', 'Student enrollment created and bill generated');
            } catch (\Exception $e) {
                return back()->with('warning', 'Student enrollment created but bill generation failed: ' . $e->getMessage());
            }
        }

        return back()->with('success', 'Student enrollment created');
    }

    public function update(UpdateStudentEnrollmentRequest $request, StudentEnrollment $studentEnrollment)
    {
        $studentEnrollment->update($request->validated());
        return back()->with('success', 'Student enrollment updated');
    }

    public function destroy(StudentEnrollment $studentEnrollment)
    {
        $studentEnrollment->delete();
        return back()->with('success', 'Student enrollment deleted');
    }
}

