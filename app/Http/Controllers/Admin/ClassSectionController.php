<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreClassSectionRequest;
use App\Http\Requests\Admin\UpdateClassSectionRequest;
use App\Models\ClassSection;
use App\Models\Grade;
use App\Models\Teacher;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ClassSectionController extends Controller
{
    public function index(Request $request): Response
    {
        $sections = ClassSection::query()
            ->with('grade')
            ->filter($request->only('search'))
            ->orderBy('section_name')
            ->paginate($request->input('perPage', 10))
            ->withQueryString();

        return Inertia::render('dashboard/Sections', [
            'sections' => $sections,
            'grades' => Grade::query()->orderBy('grade_name')->get(),
            'teachers' => Teacher::query()->with('user')->orderBy('employee_number')->get(),
            'filters' => $request->only('search'),
        ]);
    }

    public function store(StoreClassSectionRequest $request): RedirectResponse
    {
        ClassSection::create($request->validated());
        return back()->with('success', 'Section created');
    }

    public function update(UpdateClassSectionRequest $request, ClassSection $section): RedirectResponse
    {
        $section->update($request->validated());
        return back()->with('success', 'Section updated');
    }

    public function destroy(ClassSection $section): RedirectResponse
    {
        $section->delete();
        return back()->with('success', 'Section deleted');
    }
}
