<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\LeaveRequest;
use App\Models\LeaveType;
use App\Models\Student;
use App\Models\Teacher;
use App\Services\LeaveService;
use App\Services\AuditService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class LeaveRequestController extends Controller
{
    public function index(Request $request): Response
    {
        ifCan('apply-leave');
        $user = $request->user();
        $applicantType = $request->input('applicant_type') ?: ($user->hasRole(['Teacher']) ? 'teacher' : 'student');
        $applicantId = null;
        if ($applicantType === 'teacher') {
            $applicantId = Teacher::where('user_id', $user->id)->value('id');
        } else {
            $applicantId = Student::where('user_id', $user->id)->value('id');
        }
        $requests = LeaveRequest::where('applicant_type', $applicantType)->where('applicant_id', $applicantId)
            ->orderBy('created_at', 'desc')->paginate($request->input('perPage', 20))->withQueryString();
        return Inertia::render('dashboard/leaves/MyRequests', [
            'requests' => $requests,
            'types' => LeaveType::where(function ($q) use ($applicantType) {
                $q->where('applicant_scope', $applicantType)->orWhere('applicant_scope', 'both');
            })->where('enabled', true)->orderBy('name')->get(),
            'applicantType' => $applicantType,
        ]);
    }

    public function store(Request $request, LeaveService $leaveService)
    {
        ifCan('apply-leave');
        $user = $request->user();
        $applicantType = $request->input('applicant_type') ?: ($user->hasRole(['Teacher']) ? 'teacher' : 'student');
        $applicantId = $request->input('applicant_id');
        if (!$applicantId) {
            $applicantId = $applicantType === 'teacher'
                ? Teacher::where('user_id', $user->id)->value('id')
                : Student::where('user_id', $user->id)->value('id');
        }
        $data = $request->validate([
            'leave_type_id' => ['required', 'uuid', 'exists:leave_types,id'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'reason' => ['required', 'string'],
            'attachment_path' => ['nullable', 'string'],
        ]);
        $type = LeaveType::findOrFail($data['leave_type_id']);
        if ($type->requires_attachment && empty($data['attachment_path'])) {
            return back()->with('error', 'Attachment is required for this leave type.');
        }
        $start = new \Carbon\Carbon($data['start_date']);
        $end = new \Carbon\Carbon($data['end_date']);
        $totalDays = $end->diffInDaysFiltered(function (\Carbon\Carbon $date) {
            return $date->isWeekday();
        }, $start) + ($start->isWeekday() ? 1 : 0);

        $overlap = LeaveRequest::where('applicant_type', $applicantType)->where('applicant_id', $applicantId)
            ->whereIn('status', ['Pending', 'Approved'])
            ->where(function ($q) use ($start, $end) {
                $q->whereBetween('start_date', [$start->toDateString(), $end->toDateString()])
                  ->orWhereBetween('end_date', [$start->toDateString(), $end->toDateString()])
                  ->orWhere(function ($qq) use ($start, $end) {
                      $qq->where('start_date', '<=', $start->toDateString())->where('end_date', '>=', $end->toDateString());
                  });
            })->exists();
        if ($overlap) {
            return back()->with('error', 'Overlapping leave request exists.');
        }

        return DB::transaction(function () use ($request, $type, $applicantType, $applicantId, $data, $totalDays, $leaveService) {
            $status = $type->requires_approval ? 'Pending' : 'Approved';
            $leave = LeaveRequest::create([
                'applicant_type' => $applicantType,
                'applicant_id' => $applicantId,
                'leave_type_id' => $data['leave_type_id'],
                'start_date' => $data['start_date'],
                'end_date' => $data['end_date'],
                'total_days' => $totalDays,
                'status' => $status,
                'reason' => $data['reason'],
                'attachment_path' => $data['attachment_path'] ?? null,
                'requested_by' => $request->user()->id,
            ]);

            AuditService::log(
                actionType: 'CREATE',
                entityName: 'LeaveRequest',
                entityId: $leave->id,
                oldValue: null,
                newValue: $leave->toArray(),
                module: 'Leaves',
                category: 'Applications',
                notes: "Leave request submitted"
            );

            if ($status === 'Approved') {
                $leave->approved_by = $request->user()->id;
                $leave->approved_at = now();
                $leave->save();
                $leaveService->applyAttendanceOnApproval($leave->refresh());
            }

            return back()->with('success', 'Leave request submitted');
        });
    }
}

