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
        $categories = FeeCategory::query()
            ->filter($request->only('search'))
            ->orderBy('category_name')
            ->paginate($request->input('perPage', 10))
            ->withQueryString();

        return Inertia::render('dashboard/FeeCategories', [
            'categories' => $categories,
            'filters' => $request->only('search'),
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

