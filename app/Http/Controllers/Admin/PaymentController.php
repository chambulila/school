<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StorePaymentRequest;
use App\Http\Requests\Admin\UpdatePaymentRequest;
use App\Models\Payment;
use App\Models\StudentBilling;
use App\Models\Student;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PaymentController extends Controller
{
    public function index(Request $request): Response
    {
        $search = (string) $request->input('search', '');
        $perPage = (int) $request->input('perPage', 10);

        $payments = Payment::query()
            ->with(['bill.academicYear', 'student.user', 'receivedBy', 'receipt'])
            ->when($search !== '', function ($q) use ($search) {
                $q->whereHas('student.user', function ($uq) use ($search) {
                    $uq->where('first_name', 'like', '%'.$search.'%')
                        ->orWhere('last_name', 'like', '%'.$search.'%')
                        ->orWhere('email', 'like', '%'.$search.'%');
                })
                ->orWhere('transaction_reference', 'like', '%'.$search.'%');
            })
            ->orderBy('payment_date', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('dashboard/Payments', [
            'payments' => $payments,
            'bills' => StudentBilling::query()->with(['student.user', 'academicYear'])->orderBy('created_at', 'desc')->get(),
            'students' => Student::query()->with('user')->orderBy('admission_number')->get(),
            'users' => User::query()->orderBy('first_name')->get(),
            'filters' => [
                'search' => $search,
                'perPage' => $perPage,
            ],
        ]);
    }

    public function store(StorePaymentRequest $request)
    {
        $data = $request->validated();
        if (!isset($data['received_by']) && $request->user()) {
            $data['received_by'] = $request->user()->id;
        }
        Payment::create($data);
        return back()->with('success', 'Payment recorded');
    }

    public function update(UpdatePaymentRequest $request, Payment $payment)
    {
        $data = $request->validated();
        $payment->update($data);
        return back()->with('success', 'Payment updated');
    }

    public function destroy(Payment $payment)
    {
        $payment->delete();
        return back()->with('success', 'Payment deleted');
    }
}

