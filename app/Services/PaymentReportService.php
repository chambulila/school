<?php

namespace App\Services;

use App\Models\Payment;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class PaymentReportService
{
    public function getFilteredQuery(Request $request): Builder
    {
        return Payment::query()
            ->with([
                'student.user',
                'student.currentClass.grade',
                'bill.academicYear',
                'receivedBy',
                'receipt'
            ])
            ->when($request->input('academic_year_id'), function ($q, $yearId) {
                $q->whereHas('bill', function ($bq) use ($yearId) {
                    $bq->where('academic_year_id', $yearId);
                });
            })
            ->when($request->input('date_from'), function ($q, $date) {
                $q->whereDate('payment_date', '>=', $date);
            })
            ->when($request->input('date_to'), function ($q, $date) {
                $q->whereDate('payment_date', '<=', $date);
            })
            ->when($request->input('student_id'), function ($q, $id) {
                $q->where('student_id', $id);
            })
            ->when($request->input('grade_id'), function ($q, $gradeId) {
                // Assuming we filter by current grade for now, or we'd need to join enrollments
                $q->whereHas('student.currentClass', function ($cq) use ($gradeId) {
                    $cq->where('grade_id', $gradeId);
                });
            })
            ->when($request->input('payment_method'), function ($q, $method) {
                $q->where('payment_method', $method);
            })
            ->when($request->input('receipt_number'), function ($q, $number) {
                $q->whereHas('receipt', function ($rq) use ($number) {
                    $rq->where('receipt_number', 'like', "%{$number}%");
                });
            })
            ->when($request->input('transaction_reference'), function ($q, $ref) {
                $q->where('transaction_reference', 'like', "%{$ref}%");
            })
            ->orderBy('payment_date', 'desc')
            ->orderBy('created_at', 'desc');
    }
}
