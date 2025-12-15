<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreFeeStructureRequest;
use App\Http\Requests\Admin\UpdateFeeStructureRequest;
use App\Models\AcademicYear;
use App\Models\FeeCategory;
use App\Models\FeeStructure;
use App\Models\Grade;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FeeStructureController extends Controller
{
    public function index(Request $request): Response
    {
        $search = (string) $request->input('search', '');
        $perPage = (int) $request->input('perPage', 10);

        $structures = FeeStructure::query()
            ->with(['feeCategory', 'grade', 'academicYear'])
            ->when($search !== '', function ($q) use ($search) {
                $q->whereHas('feeCategory', function ($cq) use ($search) {
                    $cq->where('category_name', 'like', '%'.$search.'%');
                })
                ->orWhereHas('grade', function ($gq) use ($search) {
                    $gq->where('grade_name', 'like', '%'.$search.'%');
                })
                ->orWhereHas('academicYear', function ($yq) use ($search) {
                    $yq->where('year_name', 'like', '%'.$search.'%');
                });
            })
            ->orderBy('created_at', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('dashboard/FeeStructures', [
            'structures' => $structures,
            'categories' => FeeCategory::query()->orderBy('category_name')->get(),
            'grades' => Grade::query()->orderBy('grade_name')->get(),
            'years' => AcademicYear::query()->orderBy('year_name')->get(),
            'filters' => [
                'search' => $search,
                'perPage' => $perPage,
            ],
        ]);
    }

    public function store(StoreFeeStructureRequest $request)
    {
        FeeStructure::create($request->validated());
        return back()->with('success', 'Fee structure created');
    }

    public function update(UpdateFeeStructureRequest $request, FeeStructure $feeStructure)
    {
        $feeStructure->update($request->validated());
        return back()->with('success', 'Fee structure updated');
    }

    public function destroy(FeeStructure $feeStructure)
    {
        $feeStructure->delete();
        return back()->with('success', 'Fee structure deleted');
    }
}

