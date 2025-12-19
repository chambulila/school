<?php

namespace App\Services;

use App\Models\Payment;
use Barryvdh\DomPDF\Facade\Pdf;

class ReceiptService
{
    public function generateReceiptPdf(Payment $payment)
    {
        // Load relationships needed for the receipt
        $payment->load(['student.user', 'bill.academicYear', 'receivedBy', 'receipt']);

        $data = [
            'payment' => $payment,
            'school_name' => config('app.name', 'School Management System'),
            'date' => now()->format('Y-m-d'),
        ];

        // Ensure the receipt record exists (it should be created in controller)
        
        $pdf = Pdf::loadView('receipts.payment', $data);
        return $pdf;
    }
}
