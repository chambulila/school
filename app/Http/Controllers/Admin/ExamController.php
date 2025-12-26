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
        $exams = Exam::query()
            ->with('academicYear')
            ->filter($request->only('search'))
            ->orderBy('start_date', 'desc')
            ->paginate($request->input('perPage', 10))
            ->withQueryString();

        return Inertia::render('dashboard/Exams', [
            'exams' => $exams,
            'years' => AcademicYear::query()->orderBy('year_name')->get(),
            'filters' => $request->only('search'),
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

