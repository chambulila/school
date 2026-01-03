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
use App\Services\AuditService;
use Illuminate\Support\Facades\DB;

class ClassSectionController extends Controller
{
    public function index(Request $request): Response
    {
        ifCan('view-sections');
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
        return DB::transaction(function () use ($request) {
            $section = ClassSection::create($request->validated());

            AuditService::log(
                actionType: 'CREATE',
                entityName: 'ClassSection',
                entityId: $section->id,
                oldValue: null,
                newValue: $section->toArray(),
                module: 'Academics',
                category: 'Sections',
                notes: "Created section '{$section->section_name}' for grade ID {$section->grade_id}"
            );

            return back()->with('success', 'Section created');
        });
    }

    public function update(UpdateClassSectionRequest $request, ClassSection $section): RedirectResponse
    {
        return DB::transaction(function () use ($request, $section) {
            $oldValues = $section->toArray();
            $section->update($request->validated());

            AuditService::log(
                actionType: 'UPDATE',
                entityName: 'ClassSection',
                entityId: $section->id,
                oldValue: $oldValues,
                newValue: $section->refresh()->toArray(),
                module: 'Academics',
                category: 'Sections',
                notes: "Updated section '{$section->section_name}'"
            );

            return back()->with('success', 'Section updated');
        });
    }

    public function destroy(ClassSection $section): RedirectResponse
    {
        ifCan('delete-section');

        return DB::transaction(function () use ($section) {
            $id = $section->id;
            $oldValues = $section->toArray();

            $section->delete();

            AuditService::log(
                actionType: 'DELETE',
                entityName: 'ClassSection',
                entityId: $id,
                oldValue: $oldValues,
                newValue: null,
                module: 'Academics',
                category: 'Sections',
                notes: "Deleted section '{$oldValues['section_name']}'"
            );

            return back()->with('success', 'Section deleted');
        });
    }
}
