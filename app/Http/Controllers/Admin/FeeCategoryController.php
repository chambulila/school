<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreFeeCategoryRequest;
use App\Http\Requests\Admin\UpdateFeeCategoryRequest;
use App\Models\FeeCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FeeCategoryController extends Controller
{
    public function index(Request $request): Response
    {
        $search = (string) $request->input('search', '');
        $perPage = (int) $request->input('perPage', 10);

        $categories = FeeCategory::query()
            ->when($search !== '', function ($q) use ($search) {
                $q->where('category_name', 'like', '%'.$search.'%');
            })
            ->orderBy('category_name')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('dashboard/FeeCategories', [
            'categories' => $categories,
            'filters' => [
                'search' => $search,
                'perPage' => $perPage,
            ],
        ]);
    }

    public function store(StoreFeeCategoryRequest $request)
    {
        FeeCategory::create($request->validated());
        return back()->with('success', 'Fee category created');
    }

    public function update(UpdateFeeCategoryRequest $request, FeeCategory $feeCategory)
    {
        $feeCategory->update($request->validated());
        return back()->with('success', 'Fee category updated');
    }

    public function destroy(FeeCategory $feeCategory)
    {
        $feeCategory->delete();
        return back()->with('success', 'Fee category deleted');
    }
}

