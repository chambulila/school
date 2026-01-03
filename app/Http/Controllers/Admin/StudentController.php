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

use App\Services\AuditService;

class StudentController extends Controller
{
    public function index(Request $request): Response
    {
        ifCan('view-students');
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

                // Assign student role if exists
                $role = \App\Models\Role::where('slug', 'student')->first();
                if ($role) {
                    $user->roles()->syncWithoutDetaching([$role->id]);
                }
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

            AuditService::log(
                actionType: 'CREATE',
                entityName: 'Student',
                entityId: $student->id,
                oldValue: null,
                newValue: $student->toArray(),
                module: 'Academics',
                category: 'Students',
                notes: "Created student '{$student->admission_number}'" . ($userCreated ? " (New User Created)" : "")
            );

            // Handle automatic enrollment and billing
            if ($classSectionId && $academicYearId) {
                $enrollment = StudentEnrollment::create([
                    'student_id' => $student->id,
                    'class_section_id' => $classSectionId,
                    'academic_year_id' => $academicYearId,
                    'enrollment_date' => now(),
                ]);

                AuditService::log(
                    actionType: 'CREATE',
                    entityName: 'StudentEnrollment',
                    entityId: $enrollment->id,
                    oldValue: null,
                    newValue: $enrollment->toArray(),
                    module: 'Academics',
                    category: 'Student Enrollments',
                    notes: "Automatically enrolled new student in section ID {$classSectionId}"
                );

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
            $oldValues = $student->toArray();
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
                    $userUpdate['password'] = Hash::make($userUpdate['password']);
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
                    $enrollment = StudentEnrollment::create([
                        'student_id' => $student->id,
                        'class_section_id' => $classSectionId,
                        'academic_year_id' => $academicYearId,
                        'enrollment_date' => now(),
                    ]);

                    AuditService::log(
                        actionType: 'CREATE',
                        entityName: 'StudentEnrollment',
                        entityId: $enrollment->id,
                        oldValue: null,
                        newValue: $enrollment->toArray(),
                        module: 'Academics',
                        category: 'Student Enrollments',
                        notes: "Automatically enrolled existing student in section ID {$classSectionId}"
                    );

                    $academicYear = AcademicYear::find($academicYearId);
                    if ($academicYear) {
                        $billingService->generateBill($student, $academicYear);
                    }
                }
            }

            // Ensure current_class_id is updated on student
            $data['current_class_id'] = $classSectionId;

            // Remove non-student fields
            unset($data['academic_year_id']);

            $student->update($data);

            AuditService::log(
                actionType: 'UPDATE',
                entityName: 'Student',
                entityId: $student->id,
                oldValue: $oldValues,
                newValue: $student->refresh()->toArray(),
                module: 'Academics',
                category: 'Students',
                notes: "Updated student '{$student->admission_number}'"
            );

            return back()->with('success', 'Student updated');
        });
    }

    public function destroy(Student $student): RedirectResponse
    {
        ifCan('delete-student');

        return DB::transaction(function () use ($student) {
            $id = $student->id;
            $oldValues = $student->toArray();

            $student->delete();

            AuditService::log(
                actionType: 'DELETE',
                entityName: 'Student',
                entityId: $id,
                oldValue: $oldValues,
                newValue: null,
                module: 'Academics',
                category: 'Students',
                notes: "Deleted student '{$oldValues['admission_number']}'"
            );

            return back()->with('success', 'Student deleted');
        });
    }
}
