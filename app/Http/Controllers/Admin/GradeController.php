<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreGradeRequest;
use App\Http\Requests\Admin\UpdateGradeRequest;
use App\Models\Grade;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Services\AuditService;
use Illuminate\Support\Facades\DB;

class GradeController extends Controller
{
    public function index(Request $request): Response
    {
        ifCan('view-grades');
        $grades = Grade::query()
            ->filter($request->only('search'))
            ->orderBy('grade_name')
            ->paginate($request->input('perPage', 10))
            ->withQueryString();

        return Inertia::render('dashboard/Grades', [
            'grades' => $grades,
            'filters' => $request->only('search'),
        ]);
    }

    public function store(StoreGradeRequest $request): RedirectResponse
    {
        return DB::transaction(function () use ($request) {
            $grade = Grade::create($request->validated());

            AuditService::log(
                actionType: 'CREATE',
                entityName: 'Grade',
                entityId: $grade->id,
                oldValue: null,
                newValue: $grade->toArray(),
                module: 'Academics',
                category: 'Grades',
                notes: "Created grade '{$grade->grade_name}'"
            );

            return back()->with('success', 'Grade created');
        });
    }

    public function update(UpdateGradeRequest $request, Grade $grade): RedirectResponse
    {
        return DB::transaction(function () use ($request, $grade) {
            $oldValues = $grade->toArray();
            $grade->update($request->validated());

            AuditService::log(
                actionType: 'UPDATE',
                entityName: 'Grade',
                entityId: $grade->id,
                oldValue: $oldValues,
                newValue: $grade->refresh()->toArray(),
                module: 'Academics',
                category: 'Grades',
                notes: "Updated grade '{$grade->grade_name}'"
            );

            return back()->with('success', 'Grade updated');
        });
    }

    public function destroy(Grade $grade): RedirectResponse
    {
        ifCan('delete-grade');

        if (!$grade) {
            return back()->with('error', 'Grade with this identifier not found!');
        }
        return DB::transaction(function () use ($grade) {
            $id = $grade->id;
            $oldValues = $grade->toArray();

            $grade->delete();

            AuditService::log(
                actionType: 'DELETE',
                entityName: 'Grade',
                entityId: $id,
                oldValue: $oldValues,
                newValue: null,
                module: 'Academics',
                category: 'Grades',
                notes: "Deleted grade '{$oldValues['grade_name']}'"
            );

            return back()->with('success', 'Grade deleted');
        });
    }
}
