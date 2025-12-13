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
        $search = (string) $request->input('search', '');
        $perPage = (int) $request->input('perPage', 10);

        $years = AcademicYear::query()
            ->when($search !== '', function ($q) use ($search) {
                $q->where('year_name', 'like', '%'.$search.'%');
            })
            ->orderBy('year_name')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('dashboard/AcademicYears', [
            'years' => $years,
            'filters' => [
                'search' => $search,
                'perPage' => $perPage,
            ],
        ]);
    }

    public function store(StoreAcademicYearRequest $request)
    {
        AcademicYear::create($request->validated());
        return back()->with('success', 'Academic year created');
    }

    public function update(UpdateAcademicYearRequest $request, AcademicYear $academicYear)
    {
        $academicYear->update($request->validated());
        return back()->with('success', 'Academic year updated');
    }

    public function destroy(AcademicYear $academicYear)
    {
        $academicYear->delete();
        return back()->with('success', 'Academic year deleted');
    }
}

