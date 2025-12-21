<?php

namespace App\Services;

use App\Models\Payment;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class PaymentService
{
    public static function getPayments(Request $request): Builder
    {
        return Payment::filter($request);
    }
}
