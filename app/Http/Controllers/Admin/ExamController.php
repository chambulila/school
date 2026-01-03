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
use App\Services\AuditService;
use Illuminate\Support\Facades\DB;

class ExamController extends Controller
{
    public function index(Request $request): Response
    {
        ifCan('view-exams');
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
        ifCan('create-exam');
        
        return DB::transaction(function () use ($request) {
            $exam = Exam::create($request->validated());

            AuditService::log(
                actionType: 'CREATE',
                entityName: 'Exam',
                entityId: $exam->id,
                oldValue: null,
                newValue: $exam->toArray(),
                module: 'Exams & Results',
                category: 'Exams',
                notes: "Created exam '{$exam->exam_name}' for academic year ID {$exam->academic_year_id}"
            );

            return back()->with('success', 'Exam created');
        });
    }

    public function update(UpdateExamRequest $request, Exam $exam): RedirectResponse
    {
        ifCan('edit-exam');

        return DB::transaction(function () use ($request, $exam) {
            $oldValues = $exam->toArray();
            $exam->update($request->validated());

            AuditService::log(
                actionType: 'UPDATE',
                entityName: 'Exam',
                entityId: $exam->id,
                oldValue: $oldValues,
                newValue: $exam->refresh()->toArray(),
                module: 'Exams & Results',
                category: 'Exams',
                notes: "Updated exam '{$exam->exam_name}'"
            );

            return back()->with('success', 'Exam updated');
        });
    }

    public function destroy(Exam $exam): RedirectResponse
    {
        ifCan('delete-exam');

        return DB::transaction(function () use ($exam) {
            $id = $exam->id;
            $oldValues = $exam->toArray();
            
            $exam->delete();

            AuditService::log(
                actionType: 'DELETE',
                entityName: 'Exam',
                entityId: $id,
                oldValue: $oldValues,
                newValue: null,
                module: 'Exams & Results',
                category: 'Exams',
                notes: "Deleted exam '{$oldValues['exam_name']}'"
            );

            return back()->with('success', 'Exam deleted');
        });
    }
}

