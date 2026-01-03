<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ClassSection;
use App\Models\Subject;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StudentAttendanceSelectorController extends Controller
{
    public function index(Request $request): Response
    {
        ifCan('view-students-attendances');
        return Inertia::render('dashboard/attendance/Students', [
            'date' => $request->input('date') ?? now()->toDateString(),
            'classSections' => ClassSection::with('grade')->orderBy('section_name')->get(),
            'subjects' => Subject::orderBy('subject_name')->get(),
        ]);
    }
}

