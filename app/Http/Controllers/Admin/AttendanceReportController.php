<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TeacherAttendance;
use App\Models\StudentAttendance;
use App\Models\StudentSessionAttendance;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AttendanceReportController extends Controller
{
    public function index(Request $request): Response
    {
        if (!auth()->user() || (!auth()->user()->canAny(['view-students-attendances', 'view-teachers-attendances']))) {
            return abort(403, "You do not have permission to perform this action.");
        }
        
        $date = $request->input('date') ?? now()->toDateString();
        $teacher = [
            'present' => TeacherAttendance::where('date', $date)->where('status', 'Present')->count(),
            'absent' => TeacherAttendance::where('date', $date)->where('status', 'Absent')->count(),
            'late' => TeacherAttendance::where('date', $date)->where('status', 'Late')->count(),
            'excused' => TeacherAttendance::where('date', $date)->where('status', 'Excused')->count(),
        ];
        $studentDaily = [
            'present' => StudentAttendance::where('date', $date)->where('status', 'Present')->count(),
            'absent' => StudentAttendance::where('date', $date)->where('status', 'Absent')->count(),
            'late' => StudentAttendance::where('date', $date)->where('status', 'Late')->count(),
            'excused' => StudentAttendance::where('date', $date)->where('status', 'Excused')->count(),
        ];
        $studentSession = [
            'present' => StudentSessionAttendance::where('date', $date)->where('status', 'Present')->count(),
            'absent' => StudentSessionAttendance::where('date', $date)->where('status', 'Absent')->count(),
            'late' => StudentSessionAttendance::where('date', $date)->where('status', 'Late')->count(),
            'excused' => StudentSessionAttendance::where('date', $date)->where('status', 'Excused')->count(),
        ];
        return Inertia::render('dashboard/attendance/Reports', [
            'date' => $date,
            'teacher' => $teacher,
            'studentDaily' => $studentDaily,
            'studentSession' => $studentSession,
        ]);
    }
}
