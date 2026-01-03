<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreExamResultRequest;
use App\Http\Requests\Admin\UpdateExamResultRequest;
use App\Http\Requests\Admin\UpdateExamScoresRequest;
use App\Models\ClassSection;
use App\Models\Exam;
use App\Models\ExamResult;
use App\Models\Student;
use App\Models\Subject;
use App\Services\GradeCalculatorService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\PublishedResult;
use App\Services\AuditService;
use Illuminate\Support\Facades\DB;

class ExamResultController extends Controller
{
    public function index(Request $request): Response
    {
        ifCan('view-results'); // Assuming 'view-results' is the permission for viewing exam results
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
        ifCan('create-mark');

        return DB::transaction(function () use ($request) {
            $data = $request->validated();

            // Check if results are published
            $isPublished = PublishedResult::where('exam_id', $data['exam_id'])
                ->where('class_section_id', $data['class_section_id'])
                ->exists();

            if ($isPublished) {
                return back()->with('error', 'Cannot add result. Results for this section have already been published.');
            }

            $result = ExamResult::create($data);

            AuditService::log(
                actionType: 'CREATE',
                entityName: 'ExamResult',
                entityId: $result->id,
                oldValue: null,
                newValue: $result->toArray(),
                module: 'Exams & Results',
                category: 'Exam Result',
                notes: "Created exam result for student ID {$result->student_id}, Exam ID {$result->exam_id}, Subject ID {$result->subject_id}"
            );

            return back()->with('success', 'Exam result created');
        });
    }

    public function storeBulk(Request $request): RedirectResponse
    {
        ifCan('create-mark'); // Assuming bulk creation also requires 'create-mark' permission

        return DB::transaction(function () use ($request) {
            $data = $request->validate([
                'subject_id' => ['required', 'uuid', 'exists:subjects,id'],
                'exam_id' => ['required', 'uuid', 'exists:exams,id'],
                'class_section_id' => ['required', 'uuid', 'exists:class_sections,id'],
                'students' => ['required', 'array', 'min:1'],
                'students.*' => ['uuid', 'exists:students,id'],
            ]);

            // Check if results are published
            $isPublished = PublishedResult::where('exam_id', $data['exam_id'])
                ->where('class_section_id', $data['class_section_id'])
                ->exists();

            if ($isPublished) {
                return back()->with('error', 'Cannot enroll students. Results for this section have already been published.');
            }

            $createdResults = [];
            foreach ($data['students'] as $studentId) {
                $result = ExamResult::firstOrCreate(
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

                if ($result->wasRecentlyCreated) {
                    $createdResults[] = $result->id;
                }
            }

            AuditService::log(
                actionType: 'CREATE_BULK',
                entityName: 'ExamResult',
                entityId: 'BULK', // Using 'BULK' as ID since multiple were created
                oldValue: null,
                newValue: ['count' => count($createdResults), 'exam_id' => $data['exam_id'], 'subject_id' => $data['subject_id'], 'class_section_id' => $data['class_section_id']],
                module: 'Exams & Results',
                category: 'Exam Result',
                notes: "Enrolled " . count($createdResults) . " students for exam ID {$data['exam_id']} and subject ID {$data['subject_id']}"
            );

            return back()->with('success', 'Students enrolled for the exam');
        });
    }

    public function update(UpdateExamResultRequest $request, ExamResult $examResult): RedirectResponse
    {
        ifCan('edit-mark');

        return DB::transaction(function () use ($request, $examResult) {
            // Check if results are published
            $isPublished = PublishedResult::where('exam_id', $examResult->exam_id)
                ->where('class_section_id', $examResult->class_section_id)
                ->exists();

            if ($isPublished) {
                return back()->with('error', 'Cannot update result. Results for this section have already been published.');
            }

            $oldValues = $examResult->toArray();
            $examResult->update($request->validated());

            AuditService::log(
                actionType: 'UPDATE',
                entityName: 'ExamResult',
                entityId: $examResult->id,
                oldValue: $oldValues,
                newValue: $examResult->refresh()->toArray(),
                module: 'Exams & Results',
                category: 'Exam Result',
                notes: "Updated exam result ID {$examResult->id}"
            );

            return back()->with('success', 'Exam result updated');
        });
    }

    public function destroy(ExamResult $examResult): RedirectResponse
    {
        ifCan('delete-mark');

        return DB::transaction(function () use ($examResult) {
            // Check if results are published
            $isPublished = PublishedResult::where('exam_id', $examResult->exam_id)
                ->where('class_section_id', $examResult->class_section_id)
                ->exists();

            if ($isPublished) {
                return back()->with('error', 'Cannot delete result. Results for this section have already been published.');
            }

            $id = $examResult->id;
            $oldValues = $examResult->toArray();

            $examResult->delete();

            AuditService::log(
                actionType: 'DELETE',
                entityName: 'ExamResult',
                entityId: $id,
                oldValue: $oldValues,
                newValue: null,
                module: 'Exams & Results',
                category: 'Exam Result',
                notes: "Deleted exam result ID {$id}"
            );

            return back()->with('success', 'Exam result deleted');
        });
    }

    // New Methods

    public function create(Request $request): Response
    {
        ifCan('enroll-student-to-exam');
        $sections = ClassSection::with('grade:id,grade_name')->orderBy('section_name')->select('id', 'section_name', 'grade_id')->get();
        $subjects = Subject::query()->orderBy('subject_name')->select('id', 'subject_name', 'subject_code')->get();
        $exams = Exam::query()->orderBy('start_date', 'desc')->select('id', 'exam_name')->get();

        $students = [];
        if ($request->has('class_section_id')) {
            $query = Student::with('user')
                ->whereHas('enrollments', function ($q) use ($request) {
                    $q->where('class_section_id', $request->input('class_section_id'));
                });

            if ($request->filled('subject_id') && $request->filled('exam_id')) {
                $query->whereDoesntHave('examResults', function ($q) use ($request) {
                    $q->where('subject_id', $request->input('subject_id'))
                      ->where('exam_id', $request->input('exam_id'));
                });
            }

            $students = $query->orderBy('admission_number')
                ->select('id', 'admission_number', 'user_id')
                ->get()
                ->map(function ($student) {
                    return [
                        'id' => $student->id,
                        'name' => $student->user->name ?? $student->user->first_name . ' ' . $student->user->last_name,
                        'admission_number' => $student->admission_number,
                    ];
                });
        }

        return Inertia::render('dashboard/exam-enrollments/Create', [
            'classSections' => $sections,
            'subjects' => $subjects,
            'exams' => $exams,
            'fetchedStudents' => $students,
            'filters' => $request->only(['class_section_id', 'subject_id', 'exam_id']),
        ]);
    }

    public function resultsIndex(Request $request): Response
    {
        ifCan('view-exam-results');
        $perPage = (int) $request->input('perPage', 10);

        $exams = Exam::query()
            ->withCount('results')
            ->filter($request)
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('dashboard/exam-enrollments/ResultsList', [
            'exams' => $exams,
            'academicYears' => \App\Models\AcademicYear::orderBy('year_name', 'desc')->get(),
            'filters' => $request->all(),
        ]);
    }

    public function storeEnrollments(Request $request): RedirectResponse
    {
        ifCan('enroll-student-to-exam');
        $data = $request->validate([
            'subject_id' => ['required', 'uuid', 'exists:subjects,id'],
            'exam_id' => ['required', 'uuid', 'exists:exams,id'],
            'class_section_id' => ['required', 'uuid', 'exists:class_sections,id'],
            'students' => ['required', 'array', 'min:1'],
            'students.*' => ['uuid', 'exists:students,id'],
        ]);

        $count = 0;
        foreach ($data['students'] as $studentId) {
            $exists = ExamResult::where('student_id', $studentId)
                ->where('subject_id', $data['subject_id'])
                ->where('exam_id', $data['exam_id'])
                ->exists();

            if (!$exists) {
                ExamResult::create([
                    'student_id' => $studentId,
                    'subject_id' => $data['subject_id'],
                    'exam_id' => $data['exam_id'],
                    'class_section_id' => $data['class_section_id'],
                    'score' => null,
                    'grade' => null,
                    'remarks' => null,
                ]);
                $count++;
            }
        }

        return redirect()->route('admin.exam-enrollments.show', ['exam' => $data['exam_id']])
            ->with('success', "$count students enrolled successfully.");
    }

    public function showEnrollments(Request $request, $exam_id)
    {
        ifCan('view-exam-enrollments');
        $perPage = (int) $request->input('perPage', 50); // Higher default for tabular entry
        $search = $request->input('search');
        $subjectId = $request->input('subject_id');
        $sectionId = $request->input('class_section_id');

        // Ensure $exam_id is a valid UUID before querying
        if (!\Illuminate\Support\Str::isUuid($exam_id)) {
            return back()->with('error', 'Invalid exam ID.');
        }

        $exam = Exam::where('id', $exam_id)->first();
        if (!$exam) {
            return back()->with('error', 'Exam not found.');
        }

        $query = ExamResult::with(['student.user', 'subject', 'classSection'])
            ->where('exam_id', $exam->id);

        if ($subjectId) {
            $query->where('subject_id', $subjectId);
        }
        if ($sectionId) {
            $query->where('class_section_id', $sectionId);
        }
        if ($search !== '') {
            $query->whereHas('student', function ($sq) use ($search) {
                $sq->whereHas('user', function ($uq) use ($search) {
                    $uq->Where('first_name', 'like', '%'.$search.'%')
                       ->orWhere('last_name', 'like', '%'.$search.'%');
                })->orWhere('admission_number', 'like', '%'.$search.'%');
            });
        }

        $results = $query->orderBy('class_section_id')
            ->orderBy('student_id') // Consistent ordering
            ->paginate($perPage)
            ->withQueryString();

        // Check if published for frontend
        $publishedSectionIds = PublishedResult::where('exam_id', $exam->id)
            ->pluck('class_section_id')
            ->toArray();

        return Inertia::render('dashboard/exam-enrollments/Index', [
            'exam' => $exam->load('academicYear'),
            'results' => $results,
            'subjects' => Subject::orderBy('subject_name')->get(), // For filtering
            'classSections' => ClassSection::orderBy('section_name')->get(), // For filtering
            'filters' => $request->all(),
            'publishedSectionIds' => $publishedSectionIds,
        ]);
    }

    public function updateScores(UpdateExamScoresRequest $request): RedirectResponse
    {
        ifCan('update-exam-scores');
        $data = $request->validated();
        $count = 0;
        $skipped = 0;

        foreach ($data['results'] as $item) {
            $result = ExamResult::find($item['id']);
            if ($result) {
                // Check publication
                $isPublished = PublishedResult::where('exam_id', $result->exam_id)
                    ->where('class_section_id', $result->class_section_id)
                    ->exists();

                if ($isPublished) {
                    $skipped++;
                    continue;
                }

                $score = isset($item['score']) ? (float) $item['score'] : null;

                $updateData = ['score' => $score];
                if (!is_null($score)) {
                    $gradeInfo = GradeCalculatorService::calculate($score);
                    $updateData['grade'] = $gradeInfo['grade'];
                    $updateData['remarks'] = $gradeInfo['remarks'];
                } else {
                    $updateData['grade'] = null;
                    $updateData['remarks'] = null;
                }

                $result->update($updateData);
                $count++;
            }
        }

        $message = "$count scores updated successfully.";
        if ($skipped > 0) {
            $message .= " $skipped results skipped because they are already published.";
            if ($count === 0) {
                return back()->with('error', "Cannot update scores. Results have been published.");
            }
        }

        return back()->with('success', $message);
    }
}
