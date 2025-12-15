<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreStudentBillingRequest;
use App\Http\Requests\Admin\UpdateStudentBillingRequest;
use App\Models\AcademicYear;
use App\Models\Student;
use App\Models\StudentBilling;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StudentBillingController extends Controller
{
    public function index(Request $request): Response
    {
        $search = (string) $request->input('search', '');
        $perPage = (int) $request->input('perPage', 10);

        $bills = StudentBilling::query()
            ->with(['student.user', 'academicYear'])
            ->when($search !== '', function ($q) use ($search) {
                $q->whereHas('student.user', function ($uq) use ($search) {
                    $uq->where('name', 'like', '%'.$search.'%')
                       ->orWhere('first_name', 'like', '%'.$search.'%')
                       ->orWhere('last_name', 'like', '%'.$search.'%')
                       ->orWhere('email', 'like', '%'.$search.'%');
                })
                ->orWhereHas('academicYear', function ($yq) use ($search) {
                    $yq->where('year_name', 'like', '%'.$search.'%');
                });
            })
            ->orderBy('created_at', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('dashboard/StudentBilling', [
            'bills' => $bills,
            'students' => Student::query()->with('user')->orderBy('admission_number')->get(),
            'years' => AcademicYear::query()->orderBy('year_name')->get(),
            'filters' => [
                'search' => $search,
                'perPage' => $perPage,
            ],
        ]);
    }

    public function store(StoreStudentBillingRequest $request)
    {
        StudentBilling::create($request->validated());
        return back()->with('success', 'Student bill created');
    }

    public function update(UpdateStudentBillingRequest $request, StudentBilling $studentBilling)
    {
        $studentBilling->update($request->validated());
        return back()->with('success', 'Student bill updated');
    }

    public function destroy(StudentBilling $studentBilling)
    {
        $studentBilling->delete();
        return back()->with('success', 'Student bill deleted');
    }
}

