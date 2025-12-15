<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreExamResultRequest;
use App\Http\Requests\Admin\UpdateExamResultRequest;
use App\Models\ClassSection;
use App\Models\Exam;
use App\Models\ExamResult;
use App\Models\Student;
use App\Models\Subject;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ExamResultController extends Controller
{
    public function index(Request $request): Response
    {
        $search = (string) $request->input('search', '');
        $perPage = (int) $request->input('perPage', 10);

        $results = ExamResult::query()
            ->with(['student.user', 'subject', 'exam.academicYear', 'classSection.grade'])
            ->when($search !== '', function ($q) use ($search) {
                $q->whereHas('student', function ($sq) use ($search) {
                    $sq->where('admission_number', 'like', '%'.$search.'%')
                        ->orWhereHas('user', function ($uq) use ($search) {
                            $uq->where('name', 'like', '%'.$search.'%')
                               ->orWhere('first_name', 'like', '%'.$search.'%')
                               ->orWhere('last_name', 'like', '%'.$search.'%');
                        });
                })
                ->orWhereHas('subject', function ($sq) use ($search) {
                    $sq->where('subject_name', 'like', '%'.$search.'%')
                       ->orWhere('subject_code', 'like', '%'.$search.'%');
                })
                ->orWhereHas('exam', function ($eq) use ($search) {
                    $eq->where('exam_name', 'like', '%'.$search.'%')
                       ->orWhere('term_name', 'like', '%'.$search.'%');
                })
                ->orWhereHas('classSection', function ($cq) use ($search) {
                    $cq->where('section_name', 'like', '%'.$search.'%');
                });
            })
            ->orderBy('created_at', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('dashboard/ExamResults', [
            'results' => $results,
            'students' => Student::query()->with('user')->orderBy('admission_number')->get(),
            'subjects' => Subject::query()->orderBy('subject_name')->get(),
            'exams' => Exam::query()->with('academicYear')->orderBy('start_date', 'desc')->get(),
            'sections' => ClassSection::query()->with('grade')->orderBy('section_name')->get(),
            'filters' => [
                'search' => $search,
                'perPage' => $perPage,
            ],
        ]);
    }

    public function store(StoreExamResultRequest $request): RedirectResponse
    {
        ExamResult::create($request->validated());
        return back()->with('success', 'Exam result created');
    }

    public function storeBulk(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'subject_id' => ['required', 'uuid', 'exists:subjects,id'],
            'exam_id' => ['required', 'uuid', 'exists:exams,id'],
            'class_section_id' => ['required', 'uuid', 'exists:class_sections,id'],
            'students' => ['required', 'array', 'min:1'],
            'students.*' => ['uuid', 'exists:students,id'],
        ]);

        foreach ($data['students'] as $studentId) {
            ExamResult::firstOrCreate(
                [
                    'student_id' => $studentId,
                    'subject_id' => $data['subject_id'],
                    'exam_id' => $data['exam_id'],
                ],
                [
                    'class_section_id' => $data['class_section_id'],
                    'score' => null,
                    'grade' => null,
                    'remarks' => null,
                ]
            );
        }

        return back()->with('success', 'Students enrolled for the exam');
    }

    public function update(UpdateExamResultRequest $request, ExamResult $examResult): RedirectResponse
    {
        $examResult->update($request->validated());
        return back()->with('success', 'Exam result updated');
    }

    public function destroy(ExamResult $examResult): RedirectResponse
    {
        $examResult->delete();
        return back()->with('success', 'Exam result deleted');
    }
}
