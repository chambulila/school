<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Permission;
use App\Models\Role;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        $modules = [
            'User Management' => ['view-users', 'create-user', 'edit-user', 'delete-user'],
            'Roles' => ['view-roles', 'create-role', 'edit-role', 'delete-role', 'manage-permissions'],
            'Student Billing' => ['view-student-billings', 'create-student-billing', 'edit-student-billing', 'delete-student-billing'],
            'Fee Structures' => ['view-fee-structures', 'create-fee-structure', 'edit-fee-structure', 'delete-fee-structure'],
            'Academic Years' => ['view-academic-years', 'create-academic-year', 'edit-academic-year', 'delete-academic-year'],
            'Terms' => ['view-terms', 'create-term', 'edit-term', 'delete-term'],
            'Classes' => ['view-classes', 'create-class', 'edit-class', 'delete-class'],
            'Sections' => ['view-sections', 'create-section', 'edit-section', 'delete-section'],
            'Subjects' => ['view-subjects', 'create-subject', 'edit-subject', 'delete-subject'],
            'Teachers' => ['view-teachers', 'create-teacher', 'edit-teacher', 'delete-teacher'],
            'Parents' => ['view-parents', 'create-parent', 'edit-parent', 'delete-parent'],
            'Students' => ['view-students', 'create-student', 'edit-student', 'delete-student'],
            'Attendance' => ['view-attendance', 'create-attendance', 'edit-attendance', 'delete-attendance'],
            'Exams' => ['view-exams', 'create-exam', 'edit-exam', 'delete-exam'],
            'Marks' => ['view-marks', 'create-mark', 'edit-mark', 'delete-mark', 'view-results', 'view-exam-results', 'enroll-student-to-exam', 'view-exam-enrollments', 'update-exam-scores'],
            'Grades' => ['view-grades', 'create-grade', 'edit-grade', 'delete-grade'],
            'Time Table' => ['view-time-tables', 'create-time-table', 'edit-time-table', 'delete-time-table'],
            'Return Book' => ['view-return-books', 'create-return-book', 'edit-return-book', 'delete-return-book'],
            'Hostel' => ['view-hostels', 'create-hostel', 'edit-hostel', 'delete-hostel'],
            'Transport' => ['view-transports', 'create-transport', 'edit-transport', 'delete-transport'],
            'Communicate' => ['view-communications', 'create-communication', 'edit-communication', 'delete-communication'],
            'Settings' => ['view-settings', 'create-setting', 'edit-setting', 'delete-setting'],
            'Reports' => ['view-reports', 'create-report', 'edit-report', 'delete-report'],
            'Payments' => ['view-payments', 'create-payment', 'edit-payment', 'delete-payment', 'genarate-payment-reference', 'download-payment-receipt'],
        ];

        foreach ($modules as $module => $actions) {
            foreach ($actions as $slug) {
                Permission::updateOrCreate(
                    [
                        'slug' =>  strtolower($slug),
                    ],
                    [
                        'module' => $module,
                        'name' =>  str_replace('-', ' ', ucwords($slug)),
                    ]
                );
            }
        }

        $admin = Role::where('role_name', 'super-admin')->first();

        if (!$admin) {
            $admin = Role::create([
                'role_name' => 'super-admin',
                'description' => 'Has all permissions'
            ]);
        }
        if ($admin) {
            $permissionIds = Permission::pluck('id')->all();
            $admin->permissions()->sync($permissionIds);
        }
    }
}

