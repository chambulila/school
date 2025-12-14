<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreExamRequest;
use App\Http\Requests\Admin\UpdateExamRequest;
use App\Models\AcademicYear;
use App\Models\Exam;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ExamController extends Controller
{
    public function index(Request $request): Response
    {
        $search = (string) $request->input('search', '');
        $perPage = (int) $request->input('perPage', 10);

        $exams = Exam::query()
            ->with('academicYear')
            ->when($search !== '', function ($q) use ($search) {
                $q->where('exam_name', 'like', '%'.$search.'%')
                  ->orWhere('term_name', 'like', '%'.$search.'%')
                  ->orWhereHas('academicYear', function ($yq) use ($search) {
                      $yq->where('year_name', 'like', '%'.$search.'%');
                  });
            })
            ->orderBy('start_date', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('dashboard/Exams', [
            'exams' => $exams,
            'years' => AcademicYear::query()->orderBy('year_name')->get(),
            'filters' => [
                'search' => $search,
                'perPage' => $perPage,
            ],
        ]);
    }

    public function store(StoreExamRequest $request): RedirectResponse
    {
        Exam::create($request->validated());
        return back()->with('success', 'Exam created');
    }

    public function update(UpdateExamRequest $request, Exam $exam): RedirectResponse
    {
        $exam->update($request->validated());
        return back()->with('success', 'Exam updated');
    }

    public function destroy(Exam $exam): RedirectResponse
    {
        $exam->delete();
        return back()->with('success', 'Exam deleted');
    }
}

