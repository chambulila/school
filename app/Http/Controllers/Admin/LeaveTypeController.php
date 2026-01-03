<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\LeaveType;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LeaveTypeController extends Controller
{
    public function index(): Response
    {
        ifCan('manage-leave-types');
        return Inertia::render('dashboard/leaves/Types', [
            'types' => LeaveType::orderBy('name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        ifCan('manage-leave-types');
        $data = $request->validate([
            'name' => ['required', 'string'],
            'applicant_scope' => ['required', 'in:teacher,student,both'],
            'enabled' => ['boolean'],
            'max_days_per_year' => ['nullable', 'integer', 'min:0'],
            'requires_attachment' => ['boolean'],
            'requires_approval' => ['boolean'],
            'paid' => ['nullable', 'boolean'],
            'description' => ['nullable', 'string'],
        ]);
        LeaveType::create($data);
        return back()->with('success', 'Leave type created');
    }

    public function update(Request $request, LeaveType $leaveType)
    {
        ifCan('manage-leave-types');
        $data = $request->validate([
            'name' => ['required', 'string'],
            'applicant_scope' => ['required', 'in:teacher,student,both'],
            'enabled' => ['boolean'],
            'max_days_per_year' => ['nullable', 'integer', 'min:0'],
            'requires_attachment' => ['boolean'],
            'requires_approval' => ['boolean'],
            'paid' => ['nullable', 'boolean'],
            'description' => ['nullable', 'string'],
        ]);
        $leaveType->update($data);
        return back()->with('success', 'Leave type updated');
    }
}

