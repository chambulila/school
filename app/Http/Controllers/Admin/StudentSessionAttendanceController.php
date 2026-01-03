<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreStudentSessionAttendanceRequest;
use App\Models\ClassSection;
use App\Models\Student;
use App\Models\StudentSessionAttendance;
use App\Models\Subject;
use App\Services\AuditService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class StudentSessionAttendanceController extends Controller
{
    public function index(Request $request): Response
    {
        ifCan('view-students-attendances');
        $date = $request->input('date') ?? now()->toDateString();
        $sectionId = $request->input('class_section_id');
        $subjectId = $request->input('subject_id');
        $period = $request->input('period') ?? '';
        $sections = ClassSection::with('grade')->orderBy('section_name')->get();
        $subjects = Subject::orderBy('subject_name')->get();
        $students = [];
        if ($sectionId) {
            $students = Student::with('user')->whereHas('enrollments', function ($q) use ($sectionId) {
                $q->where('class_section_id', $sectionId);
            })->orderBy('admission_number')->get();
        }
        $existing = StudentSessionAttendance::where('date', $date)
            ->when($sectionId, fn($q) => $q->where('class_section_id', $sectionId))
            ->when($subjectId, fn($q) => $q->where('subject_id', $subjectId))
            ->when($period !== '', fn($q) => $q->where('period', $period))
            ->get()->keyBy('student_id');
        $records = collect($students)->map(function ($s) use ($existing) {
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
        return Inertia::render('dashboard/attendance/StudentSession', [
            'date' => $date,
            'classSections' => $sections,
            'subjects' => $subjects,
            'selectedSectionId' => $sectionId ?? '',
            'selectedSubjectId' => $subjectId ?? '',
            'selectedPeriod' => $period,
            'records' => $records,
        ]);
    }

    public function storeBulk(StoreStudentSessionAttendanceRequest $request)
    {
        return DB::transaction(function () use ($request) {
            $data = $request->validated();
            $count = 0;
            foreach ($data['records'] as $rec) {
                StudentSessionAttendance::updateOrCreate(
                    [
                        'student_id' => $rec['student_id'],
                        'class_section_id' => $data['class_section_id'],
                        'subject_id' => $data['subject_id'],
                        'date' => $data['date'],
                        'period' => $data['period'] ?? null,
                    ],
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
                entityName: 'StudentSessionAttendance',
                entityId: 'BULK',
                oldValue: null,
                newValue: ['date' => $data['date'], 'count' => $count, 'class_section_id' => $data['class_section_id'], 'subject_id' => $data['subject_id'], 'period' => $data['period'] ?? null],
                module: 'Attendance',
                category: 'Student',
                notes: "Marked session attendance for {$data['date']}"
            );
            return back()->with('success', "Saved {$count} attendance records.");
        });
    }
}

