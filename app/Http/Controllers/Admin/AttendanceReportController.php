<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TeacherAttendance;
use App\Models\StudentAttendance;
use App\Models\StudentSessionAttendance;
use App\Models\ClassSection;
use App\Models\Subject;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;
use Inertia\Inertia;
use Inertia\Response;

class AttendanceReportController extends Controller
{
    public function index(Request $request): Response
    {
        if (!auth()->user() || (!auth()->user()->canAny(['view-students-attendances', 'view-teachers-attendances']))) {
            return abort(403, "You do not have permission to perform this action.");
        }

        $type = $request->input('type', 'student_daily'); // teacher | student_daily | student_session
        $status = $request->input('status');
        $dateFrom = $request->input('date_from') ?? now()->toDateString();
        $dateTo = $request->input('date_to') ?? $dateFrom;
        $classSectionId = $request->input('class_section_id');
        $subjectId = $request->input('subject_id');
        $perPage = (int) $request->input('perPage', 25);

        $teacherSummary = $this->summaryCounts(TeacherAttendance::query(), $dateFrom, $dateTo, null, null, $status);
        $studentDailySummary = $this->summaryCounts(StudentAttendance::query(), $dateFrom, $dateTo, $classSectionId, null, $status);
        $studentSessionSummary = $this->summaryCounts(StudentSessionAttendance::query(), $dateFrom, $dateTo, $classSectionId, $subjectId, $status);

        $listing = $this->listing($type, $dateFrom, $dateTo, $classSectionId, $subjectId, $status)->paginate($perPage)->withQueryString();

        return Inertia::render('dashboard/attendance/Reports', [
            'filters' => [
                'type' => $type,
                'status' => $status,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'class_section_id' => $classSectionId,
                'subject_id' => $subjectId,
                'perPage' => $perPage,
            ],
            'teacherSummary' => $teacherSummary,
            'studentDailySummary' => $studentDailySummary,
            'studentSessionSummary' => $studentSessionSummary,
            'listing' => $listing,
            'classSections' => ClassSection::with('grade')->orderBy('section_name')->get(),
            'subjects' => Subject::orderBy('subject_name')->get(),
        ]);
    }

    protected function summaryCounts($baseQuery, string $dateFrom, string $dateTo, ?string $classSectionId = null, ?string $subjectId = null, ?string $status = null): array
    {
        $q = (clone $baseQuery)
            ->whereBetween('date', [$dateFrom, $dateTo])
            ->when($classSectionId, function ($qq) use ($classSectionId) {
                if ($qq->getModel() instanceof \App\Models\StudentAttendance || $qq->getModel() instanceof \App\Models\StudentSessionAttendance) {
                    $qq->where('class_section_id', $classSectionId);
                }
            })
            ->when($subjectId, function ($qq) use ($subjectId) {
                if ($qq->getModel() instanceof \App\Models\StudentSessionAttendance) {
                    $qq->where('subject_id', $subjectId);
                }
            })
            ->when($status, fn($qq) => $qq->where('status', $status));
        return [
            'present' => (clone $q)->where('status', 'Present')->count(),
            'absent' => (clone $q)->where('status', 'Absent')->count(),
            'late' => (clone $q)->where('status', 'Late')->count(),
            'excused' => (clone $q)->where('status', 'Excused')->count(),
        ];
    }

    protected function listing(string $type, string $dateFrom, string $dateTo, ?string $classSectionId, ?string $subjectId, ?string $status)
    {
        if ($type === 'teacher') {
            return TeacherAttendance::query()
                ->with(['teacher.user', 'markedBy'])
                ->whereBetween('date', [$dateFrom, $dateTo])
                ->when($status, fn($q) => $q->where('status', $status))
                ->orderBy('date', 'desc');
        }
        if ($type === 'student_session') {
            return StudentSessionAttendance::query()
                ->with(['student.user', 'classSection.grade', 'subject', 'markedBy'])
                ->whereBetween('date', [$dateFrom, $dateTo])
                ->when($classSectionId, fn($q) => $q->where('class_section_id', $classSectionId))
                ->when($subjectId, fn($q) => $q->where('subject_id', $subjectId))
                ->when($status, fn($q) => $q->where('status', $status))
                ->orderBy('date', 'desc');
        }
        return StudentAttendance::query()
            ->with(['student.user', 'classSection.grade', 'markedBy'])
            ->whereBetween('date', [$dateFrom, $dateTo])
            ->when($classSectionId, fn($q) => $q->where('class_section_id', $classSectionId))
            ->when($status, fn($q) => $q->where('status', $status))
            ->orderBy('date', 'desc');
    }

    public function exportPdf(Request $request)
    {
        if (!auth()->user() || (!auth()->user()->canAny(['view-students-attendances', 'view-teachers-attendances']))) {
            return abort(403);
        }
        $type = $request->input('type', 'student_daily');
        $dateFrom = $request->input('date_from') ?? now()->toDateString();
        $dateTo = $request->input('date_to') ?? $dateFrom;
        $classSectionId = $request->input('class_section_id');
        $subjectId = $request->input('subject_id');
        $status = $request->input('status');

        $summary = [
            'teacher' => $this->summaryCounts(TeacherAttendance::query(), $dateFrom, $dateTo, null, null, $status),
            'student_daily' => $this->summaryCounts(StudentAttendance::query(), $dateFrom, $dateTo, $classSectionId, null, $status),
            'student_session' => $this->summaryCounts(StudentSessionAttendance::query(), $dateFrom, $dateTo, $classSectionId, $subjectId, $status),
        ];
        $records = $this->listing($type, $dateFrom, $dateTo, $classSectionId, $subjectId, $status)->get();

        $data = [
            'type' => $type,
            'date_from' => $dateFrom,
            'date_to' => $dateTo,
            'summary' => $summary,
            'records' => $records,
            'school_name' => config('app.name', 'School Management System'),
            'generated_by' => $request->user()->name,
            'filters' => $request->all(),
        ];

        $pdf = Pdf::loadView('reports.attendance-pdf', $data)->setPaper('a4', 'landscape');
        if ($request->has('preview') && $request->preview == 'true') {
            return $pdf->stream('attendance-report-' . now()->format('YmdHis') . '.pdf');
        }
        return $pdf->download('attendance-report-' . now()->format('YmdHis') . '.pdf');
    }

    public function exportCsv(Request $request)
    {
        if (!auth()->user() || (!auth()->user()->canAny(['view-students-attendances', 'view-teachers-attendances']))) {
            return abort(403);
        }
        $type = $request->input('type', 'student_daily');
        $dateFrom = $request->input('date_from') ?? now()->toDateString();
        $dateTo = $request->input('date_to') ?? $dateFrom;
        $classSectionId = $request->input('class_section_id');
        $subjectId = $request->input('subject_id');
        $status = $request->input('status');

        $query = $this->listing($type, $dateFrom, $dateTo, $classSectionId, $subjectId, $status);
        $filename = 'attendance-report-' . $type . '-' . now()->format('YmdHis') . '.csv';
        $headers = [
            "Content-type" => "text/csv",
            "Content-Disposition" => "attachment; filename=$filename",
            "Pragma" => "no-cache",
            "Cache-Control" => "must-revalidate, post-check=0, pre-check=0",
            "Expires" => "0"
        ];
        $callback = function() use ($query, $type) {
            $file = fopen('php://output', 'w');
            if ($type === 'teacher') {
                fputcsv($file, ['Date', 'Teacher', 'Status', 'Remarks', 'Marked By']);
                foreach ($query->cursor() as $row) {
                    fputcsv($file, [
                        $row->date,
                        $row->teacher->user->name ?? $row->teacher->user->first_name.' '.$row->teacher->user->last_name,
                        $row->status,
                        $row->remarks,
                        $row->markedBy->name ?? 'System',
                    ]);
                }
            } elseif ($type === 'student_session') {
                fputcsv($file, ['Date', 'Section', 'Subject', 'Student', 'Admission', 'Period', 'Status', 'Remarks', 'Marked By']);
                foreach ($query->cursor() as $row) {
                    fputcsv($file, [
                        $row->date,
                        $row->classSection->grade->grade_name.' - '.$row->classSection->section_name,
                        $row->subject->subject_name,
                        $row->student->user->name ?? $row->student->user->first_name.' '.$row->student->user->last_name,
                        $row->student->admission_number,
                        $row->period ?? '',
                        $row->status,
                        $row->remarks,
                        $row->markedBy->name ?? 'System',
                    ]);
                }
            } else {
                fputcsv($file, ['Date', 'Section', 'Student', 'Admission', 'Status', 'Remarks', 'Marked By']);
                foreach ($query->cursor() as $row) {
                    fputcsv($file, [
                        $row->date,
                        $row->classSection->grade->grade_name.' - '.$row->classSection->section_name,
                        $row->student->user->name ?? $row->student->user->first_name.' '.$row->student->user->last_name,
                        $row->student->admission_number,
                        $row->status,
                        $row->remarks,
                        $row->markedBy->name ?? 'System',
                    ]);
                }
            }
            fclose($file);
        };
        return response()->stream($callback, 200, $headers);
    }
}
