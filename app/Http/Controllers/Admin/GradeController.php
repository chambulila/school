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

class GradeController extends Controller
{
    public function index(Request $request): Response
    {
        $search = (string) $request->input('search', '');
        $perPage = (int) $request->input('perPage', 10);

        $grades = Grade::query()
            ->when($search !== '', function ($q) use ($search) {
                $q->where('grade_name', 'like', '%'.$search.'%');
            })
            ->orderBy('grade_name')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('dashboard/Grades', [
            'grades' => $grades,
            'filters' => [
                'search' => $search,
                'perPage' => $perPage,
            ],
        ]);
    }

    public function store(StoreGradeRequest $request): RedirectResponse
    {
        Grade::create($request->validated());
        return back()->with('success', 'Grade created');
    }

    public function update(UpdateGradeRequest $request, Grade $grade): RedirectResponse
    {
        $grade->update($request->validated());
        return back()->with('success', 'Grade updated');
    }

    public function destroy(Grade $grade): RedirectResponse
    {
        $grade->delete();
        return back()->with('success', 'Grade deleted');
    }
}
