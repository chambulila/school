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

class AcademicYearController extends Controller
{
    public function index(Request $request): Response
    {
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
        AcademicYear::create($request->validated());
        return back()->with('success', 'Academic year created');
    }

    public function update(UpdateAcademicYearRequest $request, AcademicYear $academicYear)
    {
        $data_to_update = $request->validated();
        if ($request->boolean('is_active')) {
            $currentYear = AcademicYear::query()->where('is_active', true)->first();
            if ($currentYear) {
                $currentYear->update(['is_active' => false]);
            }
        }
        $data_to_update['is_active'] = $request->boolean('is_active');
        $academicYear->update($data_to_update);
        return back()->with('success', 'Academic year updated');
    }

    public function destroy(AcademicYear $academicYear)
    {
        $academicYear->delete();
        return back()->with('success', 'Academic year deleted');
    }
}

