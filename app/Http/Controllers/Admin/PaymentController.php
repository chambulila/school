<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StorePaymentRequest;
use App\Http\Requests\Admin\UpdatePaymentRequest;
use App\Models\Payment;
use App\Models\StudentBilling;
use App\Models\Student;
use App\Models\User;
use App\Models\PaymentReceipt;
use App\Services\ReceiptService;
use App\Services\PaymentReportService;
use App\Models\AcademicYear;
use App\Models\Grade;
use App\Services\PaymentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PaymentController extends Controller
{

    public function index(Request $request): Response
    {
        $perPage = (int) $request->input('perPage', 10);

        $query = PaymentService::getPayments($request);

        $payments = $query->paginate($perPage)->withQueryString();

        return Inertia::render('dashboard/Payments', [
            'payments' => $payments,
            'bills' => StudentBilling::query()->with(['student.user', 'academicYear'])->orderBy('created_at', 'desc')->get(),
            'students' => Student::query()->with('user')->orderBy('admission_number')->get(),
            'users' => User::query()->orderBy('first_name')->get(),
            'academicYears' => AcademicYear::orderBy('year_name', 'desc')->get(),
            'grades' => Grade::orderBy('grade_name')->get(),
            'filters' => $request->all(),
        ]);
    }

    public function searchStudents(Request $request)
    {
        $query = $request->input('query');

        $students = Student::query()
            ->with('user')
            ->where('admission_number', 'like', "%{$query}%")
            ->orWhereHas('user', function ($q) use ($query) {
                $q->where('first_name', 'like', "%{$query}%")
                  ->orWhere('last_name', 'like', "%{$query}%")
                  ->orWhere('email', 'like', "%{$query}%");
            })
            ->limit(10)
            ->get()
            ->map(function ($student) {
                return [
                    'id' => $student->id,
                    'admission_number' => $student->admission_number,
                    'name' => $student->user ? "{$student->user->first_name} {$student->user->last_name}" : 'Unknown',
                    'email' => $student->user->email ?? '',
                ];
            });

        return response()->json($students);
    }

    public function getStudentBills(Student $student)
    {
        $bills = $student->bills()
            ->whereIn('status', ['Pending', 'Partially Paid'])
            ->with('academicYear')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($bill) {
                return [
                    'bill_id' => $bill->bill_id,
                    'academic_year' => $bill->academicYear->year_name,
                    'total_amount' => $bill->total_amount,
                    'amount_paid' => $bill->amount_paid,
                    'balance' => $bill->balance,
                    'status' => $bill->status,
                ];
            });

        return response()->json($bills);
    }

    public function generateReference()
    {
        do {
            $reference = 'REF-' . strtoupper(Str::random(10));
        } while (Payment::where('transaction_reference', $reference)->exists());

        return response()->json(['reference' => $reference]);
    }

    public function store(StorePaymentRequest $request)
    {
        $data = $request->validated();
        if (!isset($data['received_by']) && $request->user()) {
            $data['received_by'] = $request->user()->id;
        }

        try {
            DB::beginTransaction();

            // 1. Create Payment
            $payment = Payment::create($data);

            // 2. Update Student Billing
            $bill = StudentBilling::where('bill_id', $data['bill_id'])->lockForUpdate()->firstOrFail();

            $bill->amount_paid += $payment->amount_paid;
            $bill->balance = $bill->total_amount - $bill->amount_paid;

            if ($bill->balance <= 0) {
                $bill->status = 'Fully Paid';
                // If overpaid, balance is negative (credit).
            } elseif ($bill->amount_paid > 0) {
                $bill->status = 'Partially Paid';
            } else {
                $bill->status = 'Pending';
            }
            $bill->save();

            // 3. Generate Receipt Record
            $receiptNumber = 'REC-' . date('Ymd') . '-' . strtoupper(Str::random(6));

            PaymentReceipt::create([
                'payment_id' => $payment->payment_id,
                'receipt_number' => $receiptNumber,
                'issued_at' => now(),
                'generated_by' => $request->user()->id ?? null,
            ]);

            DB::commit();
            return back()->with('success', 'Payment recorded and receipt generated');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to record payment: ' . $e->getMessage());
        }
    }

    public function downloadReceipt(Payment $payment, ReceiptService $receiptService)
    {
        if (!$payment->receipt) {
             return back()->with('error', 'Receipt not found for this payment');
        }

        $pdf = $receiptService->generateReceiptPdf($payment);
        return $pdf->download('receipt-' . $payment->receipt->receipt_number . '.pdf');
    }

    public function update(UpdatePaymentRequest $request, Payment $payment)
    {
        // Core Rule: Payments must never be edited
        return back()->with('error', 'Payments cannot be edited.');
    }

    public function destroy(Payment $payment)
    {
        // Core Rule: Payments must never be deleted
        return back()->with('error', 'Payments cannot be deleted.');
    }
}
