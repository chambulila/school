<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreFeeStructureRequest;
use App\Http\Requests\Admin\UpdateFeeStructureRequest;
use App\Models\AcademicYear;
use App\Models\FeeCategory;
use App\Models\FeeStructure;
use App\Models\Grade;
use App\Models\StudentBilling;
use App\Models\StudentEnrollment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Services\AuditService;
use Illuminate\Support\Facades\DB;

class FeeStructureController extends Controller
{
    public function index(Request $request): Response
    {
        ifCan('view-fee-structures');
        $structures = FeeStructure::query()
            ->with(['feeCategory', 'grade', 'academicYear'])
            ->filter($request->only('search'))
            ->orderBy('created_at', 'desc')
            ->paginate($request->input('perPage', 10))
            ->withQueryString();

        return Inertia::render('dashboard/FeeStructures', [
            'structures' => $structures,
            'categories' => FeeCategory::query()->orderBy('category_name')->get(),
            'grades' => Grade::query()->orderBy('grade_name')->get(),
            'years' => AcademicYear::query()->orderBy('year_name')->get(),
            'filters' => $request->only('search'),
        ]);
    }

    public function store(StoreFeeStructureRequest $request)
    {
        ifCan('create-fee-structure');
        
        return DB::transaction(function () use ($request) {
            $feeStructure = FeeStructure::create($request->validated());

            AuditService::log(
                actionType: 'CREATE',
                entityName: 'FeeStructure',
                entityId: $feeStructure->fee_structure_id,
                oldValue: null,
                newValue: $feeStructure->toArray(),
                module: 'Fees & Billing',
                category: 'Fee Structure',
                notes: "Created fee structure for {$feeStructure->grade->grade_name} in {$feeStructure->academicYear->year_name}"
            );

            return back()->with('success', 'Fee structure created');
        });
    }

    public function update(UpdateFeeStructureRequest $request, FeeStructure $feeStructure)
    {
        ifCan('edit-fee-structure');

        if ($this->billingExistsFor($feeStructure)) {
            return back()->with('error', 'Cannot modify fee structure because billing has already started for this grade and academic year.');
        }

        return DB::transaction(function () use ($request, $feeStructure) {
            $oldValues = $feeStructure->toArray();
            $feeStructure->update($request->validated());

            AuditService::log(
                actionType: 'UPDATE',
                entityName: 'FeeStructure',
                entityId: $feeStructure->fee_structure_id,
                oldValue: $oldValues,
                newValue: $feeStructure->refresh()->toArray(),
                module: 'Fees & Billing',
                category: 'Fee Structure',
                notes: "Updated fee structure {$feeStructure->fee_structure_id}"
            );

            return back()->with('success', 'Fee structure updated');
        });
    }

    public function destroy(FeeStructure $feeStructure)
    {
        ifCan('delete-fee-structure');

        if ($this->billingExistsFor($feeStructure)) {
            return back()->with('error', 'Cannot delete fee structure because billing has already started for this grade and academic year.');
        }

        return DB::transaction(function () use ($feeStructure) {
            $id = $feeStructure->fee_structure_id;
            $oldValues = $feeStructure->toArray();
            
            $feeStructure->delete();

            AuditService::log(
                actionType: 'DELETE',
                entityName: 'FeeStructure',
                entityId: $id,
                oldValue: $oldValues,
                newValue: null,
                module: 'Fees & Billing',
                category: 'Fee Structure',
                notes: "Deleted fee structure $id"
            );

            return back()->with('success', 'Fee structure deleted');
        });
    }

    private function billingExistsFor(FeeStructure $structure): bool
    {
        // Find enrollments for this grade and year
        $studentIds = StudentEnrollment::where('academic_year_id', $structure->academic_year_id)
            ->whereHas('classSection', function($q) use ($structure) {
                $q->where('grade_id', $structure->grade_id);
            })
            ->pluck('student_id');
            
        if ($studentIds->isEmpty()) {
            return false;
        }
        
        return StudentBilling::whereIn('student_id', $studentIds)
            ->where('academic_year_id', $structure->academic_year_id)
            ->exists();
    }
}
