<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use App\Models\Grade;
use App\Services\PaymentReportService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;

class PaymentReportController extends Controller
{
    protected $reportService;

    public function __construct(PaymentReportService $reportService)
    {
        $this->reportService = $reportService;
    }

    public function index(Request $request)
    {
        // Check permissions (Admin or Accountant)
        // Assuming 'manage-payments' or similar permission exists, or role check.
        // User asked for "Admin" or "Accountant".
        if (! $request->user()->hasRole(['Admin', 'Accountant'])) {
             abort(403, 'Unauthorized access to payment reports.');
        }

        $payments = $this->reportService->getFilteredQuery($request)
            ->paginate($request->input('perPage', 20))
            ->withQueryString();

        return Inertia::render('dashboard/PaymentReports', [
            'payments' => $payments,
            'filters' => $request->only([
                'academic_year_id',
                'date_from',
                'date_to',
                'student_id',
                'grade_id',
                'payment_method',
                'receipt_number',
                'transaction_reference'
            ]),
            'academicYears' => AcademicYear::orderBy('start_date', 'desc')->get(),
            'grades' => Grade::orderBy('grade_name')->get(),
        ]);
    }

    public function exportPdf(Request $request)
    {
        if (! $request->user()->hasRole(['Admin', 'Accountant'])) {
             abort(403);
        }

        $query = $this->reportService->getFilteredQuery($request);
        $payments = $query->get();
        $totalAmount = $query->sum('amount_paid');

        $data = [
            'payments' => $payments,
            'school_name' => config('app.name', 'School Management System'),
            'title' => 'Payments Report',
            'date' => now()->format('Y-m-d H:i:s'),
            'filters' => $request->all(),
            'total_amount' => $totalAmount,
            'generated_by' => $request->user()->name,
        ];

        $pdf = Pdf::loadView('reports.payments-pdf', $data);
        $pdf->setPaper('a4', 'landscape');

        return $pdf->download('payments-report-' . now()->format('YmdHis') . '.pdf');
    }

    public function exportExcel(Request $request)
    {
        if (! $request->user()->hasRole(['Admin', 'Accountant'])) {
             abort(403);
        }

        $query = $this->reportService->getFilteredQuery($request);
        // Using cursor to handle large datasets efficiently

        $filename = 'payments-report-' . now()->format('YmdHis') . '.csv';

        $headers = [
            "Content-type" => "text/csv",
            "Content-Disposition" => "attachment; filename=$filename",
            "Pragma" => "no-cache",
            "Cache-Control" => "must-revalidate, post-check=0, pre-check=0",
            "Expires" => "0"
        ];

        $callback = function() use ($query, $request) {
            $file = fopen('php://output', 'w');

            // Header Row
            fputcsv($file, [
                'Receipt Number',
                'Student Name',
                'Admission Number',
                'Academic Year',
                'Grade',
                'Amount',
                'Method',
                'Reference',
                'Payment Date',
                'Received By',
                'Created At'
            ]);

            $total = 0;

            foreach ($query->cursor() as $payment) {
                $total += $payment->amount_paid;

                fputcsv($file, [
                    $payment->receipt->receipt_number ?? 'N/A',
                    $payment->student->user->first_name . ' ' . $payment->student->user->last_name,
                    $payment->student->admission_number,
                    $payment->bill->academicYear->year_name ?? 'N/A',
                    $payment->student->currentClass->grade->name ?? 'N/A',
                    $payment->amount_paid,
                    $payment->payment_method,
                    $payment->transaction_reference,
                    $payment->payment_date,
                    $payment->receivedBy->name ?? 'System',
                    $payment->created_at->format('Y-m-d H:i:s')
                ]);
            }

            // Total Row
            fputcsv($file, ['', '', '', '', 'Total:', $total, '', '', '', '', '']);

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
