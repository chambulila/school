<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

require __DIR__.'/settings.php';

Route::middleware(['auth', 'verified'])->prefix('dashboard')->group(function () {
    // Route::middleware('can:manage-users')->group(function () {
        Route::get('users', [\App\Http\Controllers\Admin\UserController::class, 'index'])->name('admin.users.index');
        Route::post('users', [\App\Http\Controllers\Admin\UserController::class, 'store'])->name('admin.users.store');
        Route::put('users/{user}', [\App\Http\Controllers\Admin\UserController::class, 'update'])->name('admin.users.update');
        Route::delete('users/{user}', [\App\Http\Controllers\Admin\UserController::class, 'destroy'])->name('admin.users.destroy');
    // });

    Route::middleware('can:manage-roles')->group(function () {
        Route::get('roles', [\App\Http\Controllers\Admin\RoleController::class, 'index'])->name('admin.roles.index');
        Route::post('roles', [\App\Http\Controllers\Admin\RoleController::class, 'store'])->name('admin.roles.store');
        Route::put('roles/{role}', [\App\Http\Controllers\Admin\RoleController::class, 'update'])->name('admin.roles.update');
        Route::delete('roles/{role}', [\App\Http\Controllers\Admin\RoleController::class, 'destroy'])->name('admin.roles.destroy');

        Route::get('permissions', [\App\Http\Controllers\Admin\PermissionController::class, 'index'])->name('admin.permissions.index');
        Route::put('permissions/{role}', [\App\Http\Controllers\Admin\PermissionController::class, 'update'])->name('admin.permissions.update');
    });

    Route::middleware('can:manage-classes')->group(function () {
        Route::get('grades', [\App\Http\Controllers\Admin\GradeController::class, 'index'])->name('admin.grades.index');
        Route::post('grades', [\App\Http\Controllers\Admin\GradeController::class, 'store'])->name('admin.grades.store');
        Route::put('grades/{grade}', [\App\Http\Controllers\Admin\GradeController::class, 'update'])->name('admin.grades.update');
        Route::delete('grades/{grade}', [\App\Http\Controllers\Admin\GradeController::class, 'destroy'])->name('admin.grades.destroy');

        Route::get('sections', [\App\Http\Controllers\Admin\ClassSectionController::class, 'index'])->name('admin.sections.index');
        Route::post('sections', [\App\Http\Controllers\Admin\ClassSectionController::class, 'store'])->name('admin.sections.store');
        Route::put('sections/{section}', [\App\Http\Controllers\Admin\ClassSectionController::class, 'update'])->name('admin.sections.update');
        Route::delete('sections/{section}', [\App\Http\Controllers\Admin\ClassSectionController::class, 'destroy'])->name('admin.sections.destroy');

        Route::get('academic-years', [\App\Http\Controllers\Admin\AcademicYearController::class, 'index'])->name('admin.academic-years.index');
        Route::post('academic-years', [\App\Http\Controllers\Admin\AcademicYearController::class, 'store'])->name('admin.academic-years.store');
        Route::put('academic-years/{academicYear}', [\App\Http\Controllers\Admin\AcademicYearController::class, 'update'])->name('admin.academic-years.update');
        Route::delete('academic-years/{academicYear}', [\App\Http\Controllers\Admin\AcademicYearController::class, 'destroy'])->name('admin.academic-years.destroy');

        Route::get('subjects', [\App\Http\Controllers\Admin\SubjectController::class, 'index'])->name('admin.subjects.index');
        Route::post('subjects', [\App\Http\Controllers\Admin\SubjectController::class, 'store'])->name('admin.subjects.store');
        Route::put('subjects/{subject}', [\App\Http\Controllers\Admin\SubjectController::class, 'update'])->name('admin.subjects.update');
        Route::delete('subjects/{subject}', [\App\Http\Controllers\Admin\SubjectController::class, 'destroy'])->name('admin.subjects.destroy');

        Route::get('teacher-subject-assignments', [\App\Http\Controllers\Admin\TeacherSubjectAssignmentController::class, 'index'])->name('admin.teacher-subject-assignments.index');
        Route::post('teacher-subject-assignments', [\App\Http\Controllers\Admin\TeacherSubjectAssignmentController::class, 'store'])->name('admin.teacher-subject-assignments.store');
        Route::put('teacher-subject-assignments/{teacherSubjectAssignment}', [\App\Http\Controllers\Admin\TeacherSubjectAssignmentController::class, 'update'])->name('admin.teacher-subject-assignments.update');
        Route::delete('teacher-subject-assignments/{teacherSubjectAssignment}', [\App\Http\Controllers\Admin\TeacherSubjectAssignmentController::class, 'destroy'])->name('admin.teacher-subject-assignments.destroy');

        Route::get('exams', [\App\Http\Controllers\Admin\ExamController::class, 'index'])->name('admin.exams.index');
        Route::post('exams', [\App\Http\Controllers\Admin\ExamController::class, 'store'])->name('admin.exams.store');
        Route::put('exams/{exam}', [\App\Http\Controllers\Admin\ExamController::class, 'update'])->name('admin.exams.update');
        Route::delete('exams/{exam}', [\App\Http\Controllers\Admin\ExamController::class, 'destroy'])->name('admin.exams.destroy');

        Route::get('exam-results', [\App\Http\Controllers\Admin\ExamResultController::class, 'index'])->name('admin.exam-results.index');
        Route::post('exam-results', [\App\Http\Controllers\Admin\ExamResultController::class, 'store'])->name('admin.exam-results.store');
        Route::post('exam-results/bulk', [\App\Http\Controllers\Admin\ExamResultController::class, 'storeBulk'])->name('admin.exam-results.store-bulk');
        Route::put('exam-results/{examResult}', [\App\Http\Controllers\Admin\ExamResultController::class, 'update'])->name('admin.exam-results.update');
        Route::delete('exam-results/{examResult}', [\App\Http\Controllers\Admin\ExamResultController::class, 'destroy'])->name('admin.exam-results.destroy');

        Route::get('published-results', [\App\Http\Controllers\Admin\PublishedResultController::class, 'index'])->name('admin.published-results.index');
        Route::post('published-results', [\App\Http\Controllers\Admin\PublishedResultController::class, 'store'])->name('admin.published-results.store');
        Route::put('published-results/{publishedResult}', [\App\Http\Controllers\Admin\PublishedResultController::class, 'update'])->name('admin.published-results.update');
        Route::delete('published-results/{publishedResult}', [\App\Http\Controllers\Admin\PublishedResultController::class, 'destroy'])->name('admin.published-results.destroy');

        Route::get('student-enrollments', [\App\Http\Controllers\Admin\StudentEnrollmentController::class, 'index'])->name('admin.student-enrollments.index');
        Route::post('student-enrollments', [\App\Http\Controllers\Admin\StudentEnrollmentController::class, 'store'])->name('admin.student-enrollments.store');
        Route::put('student-enrollments/{studentEnrollment}', [\App\Http\Controllers\Admin\StudentEnrollmentController::class, 'update'])->name('admin.student-enrollments.update');
        Route::delete('student-enrollments/{studentEnrollment}', [\App\Http\Controllers\Admin\StudentEnrollmentController::class, 'destroy'])->name('admin.student-enrollments.destroy');

        Route::get('teachers', [\App\Http\Controllers\Admin\TeacherController::class, 'index'])->name('admin.teachers.index');
        Route::post('teachers', [\App\Http\Controllers\Admin\TeacherController::class, 'store'])->name('admin.teachers.store');
        Route::put('teachers/{teacher}', [\App\Http\Controllers\Admin\TeacherController::class, 'update'])->name('admin.teachers.update');
        Route::delete('teachers/{teacher}', [\App\Http\Controllers\Admin\TeacherController::class, 'destroy'])->name('admin.teachers.destroy');

        Route::get('students', [\App\Http\Controllers\Admin\StudentController::class, 'index'])->name('admin.students.index');
        Route::post('students', [\App\Http\Controllers\Admin\StudentController::class, 'store'])->name('admin.students.store');
        Route::put('students/{student}', [\App\Http\Controllers\Admin\StudentController::class, 'update'])->name('admin.students.update');
        Route::delete('students/{student}', [\App\Http\Controllers\Admin\StudentController::class, 'destroy'])->name('admin.students.destroy');

        Route::get('fee-categories', [\App\Http\Controllers\Admin\FeeCategoryController::class, 'index'])->name('admin.fee-categories.index');
        Route::post('fee-categories', [\App\Http\Controllers\Admin\FeeCategoryController::class, 'store'])->name('admin.fee-categories.store');
        Route::put('fee-categories/{feeCategory}', [\App\Http\Controllers\Admin\FeeCategoryController::class, 'update'])->name('admin.fee-categories.update');
        Route::delete('fee-categories/{feeCategory}', [\App\Http\Controllers\Admin\FeeCategoryController::class, 'destroy'])->name('admin.fee-categories.destroy');

        Route::get('fee-structures', [\App\Http\Controllers\Admin\FeeStructureController::class, 'index'])->name('admin.fee-structures.index');
        Route::post('fee-structures', [\App\Http\Controllers\Admin\FeeStructureController::class, 'store'])->name('admin.fee-structures.store');
        Route::put('fee-structures/{feeStructure}', [\App\Http\Controllers\Admin\FeeStructureController::class, 'update'])->name('admin.fee-structures.update');
        Route::delete('fee-structures/{feeStructure}', [\App\Http\Controllers\Admin\FeeStructureController::class, 'destroy'])->name('admin.fee-structures.destroy');

        Route::get('student-billing', [\App\Http\Controllers\Admin\StudentBillingController::class, 'index'])->name('admin.student-billing.index');
        Route::post('student-billing', [\App\Http\Controllers\Admin\StudentBillingController::class, 'store'])->name('admin.student-billing.store');
        Route::put('student-billing/{studentBilling}', [\App\Http\Controllers\Admin\StudentBillingController::class, 'update'])->name('admin.student-billing.update');
        Route::delete('student-billing/{studentBilling}', [\App\Http\Controllers\Admin\StudentBillingController::class, 'destroy'])->name('admin.student-billing.destroy');

        Route::get('payments', [\App\Http\Controllers\Admin\PaymentController::class, 'index'])->name('admin.payments.index');
        Route::post('payments', [\App\Http\Controllers\Admin\PaymentController::class, 'store'])->name('admin.payments.store');
        Route::put('payments/{payment}', [\App\Http\Controllers\Admin\PaymentController::class, 'update'])->name('admin.payments.update');
        Route::delete('payments/{payment}', [\App\Http\Controllers\Admin\PaymentController::class, 'destroy'])->name('admin.payments.destroy');

        Route::get('payment-receipts', [\App\Http\Controllers\Admin\PaymentReceiptController::class, 'index'])->name('admin.payment-receipts.index');
        Route::post('payment-receipts', [\App\Http\Controllers\Admin\PaymentReceiptController::class, 'store'])->name('admin.payment-receipts.store');
        Route::put('payment-receipts/{paymentReceipt}', [\App\Http\Controllers\Admin\PaymentReceiptController::class, 'update'])->name('admin.payment-receipts.update');
        Route::delete('payment-receipts/{paymentReceipt}', [\App\Http\Controllers\Admin\PaymentReceiptController::class, 'destroy'])->name('admin.payment-receipts.destroy');

        Route::get('fee-notifications', [\App\Http\Controllers\Admin\FeeNotificationController::class, 'index'])->name('admin.fee-notifications.index');
        Route::post('fee-notifications', [\App\Http\Controllers\Admin\FeeNotificationController::class, 'store'])->name('admin.fee-notifications.store');
        Route::put('fee-notifications/{feeNotification}', [\App\Http\Controllers\Admin\FeeNotificationController::class, 'update'])->name('admin.fee-notifications.update');
        Route::delete('fee-notifications/{feeNotification}', [\App\Http\Controllers\Admin\FeeNotificationController::class, 'destroy'])->name('admin.fee-notifications.destroy');

        Route::post('finance-demo-seed', [\App\Http\Controllers\Admin\FinanceDemoController::class, 'seed'])->name('admin.finance-demo.seed');
    });
});
