<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use App\Models\FeeCategory;
use App\Models\FeeStructure;
use App\Models\Grade;
use App\Models\Student;
use App\Models\StudentBilling;
use App\Models\User;
use App\Models\Payment;
use App\Models\PaymentReceipt;
use App\Models\FeeNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class FinanceDemoController extends Controller
{
    public function seed(): RedirectResponse
    {
        DB::transaction(function () {
            $year = AcademicYear::firstOrCreate(['year_name' => '2024/2025'], ['term_name' => 'Term 1', 'start_date' => now(), 'end_date' => now()->addMonths(3)]);
            $grade = Grade::firstOrCreate(['grade_name' => 'Grade 1']);

            $user = User::firstOrCreate(
                ['email' => 'demo.student@example.com'],
                ['name' => 'Demo Student', 'password' => bcrypt('password')]
            );
            $student = Student::firstOrCreate(
                ['admission_number' => 'ADM-DEMO-001'],
                ['user_id' => $user->id, 'first_name' => 'Demo', 'last_name' => 'Student', 'current_class_id' => null]
            );

            $tuition = FeeCategory::firstOrCreate(['category_name' => 'Tuition'], ['description' => 'Tuition fees']);
            $transport = FeeCategory::firstOrCreate(['category_name' => 'Transport'], ['description' => 'Transport fees']);

            FeeStructure::firstOrCreate(
                ['fee_category_id' => $tuition->fee_category_id, 'grade_id' => $grade->id, 'academic_year_id' => $year->id],
                ['amount' => 500, 'due_date' => now()->addMonth()]
            );
            FeeStructure::firstOrCreate(
                ['fee_category_id' => $transport->fee_category_id, 'grade_id' => $grade->id, 'academic_year_id' => $year->id],
                ['amount' => 150, 'due_date' => now()->addMonth()]
            );

            $bill = StudentBilling::firstOrCreate(
                ['student_id' => $student->id, 'academic_year_id' => $year->id, 'status' => 'unpaid'],
                ['total_amount' => 650, 'paid_amount' => 0, 'issued_date' => now()]
            );

            $payment = Payment::firstOrCreate(
                ['transaction_reference' => 'TXN-DEMO-001'],
                [
                    'bill_id' => $bill->bill_id,
                    'student_id' => $student->id,
                    'payment_date' => now()->toDateString(),
                    'amount_paid' => 200,
                    'payment_method' => 'Cash',
                    'received_by' => $user->id,
                ]
            );

            PaymentReceipt::firstOrCreate(
                ['receipt_number' => 'RCPT-DEMO-001'],
                ['payment_id' => $payment->payment_id, 'issued_at' => now(), 'generated_by' => $user->id]
            );

            FeeNotification::firstOrCreate(
                ['student_id' => $student->id, 'bill_id' => $bill->bill_id, 'message' => 'Please pay outstanding balance.'],
                ['sent_at' => now()]
            );
        });

        return back()->with('success', 'Finance demo data seeded');
    }
}

