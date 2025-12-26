<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreStudentBillingRequest;
use App\Http\Requests\Admin\UpdateStudentBillingRequest;
use App\Models\AcademicYear;
use App\Models\Student;
use App\Models\StudentBilling;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StudentBillingController extends Controller
{
    public function index(Request $request): Response
    {
        $bills = StudentBilling::query()
            ->with(['student.user:id,first_name,last_name,email', 'academicYear:id,year_name,is_active'])
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
            'students' => Student::query()->with('user:id,first_name,last_name,email')->orderBy('admission_number')->select('id', 'admission_number', 'user_id')->get(),
            'years' => AcademicYear::query()->orderBy('year_name')->active()->select('id', 'year_name', 'is_active')->get(),
            'filters' => $request->only('search'),
        ]);
    }

    public function store(StoreStudentBillingRequest $request)
    {
        StudentBilling::create($request->validated());
        return back()->with('success', 'Student bill created');
    }

    public function update(UpdateStudentBillingRequest $request, StudentBilling $studentBilling)
    {
        $studentBilling->update($request->validated());
        return back()->with('success', 'Student bill updated');
    }

    public function destroy(StudentBilling $studentBilling)
    {
        $studentBilling->delete();
        return back()->with('success', 'Student bill deleted');
    }
}

