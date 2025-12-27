<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreStudentRequest;
use App\Http\Requests\Admin\UpdateStudentRequest;
use App\Models\AcademicYear;
use App\Models\ClassSection;
use App\Models\Student;
use App\Models\StudentEnrollment;
use App\Models\User;
use App\Services\BillingService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class StudentController extends Controller
{
    public function index(Request $request): Response
    {
        $perPage = (int) $request->input('perPage', 10);

        $students = Student::query()
            ->filter($request)
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('dashboard/Students', [
            'students' => $students,
            'users' => User::query()->orderBy('first_name')->get(),
            'sections' => ClassSection::query()->with('grade')->orderBy('section_name')->get(),
            'years' => AcademicYear::query()->orderBy('year_name')->get(),
            'filters' => $request->all(),
        ]);
    }

    public function store(StoreStudentRequest $request, BillingService $billingService): RedirectResponse
    {
        return DB::transaction(function () use ($request, $billingService) {
            $data = $request->validated();

            // Extract enrollment fields
            $classSectionId = $data['class_section_id'] ?? $data['current_class_id'] ?? null;
            $academicYearId = $data['academic_year_id'] ?? null;

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

            // Remove user fields and extra enrollment fields
            $fieldsToRemove = [
                'first_name', 'last_name', 'email', 'password', 'phone',
                'gender', 'date_of_birth', 'address', 'guardian_name',
                'guardian_phone', 'class_section_id', 'academic_year_id'
            ];

            foreach ($fieldsToRemove as $field) {
                unset($data[$field]);
            }

            // If enrolling, set current_class_id
            if ($classSectionId) {
                $data['current_class_id'] = $classSectionId;
            }

            $student = Student::create($data);

            // Handle automatic enrollment and billing
            if ($classSectionId && $academicYearId) {
                StudentEnrollment::create([
                    'student_id' => $student->id,
                    'class_section_id' => $classSectionId,
                    'academic_year_id' => $academicYearId,
                    'enrollment_date' => now(),
                ]);

                $academicYear = AcademicYear::find($academicYearId);
                if ($academicYear) {
                    $billingService->generateBill($student, $academicYear);
                }

                return back()->with('success', 'Student created, enrolled and billed successfully');
            }

            return back()->with('success', 'Student created');
        });
    }

    public function update(UpdateStudentRequest $request, Student $student, BillingService $billingService): RedirectResponse
    {
        return DB::transaction(function () use ($request, $student, $billingService) {
            $data = $request->validated();

            // Extract enrollment fields
            $academicYearId = $data['academic_year_id'] ?? null;
            $classSectionId = $data['current_class_id'] ?? null;

            // Handle User Updates
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
                $student->user()->update($userUpdate);
            }

            // Handle Enrollment and Billing if Academic Year and Class Section are provided
            if ($academicYearId && $classSectionId) {
                // Check if already enrolled in this year
                $existingEnrollment = StudentEnrollment::where('student_id', $student->id)
                    ->where('academic_year_id', $academicYearId)
                    ->first();

                if (!$existingEnrollment) {
                    StudentEnrollment::create([
                        'student_id' => $student->id,
                        'class_section_id' => $classSectionId,
                        'academic_year_id' => $academicYearId,
                        'enrollment_date' => now(),
                    ]);

                    $academicYear = AcademicYear::find($academicYearId);
                    if ($academicYear) {
                        $billingService->generateBill($student, $academicYear);
                    }
                } // else {
                    // Update existing enrollment if class changed
                    //  if ($existingEnrollment->class_section_id !== $classSectionId) {
                    //     $existingEnrollment->update([
                    //         'class_section_id' => $classSectionId
                    //     ]);
                        // Should we regenerate bill?
                        // If grade changes, fee structure might change.
                        // BillingService check if bill exists and returns it.
                        // If we want to update the bill, we might need more logic.
                        // For now, let's just update enrollment.
                    //  }
                }

                // Ensure current_class_id is updated on student
                $data['current_class_id'] = $classSectionId;

            // Remove non-student fields
            unset($data['academic_year_id']);

            $student->update($data);
            return back()->with('success', 'Student updated');
        });
    }

    public function destroy(Student $student): RedirectResponse
    {
        $student->delete();
        return back()->with('success', 'Student deleted');
    }
}
