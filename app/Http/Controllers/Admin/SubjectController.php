<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreSubjectRequest;
use App\Http\Requests\Admin\UpdateSubjectRequest;
use App\Models\Grade;
use App\Models\Subject;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

use App\Services\AuditService;
use Illuminate\Support\Facades\DB;

class SubjectController extends Controller
{
    public function index(Request $request): Response
    {
        ifCan('view-subjects');
        $perPage = (int) $request->input('perPage', 10);

        $subjects = Subject::query()
            ->filter($request)
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('dashboard/Subjects', [
            'subjects' => $subjects,
            'grades' => Grade::query()->orderBy('grade_name')->get(),
            'filters' => $request->all(),
        ]);
    }

    public function store(StoreSubjectRequest $request): RedirectResponse
    {
        ifCan('create-subject');

        return DB::transaction(function () use ($request) {
            $subject = Subject::create($request->validated());

            AuditService::log(
                actionType: 'CREATE',
                entityName: 'Subject',
                entityId: $subject->id,
                oldValue: null,
                newValue: $subject->toArray(),
                module: 'Academics',
                category: 'Subjects',
                notes: "Created subject '{$subject->subject_name}'"
            );

            return back()->with('success', 'Subject created');
        });
    }

    public function update(UpdateSubjectRequest $request, Subject $subject): RedirectResponse
    {
        ifCan('edit-subject');

        return DB::transaction(function () use ($request, $subject) {
            $oldValues = $subject->toArray();
            $subject->update($request->validated());

            AuditService::log(
                actionType: 'UPDATE',
                entityName: 'Subject',
                entityId: $subject->id,
                oldValue: $oldValues,
                newValue: $subject->refresh()->toArray(),
                module: 'Academics',
                category: 'Subjects',
                notes: "Updated subject '{$subject->subject_name}'"
            );

            return back()->with('success', 'Subject updated');
        });
    }

    public function destroy(Subject $subject): RedirectResponse
    {
        ifCan('delete-subject');

        return DB::transaction(function () use ($subject) {
            $id = $subject->id;
            $oldValues = $subject->toArray();

            $subject->delete();

            AuditService::log(
                actionType: 'DELETE',
                entityName: 'Subject',
                entityId: $id,
                oldValue: $oldValues,
                newValue: null,
                module: 'Academics',
                category: 'Subjects',
                notes: "Deleted subject '{$oldValues['subject_name']}'"
            );

            return back()->with('success', 'Subject deleted');
        });
    }
}

