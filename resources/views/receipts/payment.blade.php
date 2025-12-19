<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Payment Receipt</title>
    <style>
        body { font-family: sans-serif; }
        .header { text-align: center; margin-bottom: 20px; }
        .details { margin-bottom: 20px; }
        .details table { width: 100%; }
        .details td { padding: 5px; }
        .footer { margin-top: 30px; text-align: center; font-size: 0.8em; color: #666; }
        .amount { font-weight: bold; font-size: 1.2em; }
        .label { font-weight: bold; }
        table.summary { width: 100%; border-collapse: collapse; margin-top: 20px; }
        table.summary th, table.summary td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{ $school_name }}</h1>
        <h2>Payment Receipt</h2>
        <p>Receipt #: {{ $payment->receipt->receipt_number ?? 'N/A' }}</p>
        <p>Date: {{ $payment->payment_date }}</p>
    </div>

    <div class="details">
        <table>
            <tr>
                <td class="label">Student Name:</td>
                <td>{{ $payment->student->user->first_name }} {{ $payment->student->user->last_name }}</td>
            </tr>
            <tr>
                <td class="label">Admission Number:</td>
                <td>{{ $payment->student->admission_number }}</td>
            </tr>
            <tr>
                <td class="label">Academic Year:</td>
                <td>{{ $payment->bill->academicYear->year_name }}</td>
            </tr>
        </table>
    </div>

    <table class="summary">
        <thead>
            <tr>
                <th>Description</th>
                <th>Amount</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Payment via {{ $payment->payment_method }} (Ref: {{ $payment->transaction_reference }})</td>
                <td>{{ number_format($payment->amount_paid, 2) }}</td>
            </tr>
        </tbody>
        <tfoot>
            <tr>
                <td class="label" style="text-align: right;">Total Paid:</td>
                <td class="amount">{{ number_format($payment->amount_paid, 2) }}</td>
            </tr>
        </tfoot>
    </table>

    <div class="details" style="margin-top: 20px;">
        <p><span class="label">Balance Remaining:</span> {{ number_format($payment->bill->balance, 2) }}</p>
    </div>

    <div class="footer">
        <p>Received by: {{ $payment->receivedBy->first_name }} {{ $payment->receivedBy->last_name }}</p>
        <p>Thank you for your payment.</p>
    </div>
</body>
</html>
