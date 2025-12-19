<?php

namespace App\Services;

use App\Models\AcademicYear;
use App\Models\FeeStructure;
use App\Models\Student;
use App\Models\StudentBilling;
use Illuminate\Support\Facades\DB;

class BillingService
{
    /**
     * Generate a bill for a student for a specific academic year.
     *
     * @param Student $student
     * @param AcademicYear $academicYear
     * @return StudentBilling
     */
    public function generateBill(Student $student, AcademicYear $academicYear): StudentBilling
    {
        // Check if a bill already exists for this student and academic year
        $existingBill = StudentBilling::where('student_id', $student->id)
            ->where('academic_year_id', $academicYear->id)
            ->first();

        if ($existingBill) {
            return $existingBill;
        }

        // Get the student's current grade (from enrollment or student record?
        // Enrollment has class_section which has grade. Student might have current_grade_id)
        // Let's assume we use the enrollment for this academic year to determine the grade.

        $enrollment = $student->enrollments()
            ->where('academic_year_id', $academicYear->id)
            ->first();

        if (!$enrollment) {
             // Fallback or error? If not enrolled, maybe we can't bill?
             // But requirement says "When a student is enrolled... OR at the beginning of an academic year"
             // If beginning of year, we might need to look at promoted grade.
             // For now, let's rely on the grade from enrollment if available, or throw exception.
             // Actually, if called from EnrollmentController, enrollment exists.
             throw new \Exception("Student is not enrolled for this academic year.");
        }

        $gradeId = $enrollment->classSection->grade_id;

        // Fetch fee structures
        $feeStructures = FeeStructure::where('academic_year_id', $academicYear->id)
            ->where('grade_id', $gradeId)
            ->get();

        $totalAmount = $feeStructures->sum('amount');

        return StudentBilling::create([
            'student_id' => $student->id,
            'academic_year_id' => $academicYear->id,
            'total_amount' => $totalAmount,
            'amount_paid' => 0,
            'balance' => $totalAmount,
            'status' => 'Pending',
        ]);
    }

    /**
     * Generate bills for all students enrolled in a specific academic year.
     *
     * @param AcademicYear $academicYear
     * @return int Number of bills generated
     */
    public function generateBulkBills(AcademicYear $academicYear): int
    {
        $count = 0;
        // Get all enrollments for this year
        $enrollments = \App\Models\StudentEnrollment::with('student', 'classSection')
            ->where('academic_year_id', $academicYear->academic_year_id)
            ->get();

        foreach ($enrollments as $enrollment) {
            try {
                $this->generateBill($enrollment->student, $academicYear);
                $count++;
            } catch (\Exception $e) {
                // Log error or continue
                continue;
            }
        }

        return $count;
    }
}
