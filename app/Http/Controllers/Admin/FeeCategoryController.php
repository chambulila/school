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
use App\Services\AuditService;
use Illuminate\Support\Facades\DB;

class FeeCategoryController extends Controller
{
    public function index(Request $request): Response
    {
        ifCan('view-fee-categories');
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
        return DB::transaction(function () use ($request) {
            $category = FeeCategory::create($request->validated());

            AuditService::log(
                actionType: 'CREATE',
                entityName: 'FeeCategory',
                entityId: $category->id,
                oldValue: null,
                newValue: $category->toArray(),
                module: 'Fees & Billing',
                category: 'Fee Categories',
                notes: "Created fee category '{$category->category_name}'"
            );

            return back()->with('success', 'Fee category created');
        });
    }

    public function update(UpdateFeeCategoryRequest $request, FeeCategory $feeCategory)
    {
        return DB::transaction(function () use ($request, $feeCategory) {
            $oldValues = $feeCategory->toArray();
            $feeCategory->update($request->validated());

            AuditService::log(
                actionType: 'UPDATE',
                entityName: 'FeeCategory',
                entityId: $feeCategory->id,
                oldValue: $oldValues,
                newValue: $feeCategory->refresh()->toArray(),
                module: 'Fees & Billing',
                category: 'Fee Categories',
                notes: "Updated fee category '{$feeCategory->category_name}'"
            );

            return back()->with('success', 'Fee category updated');
        });
    }

    public function destroy(FeeCategory $feeCategory)
    {
        ifCan('delete-fee-category');

        return DB::transaction(function () use ($feeCategory) {
            $id = $feeCategory->id;
            $oldValues = $feeCategory->toArray();

            $feeCategory->delete();

            AuditService::log(
                actionType: 'DELETE',
                entityName: 'FeeCategory',
                entityId: $id,
                oldValue: $oldValues,
                newValue: null,
                module: 'Fees & Billing',
                category: 'Fee Categories',
                notes: "Deleted fee category '{$oldValues['category_name']}'"
            );

            return back()->with('success', 'Fee category deleted');
        });
    }
}

