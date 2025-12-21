<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StorePaymentReceiptRequest;
use App\Http\Requests\Admin\UpdatePaymentReceiptRequest;
use App\Models\AcademicYear;
use App\Models\Grade;
use App\Models\Payment;
use App\Models\PaymentReceipt;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PaymentReceiptController extends Controller
{
    public function index(Request $request): Response
    {
        $search = (string) $request->input('search', '');
        $perPage = (int) $request->input('perPage', 10);

        $receipts = PaymentReceipt::query()
            ->with(['payment.student.user', 'payment.bill', 'generatedBy'])
            ->whereHas('payment', function ($q) use ($request) {
                $q->applyFilters($request);
            })
            ->orderBy('issued_at', 'desc')
            ->paginate($perPage)
            ->withQueryString();


        return Inertia::render('dashboard/PaymentReceipts', [
            'receipts' => $receipts,
            'payments' => Payment::query()->with(['student.user', 'bill'])->orderBy('payment_date', 'desc')->get(),
            'users' => User::query()->orderBy('first_name')->select(['id', 'first_name', 'last_name'])->get(),
            'academicYears' => AcademicYear::orderBy('year_name', 'desc')->get(),
            'grades' => Grade::orderBy('grade_name')->get(),
            'filters' => $request->all(),
        ]);
    }

    public function store(StorePaymentReceiptRequest $request)
    {
        $data = $request->validated();
        if (!isset($data['generated_by']) && $request->user()) {
            $data['generated_by'] = $request->user()->id;
        }
        PaymentReceipt::create($data);
        return back()->with('success', 'Receipt generated');
    }

    public function update(UpdatePaymentReceiptRequest $request, PaymentReceipt $paymentReceipt)
    {
        $paymentReceipt->update($request->validated());
        return back()->with('success', 'Receipt updated');
    }

    public function destroy(PaymentReceipt $paymentReceipt)
    {
        $paymentReceipt->delete();
        return back()->with('success', 'Receipt deleted');
    }
}
