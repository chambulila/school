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
     * Generate bills for a student for a specific academic year.
     *
     * @param Student $student
     * @param AcademicYear $academicYear
     * @return \Illuminate\Support\Collection
     */
    public function generateBill(Student $student, AcademicYear $academicYear): \Illuminate\Support\Collection
    {
        $enrollment = $student->enrollments()
            ->where('academic_year_id', $academicYear->id)
            ->first();

        if (!$enrollment) {
             throw new \Exception("Student is not enrolled for this academic year.");
        }

        $gradeId = $enrollment->classSection->grade_id;

        // Fetch fee structures
        $feeStructures = FeeStructure::where('academic_year_id', $academicYear->id)
            ->where('grade_id', $gradeId)
            ->get();

        $generatedBills = collect();

        foreach ($feeStructures as $feeStructure) {
            // Check if a bill already exists for this student, academic year AND fee structure
            $existingBill = StudentBilling::where('student_id', $student->id)
                ->where('academic_year_id', $academicYear->id)
                ->where('fee_structure_id', $feeStructure->fee_structure_id)
                ->first();

            if ($existingBill) {
                $generatedBills->push($existingBill);
                continue;
            }

            $bill = StudentBilling::create([
                'student_id' => $student->id,
                'academic_year_id' => $academicYear->id,
                'fee_structure_id' => $feeStructure->fee_structure_id,
                'total_amount' => $feeStructure->amount,
                'amount_paid' => 0,
                'balance' => $feeStructure->amount,
                'status' => 'Pending',
            ]);

            $generatedBills->push($bill);
        }

        return $generatedBills;
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

    /**
     * Create bills for specific fee structures manually.
     *
     * @param Student $student
     * @param AcademicYear $academicYear
     * @param array $feeStructureIds
     * @param string|null $issuedDate
     * @return int Number of bills created
     */
    public function createManualBills(Student $student, AcademicYear $academicYear, array $feeStructureIds, ?string $issuedDate = null): int
    {
        $count = 0;
        foreach ($feeStructureIds as $feeStructureId) {
            $feeStructure = FeeStructure::find($feeStructureId);
            if (!$feeStructure) continue;

            $exists = StudentBilling::where('student_id', $student->id)
                ->where('academic_year_id', $academicYear->id)
                ->where('fee_structure_id', $feeStructureId)
                ->exists();

            if ($exists) continue;

            StudentBilling::create([
                'student_id' => $student->id,
                'academic_year_id' => $academicYear->id,
                'fee_structure_id' => $feeStructureId,
                'total_amount' => $feeStructure->amount,
                'amount_paid' => 0,
                'status' => 'pending',
                'balance' => $feeStructure->amount,
            ]);
            $count++;
        }
        return $count;
    }
}
