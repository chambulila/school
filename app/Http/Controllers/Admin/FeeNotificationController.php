<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreFeeNotificationRequest;
use App\Http\Requests\Admin\UpdateFeeNotificationRequest;
use App\Models\FeeNotification;
use App\Models\StudentBilling;
use App\Models\Student;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FeeNotificationController extends Controller
{
    public function index(Request $request): Response
    {
        $search = (string) $request->input('search', '');
        $perPage = (int) $request->input('perPage', 10);

        $notifications = FeeNotification::query()
            ->with(['student.user', 'bill.academicYear'])
            ->when($search !== '', function ($q) use ($search) {
                $q->where('message', 'like', '%'.$search.'%')
                    ->orWhereHas('student.user', function ($uq) use ($search) {
                        $uq->where('first_name', 'like', '%'.$search.'%')
                            ->orWhere('last_name', 'like', '%'.$search.'%')
                            ->orWhere('email', 'like', '%'.$search.'%');
                    });
            })
            ->orderBy('sent_at', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('dashboard/FeeNotifications', [
            'notifications' => $notifications,
            'students' => Student::query()->with('user')->orderBy('admission_number')->get(),
            'bills' => StudentBilling::query()->with(['student.user', 'academicYear'])->orderBy('issued_date', 'desc')->get(),
            'filters' => [
                'search' => $search,
                'perPage' => $perPage,
            ],
        ]);
    }

    public function store(StoreFeeNotificationRequest $request)
    {
        FeeNotification::create($request->validated());
        return back()->with('success', 'Notification created');
    }

    public function update(UpdateFeeNotificationRequest $request, FeeNotification $feeNotification)
    {
        $feeNotification->update($request->validated());
        return back()->with('success', 'Notification updated');
    }

    public function destroy(FeeNotification $feeNotification)
    {
        $feeNotification->delete();
        return back()->with('success', 'Notification deleted');
    }
}

