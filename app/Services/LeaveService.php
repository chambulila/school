<?php

namespace App\Services;

use App\Models\LeaveRequest;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\StudentAttendance;
use App\Models\TeacherAttendance;
use Carbon\CarbonPeriod;

class LeaveService
{
    public function applyAttendanceOnApproval(LeaveRequest $leave): void
    {
        $period = CarbonPeriod::create($leave->start_date, $leave->end_date);
        foreach ($period as $date) {
            $dow = $date->dayOfWeekIso;
            if ($dow >= 6) continue; // skip weekends
            $dateStr = $date->toDateString();
            if ($leave->applicant_type === 'student') {
                $student = Student::find($leave->applicant_id);
                if (!$student) continue;
                $sectionId = $student->current_class_id;
                if (!$sectionId) continue;
                StudentAttendance::updateOrCreate(
                    ['student_id' => $student->id, 'date' => $dateStr],
                    [
                        'class_section_id' => $sectionId,
                        'status' => 'Excused',
                        'remarks' => 'Leave: '.$leave->type->name,
                        'marked_by' => $leave->approved_by ?? $leave->requested_by,
                    ]
                );
            } else {
                $teacher = Teacher::find($leave->applicant_id);
                if (!$teacher) continue;
                TeacherAttendance::updateOrCreate(
                    ['teacher_id' => $teacher->id, 'date' => $dateStr],
                    [
                        'status' => 'Excused',
                        'remarks' => 'Leave: '.$leave->type->name,
                        'marked_by' => $leave->approved_by ?? $leave->requested_by,
                    ]
                );
            }
        }
    }
}

