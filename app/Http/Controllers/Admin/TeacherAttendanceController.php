<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreTeacherAttendanceRequest;
use App\Models\Teacher;
use App\Models\TeacherAttendance;
use App\Services\AuditService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class TeacherAttendanceController extends Controller
{
    public function index(Request $request): Response
    {
        ifCan('view-teachers-attendances');
        $date = $request->input('date') ?? now()->toDateString();
        $teachers = Teacher::query()->with('user')->orderBy('id')->get();
        $existing = TeacherAttendance::where('date', $date)->get()->keyBy('teacher_id');
        $records = $teachers->map(function ($t) use ($existing) {
            $att = $existing->get($t->id);
            return [
                'teacher_id' => $t->id,
                'name' => $t->user->name ?? $t->user->first_name.' '.$t->user->last_name,
                'status' => $att->status ?? 'Present',
                'remarks' => $att->remarks ?? '',
                'id' => $att->id ?? null,
            ];
        })->values();
        return Inertia::render('dashboard/attendance/TeacherDaily', [
            'date' => $date,
            'records' => $records,
        ]);
    }

    public function storeBulk(StoreTeacherAttendanceRequest $request)
    {
        return DB::transaction(function () use ($request) {
            $data = $request->validated();
            $count = 0;
            foreach ($data['records'] as $rec) {
                TeacherAttendance::updateOrCreate(
                    ['teacher_id' => $rec['teacher_id'], 'date' => $data['date']],
                    [
                        'status' => $rec['status'],
                        'remarks' => $rec['remarks'] ?? null,
                        'marked_by' => $request->user()->id,
                    ]
                );
                $count++;
            }
            AuditService::log(
                actionType: 'CREATE_BULK',
                entityName: 'TeacherAttendance',
                entityId: 'BULK',
                oldValue: null,
                newValue: ['date' => $data['date'], 'count' => $count],
                module: 'Attendance',
                category: 'Teacher',
                notes: "Marked teacher attendance for {$data['date']}"
            );
            return back()->with('success', "Saved {$count} attendance records.");
        });
    }
}

