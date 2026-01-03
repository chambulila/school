<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreStudentAttendanceRequest;
use App\Models\ClassSection;
use App\Models\Student;
use App\Models\StudentAttendance;
use App\Services\AuditService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class StudentAttendanceController extends Controller
{
    public function index(Request $request): Response
    {
        ifCan('view-students-attendances');
        $date = $request->input('date') ?? now()->toDateString();
        $sectionId = $request->input('class_section_id');
        $sections = ClassSection::with('grade')->orderBy('section_name')->get();
        $students = [];
        if ($sectionId) {
            $students = Student::with('user')->whereHas('enrollments', function ($q) use ($sectionId) {
                $q->where('class_section_id', $sectionId);
            })->orderBy('admission_number')->get();
        }
        $existing = StudentAttendance::where('date', $date)
            ->when($sectionId, fn($q) => $q->where('class_section_id', $sectionId))
            ->get()->keyBy('student_id');
        $records = collect($students)->map(function ($s) use ($existing, $sectionId) {
            $att = $existing->get($s->id);
            return [
                'student_id' => $s->id,
                'name' => $s->user->name ?? $s->user->first_name.' '.$s->user->last_name,
                'admission_number' => $s->admission_number,
                'status' => $att->status ?? 'Present',
                'remarks' => $att->remarks ?? '',
                'id' => $att->id ?? null,
            ];
        })->values();
        return Inertia::render('dashboard/attendance/StudentDaily', [
            'date' => $date,
            'classSections' => $sections,
            'selectedSectionId' => $sectionId ?? '',
            'records' => $records,
        ]);
    }

    public function storeBulk(StoreStudentAttendanceRequest $request)
    {
        return DB::transaction(function () use ($request) {
            $data = $request->validated();
            $count = 0;
            foreach ($data['records'] as $rec) {
                StudentAttendance::updateOrCreate(
                    ['student_id' => $rec['student_id'], 'date' => $data['date']],
                    [
                        'class_section_id' => $data['class_section_id'],
                        'status' => $rec['status'],
                        'remarks' => $rec['remarks'] ?? null,
                        'marked_by' => $request->user()->id,
                    ]
                );
                $count++;
            }
            AuditService::log(
                actionType: 'CREATE_BULK',
                entityName: 'StudentAttendance',
                entityId: 'BULK',
                oldValue: null,
                newValue: ['date' => $data['date'], 'count' => $count, 'class_section_id' => $data['class_section_id']],
                module: 'Attendance',
                category: 'Student',
                notes: "Marked student daily attendance for {$data['date']}"
            );
            return back()->with('success', "Saved {$count} attendance records.");
        });
    }
}

