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

class SubjectController extends Controller
{
    public function index(Request $request): Response
    {
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
        Subject::create($request->validated());
        return back()->with('success', 'Subject created');
    }

    public function update(UpdateSubjectRequest $request, Subject $subject): RedirectResponse
    {
        $subject->update($request->validated());
        return back()->with('success', 'Subject updated');
    }

    public function destroy(Subject $subject): RedirectResponse
    {
        $subject->delete();
        return back()->with('success', 'Subject deleted');
    }
}

