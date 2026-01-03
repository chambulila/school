<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreStudentBillingRequest;
use App\Http\Requests\Admin\UpdateStudentBillingRequest;
use App\Models\AcademicYear;
use App\Models\Student;
use App\Models\StudentBilling;
use App\Models\FeeStructure;
use App\Services\BillingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;
use App\Services\AuditService;

class StudentBillingController extends Controller
{
    public function index(Request $request): Response
    {
        ifCan('view-student-billings');
        $bills = StudentBilling::query()
            ->with(['student.user:id,first_name,last_name,email', 'academicYear:id,year_name,is_active', 'feeStructure.feeCategory'])
            ->filter($request->only('search'))
            ->orderBy('created_at', 'desc')
            ->paginate($request->input('perPage', 10))
            ->withQueryString()
            ->through(fn($bill) => [
                'bill_id' => $bill->bill_id,
                'student' => [
                    'id' => $bill->student->id,
                    'user' => [
                        'id' => $bill->student->user->id,
                        'first_name' => $bill->student->user->first_name,
                        'last_name' => $bill->student->user->last_name,
                        'email' => $bill->student->user->email,
                        'admission_number' => $bill->student->admission_number,
                        'grade' => $bill->student->grade,
                    ],
                ],
                'academic_year' => [
                    'id' => $bill->academicYear->id,
                    'year_name' => $bill->academicYear->year_name,
                    'is_active' => $bill->academicYear->is_active,
                ],
                'fee_category_name' => $bill->feeStructure?->feeCategory?->category_name ?? 'General',
                'total_amount' => $bill->total_amount,
                'status' => $bill->status,
                'due_date' => $bill->due_date,
                'amount_paid' => $bill->amount_paid,
                'balance' => $bill->balance,
                'paid_at' => $bill->paid_at,
                'created_at' => $bill->created_at->format('d-m-Y'),
                'updated_at' => $bill->updated_at->format('d-m-Y'),
            ]);

        return Inertia::render('dashboard/StudentBilling', [
            'bills' => $bills,
            'students' => Student::query()
                ->with(['user:id,first_name,last_name,email', 'currentClass.grade:id,grade_name'])
                ->orderBy('admission_number')
                ->select('id', 'admission_number', 'user_id', 'current_class_id')
                ->get()
                ->map(fn($s) => [
                    'id' => $s->id,
                    'admission_number' => $s->admission_number,
                    'user' => $s->user,
                    'grade_id' => $s->currentClass?->grade_id,
                    'grade_name' => $s->currentClass?->grade?->grade_name,
                ]),
            'years' => AcademicYear::query()->orderBy('year_name')->select('id', 'year_name', 'is_active')->get(),
            'feeStructures' => FeeStructure::with('feeCategory', 'grade')->get()->map(fn($fs) => [
                'id' => $fs->fee_structure_id,
                'name' => $fs->feeCategory->category_name . ' - ' . $fs->grade->grade_name . ' (' . $fs->amount . ')',
                'amount' => $fs->amount,
                'academic_year_id' => $fs->academic_year_id,
                'grade_id' => $fs->grade_id,
            ]),
            'filters' => $request->only('search'),
        ]);
    }

    public function store(StoreStudentBillingRequest $request, BillingService $billingService)
    {
        ifCan('create-student-billing');
        $validated = $request->validated();

        // Handle bulk creation if fee_structure_ids array is present
        if ($request->has('fee_structure_ids') && is_array($request->fee_structure_ids)) {
            return DB::transaction(function () use ($request, $validated, $billingService) {
                $student = Student::find($validated['student_id']);
                $academicYear = AcademicYear::find($validated['academic_year_id']);

                if ($student && $academicYear) {
                    try {
                        $count = $billingService->createManualBills(
                            $student,
                            $academicYear,
                            $request->fee_structure_ids,
                        );

                        AuditService::log(
                            actionType: 'CREATE_BULK',
                            entityName: 'StudentBilling',
                            entityId: $student->id, // Logging against student since multiple bills are created
                            oldValue: null,
                            newValue: ['count' => $count, 'fee_structure_ids' => $request->fee_structure_ids],
                            module: 'Fees & Billing',
                            category: 'Student Billing',
                            notes: "Created $count bills for student {$student->admission_number} in year {$academicYear->year_name}"
                        );

                        return back()->with('success', "$count student bills created");
                    } catch (\Exception $e) {
                        logger()->error('Failed to create bills: ' . $e->getMessage());
                        return back()->with('error', 'Failed to create bills: ' . $e->getMessage());
                    }
                }
                return back()->with('error', 'Invalid student or academic year.');
            });
        }

        // Handle single creation (legacy/manual)
        // StudentBilling::create($validated);
        return back()->with('success', 'Student bill created');
    }

    public function update(UpdateStudentBillingRequest $request, StudentBilling $studentBilling)
    {
        ifCan('edit-student-billing');
        
        return DB::transaction(function () use ($request, $studentBilling) {
            $oldValues = $studentBilling->toArray();
            $studentBilling->update($request->validated());
            
            AuditService::log(
                actionType: 'UPDATE',
                entityName: 'StudentBilling',
                entityId: $studentBilling->bill_id,
                oldValue: $oldValues,
                newValue: $studentBilling->refresh()->toArray(),
                module: 'Fees & Billing',
                category: 'Student Billing',
                notes: "Updated student bill {$studentBilling->bill_id}"
            );

            return back()->with('success', 'Student bill updated');
        });
    }

    public function destroy(StudentBilling $studentBilling)
    {
        ifCan('delete-student-billing');
        
        return DB::transaction(function () use ($studentBilling) {
            if (!$studentBilling) {
                return back()->with('error', 'Bill not found bill.');
            }

            // Prevent deletion if any payment (full or partial) has been recorded
            if ($studentBilling->payments()->exists()) {
                return back()->with('error', 'Cannot delete bill with recorded payments.');
            }

            $billId = $studentBilling->bill_id;
            $oldValues = $studentBilling->toArray();
            
            $studentBilling->delete();

            AuditService::log(
                actionType: 'DELETE',
                entityName: 'StudentBilling',
                entityId: $billId,
                oldValue: $oldValues,
                newValue: null,
                module: 'Fees & Billing',
                category: 'Student Billing',
                notes: "Deleted student bill $billId"
            );

            return back()->with('success', 'Student bill deleted');
        });
    }


}

