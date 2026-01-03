<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\LeaveRequest;
use App\Models\LeaveApproval;
use App\Services\LeaveService;
use App\Services\AuditService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class LeaveApprovalController extends Controller
{
    public function index(Request $request): Response
    {
        if (! $request->user()->canAny(['approve-teacher-leave', 'approve-student-leave'])) {
            return abort(403);
        }
        $type = $request->input('applicant_type');
        $query = LeaveRequest::where('status', 'Pending')->orderBy('created_at', 'desc');
        if ($type) {
            $query->where('applicant_type', $type);
        } else {
            if (! $request->user()->can('approve-teacher-leave')) {
                $query->where('applicant_type', 'student');
            }
            if (! $request->user()->can('approve-student-leave')) {
                $query->where('applicant_type', 'teacher');
            }
        }
        $requests = $query->paginate($request->input('perPage', 20))->withQueryString();
        return Inertia::render('dashboard/leaves/Approvals', [
            'requests' => $requests,
            'filters' => $request->only('applicant_type'),
        ]);
    }

    public function approve(Request $request, LeaveService $leaveService, LeaveRequest $leave)
    {
        if ($leave->applicant_type === 'teacher' && ! $request->user()->can('approve-teacher-leave')) {
            return abort(403);
        }
        if ($leave->applicant_type === 'student' && ! $request->user()->can('approve-student-leave')) {
            return abort(403);
        }
        return DB::transaction(function () use ($request, $leave, $leaveService) {
            $leave->status = 'Approved';
            $leave->approved_by = $request->user()->id;
            $leave->approved_at = now();
            $leave->save();
            LeaveApproval::create([
                'leave_request_id' => $leave->id,
                'approver_id' => $request->user()->id,
                'action' => 'Approved',
                'comment' => $request->input('comment', ''),
            ]);
            $leaveService->applyAttendanceOnApproval($leave->refresh());
            AuditService::log(
                actionType: 'UPDATE',
                entityName: 'LeaveRequest',
                entityId: $leave->id,
                oldValue: null,
                newValue: ['status' => 'Approved'],
                module: 'Leaves',
                category: 'Approvals',
                notes: "Leave approved"
            );
            return back()->with('success', 'Leave approved');
        });
    }

    public function reject(Request $request, LeaveRequest $leave)
    {
        $request->validate(['comment' => ['required', 'string']]);
        if ($leave->applicant_type === 'teacher' && ! $request->user()->can('approve-teacher-leave')) {
            return abort(403);
        }
        if ($leave->applicant_type === 'student' && ! $request->user()->can('approve-student-leave')) {
            return abort(403);
        }
        return DB::transaction(function () use ($request, $leave) {
            $leave->status = 'Rejected';
            $leave->approved_by = $request->user()->id;
            $leave->approved_at = now();
            $leave->save();
            LeaveApproval::create([
                'leave_request_id' => $leave->id,
                'approver_id' => $request->user()->id,
                'action' => 'Rejected',
                'comment' => $request->input('comment'),
            ]);
            AuditService::log(
                actionType: 'UPDATE',
                entityName: 'LeaveRequest',
                entityId: $leave->id,
                oldValue: null,
                newValue: ['status' => 'Rejected'],
                module: 'Leaves',
                category: 'Approvals',
                notes: "Leave rejected"
            );
            return back()->with('success', 'Leave rejected');
        });
    }
}

