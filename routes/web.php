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
    });
});
