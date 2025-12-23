<?php

namespace App\Services;

class GradeCalculatorService
{
    public static function calculate(float $score): array
    {
        if ($score >= 80) {
            return ['grade' => 'A', 'remarks' => 'Excellent'];
        } elseif ($score >= 70) {
            return ['grade' => 'B', 'remarks' => 'Very Good'];
        } elseif ($score >= 60) {
            return ['grade' => 'C', 'remarks' => 'Good'];
        } elseif ($score >= 50) {
            return ['grade' => 'D', 'remarks' => 'Fair'];
        } elseif ($score >= 40) {
            return ['grade' => 'E', 'remarks' => 'Poor'];
        } else {
            return ['grade' => 'F', 'remarks' => 'Fail'];
        }
    }
}
