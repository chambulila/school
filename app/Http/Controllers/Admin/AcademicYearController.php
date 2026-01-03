<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreAcademicYearRequest;
use App\Http\Requests\Admin\UpdateAcademicYearRequest;
use App\Models\AcademicYear;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

use App\Services\AuditService;
use Illuminate\Support\Facades\DB;

class AcademicYearController extends Controller
{
    public function index(Request $request): Response
    {
        ifCan('view-academic-years');
        $perPage = (int) $request->input('perPage', 10);

        $years = AcademicYear::query()
            ->filter($request)
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('dashboard/AcademicYears', [
            'years' => $years,
            'filters' => $request->all(),
        ]);
    }

    public function store(StoreAcademicYearRequest $request)
    {
        ifCan('create-academic-year');
        
        return DB::transaction(function () use ($request) {
            $year = AcademicYear::create($request->validated());
            
            AuditService::log(
                actionType: 'CREATE',
                entityName: 'AcademicYear',
                entityId: $year->id,
                oldValue: null,
                newValue: $year->toArray(),
                module: 'Academics',
                category: 'Academic Years',
                notes: "Created academic year '{$year->year_name}'"
            );

            return back()->with('success', 'Academic year created');
        });
    }

    public function update(UpdateAcademicYearRequest $request, AcademicYear $academicYear)
    {
        ifCan('edit-academic-year');

        return DB::transaction(function () use ($request, $academicYear) {
            $oldValues = $academicYear->toArray();
            $data_to_update = $request->validated();
            
            if ($request->boolean('is_active')) {
                $currentYear = AcademicYear::query()->where('is_active', true)->where('id', '!=', $academicYear->id)->first();
                if ($currentYear) {
                    $oldCurrentYear = $currentYear->toArray();
                    $currentYear->update(['is_active' => false]);
                    
                    AuditService::log(
                        actionType: 'UPDATE',
                        entityName: 'AcademicYear',
                        entityId: $currentYear->id,
                        oldValue: $oldCurrentYear,
                        newValue: $currentYear->refresh()->toArray(),
                        module: 'Academics',
                        category: 'Academic Years',
                        notes: "Deactivated previous academic year '{$currentYear->year_name}'"
                    );
                }
            }
            
            $data_to_update['is_active'] = $request->boolean('is_active');
            $academicYear->update($data_to_update);
            
            AuditService::log(
                actionType: 'UPDATE',
                entityName: 'AcademicYear',
                entityId: $academicYear->id,
                oldValue: $oldValues,
                newValue: $academicYear->refresh()->toArray(),
                module: 'Academics',
                category: 'Academic Years',
                notes: "Updated academic year '{$academicYear->year_name}'"
            );

            return back()->with('success', 'Academic year updated');
        });
    }

    public function destroy(AcademicYear $academicYear)
    {
        ifCan('delete-academic-year');

        return DB::transaction(function () use ($academicYear) {
            $id = $academicYear->id;
            $oldValues = $academicYear->toArray();
            
            $academicYear->delete();
            
            AuditService::log(
                actionType: 'DELETE',
                entityName: 'AcademicYear',
                entityId: $id,
                oldValue: $oldValues,
                newValue: null,
                module: 'Academics',
                category: 'Academic Years',
                notes: "Deleted academic year '{$oldValues['year_name']}'"
            );

            return back()->with('success', 'Academic year deleted');
        });
    }
}

