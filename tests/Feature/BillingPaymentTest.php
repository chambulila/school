<?php

namespace Tests\Feature;

use App\Models\AcademicYear;
use App\Models\ClassSection;
use App\Models\FeeCategory;
use App\Models\FeeStructure;
use App\Models\Grade;
use App\Models\Payment;
use App\Models\Role;
use App\Models\Student;
use App\Models\StudentBilling;
use App\Models\StudentEnrollment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Illuminate\Support\Str;

class BillingPaymentTest extends TestCase
{
    use RefreshDatabase;

    public function test_billing_generated_on_enrollment()
    {
        $role = Role::create(['role_name' => 'Admin']);
        $user = User::factory()->create();
        $user->roles()->attach($role->id);
        $this->actingAs($user);

        // Setup
        $year = AcademicYear::create(['year_name' => '2025-2026', 'start_date' => '2025-01-01', 'end_date' => '2025-12-31']);
        $grade = Grade::create(['grade_name' => 'Grade 1', 'description' => 'First Grade']);
        $section = ClassSection::create(['section_name' => 'A', 'grade_id' => $grade->id]);

        $category = FeeCategory::create(['category_name' => 'Tuition']);
        FeeStructure::create([
            'academic_year_id' => $year->id,
            'grade_id' => $grade->id,
            'fee_category_id' => $category->fee_category_id,
            'amount' => 5000
        ]);

        $studentUser = User::factory()->create([
            'date_of_birth' => '2015-01-01',
            'gender' => 'Male',
            'address' => '123 St'
        ]);

        $student = Student::create([
            'user_id' => $studentUser->id,
            'admission_number' => 'STU001',
            'admission_date' => '2025-01-01'
        ]);

        // Enroll
        $response = $this->post(route('admin.student-enrollments.store'), [
            'student_id' => $student->id,
            'class_section_id' => $section->id,
            'academic_year_id' => $year->id,
            'enrollment_date' => '2025-01-01',
        ]);

        $response->assertSessionHas('success');

        // Assert Bill Created
        $this->assertDatabaseHas('student_billing', [
            'student_id' => $student->id,
            'academic_year_id' => $year->id,
            'total_amount' => 5000,
            'balance' => 5000,
            'status' => 'Pending'
        ]);
    }

    public function test_payment_updates_balance_and_generates_receipt()
    {
        $role = Role::create(['role_name' => 'Admin']);
        $user = User::factory()->create();
        $user->roles()->attach($role->id);
        $this->actingAs($user);

        // Setup Bill
        $year = AcademicYear::create(['year_name' => '2025-2026', 'start_date' => '2025-01-01', 'end_date' => '2025-12-31']);
        $studentUser = User::factory()->create([
            'date_of_birth' => '2015-01-01',
            'gender' => 'Female',
            'address' => '123 St'
        ]);

        $student = Student::create([
            'user_id' => $studentUser->id,
            'admission_number' => 'STU002',
            'admission_date' => '2025-01-01'
        ]);

        $bill = StudentBilling::create([
            'student_id' => $student->id,
            'academic_year_id' => $year->id,
            'total_amount' => 5000,
            'amount_paid' => 0,
            'balance' => 5000,
            'status' => 'Pending'
        ]);

        // Make Payment
        $response = $this->post(route('admin.payments.store'), [
            'bill_id' => $bill->bill_id,
            'student_id' => $student->id,
            'payment_date' => '2025-02-01',
            'amount_paid' => 2000,
            'payment_method' => 'Cash',
            'received_by' => $user->id
        ]);

        $response->assertSessionHas('success');

        // Assert Payment Created
        $this->assertDatabaseHas('payments', [
            'bill_id' => $bill->bill_id,
            'amount_paid' => 2000
        ]);

        // Assert Bill Updated
        $bill->refresh();
        $this->assertEquals(2000, $bill->amount_paid);
        $this->assertEquals(3000, $bill->balance);
        $this->assertEquals('Partially Paid', $bill->status);

        // Assert Receipt Generated
        $this->assertDatabaseHas('payment_receipts', [
            'generated_by' => $user->id
        ]);

        $payment = Payment::where('bill_id', $bill->bill_id)->first();
        $this->assertNotNull($payment->receipt);
    }

    public function test_fee_structure_cannot_be_modified_after_billing()
    {
        $role = Role::create(['role_name' => 'Admin']);
        $user = User::factory()->create();
        $user->roles()->attach($role->id);
        $this->actingAs($user);

        // Setup
        $year = AcademicYear::create(['year_name' => '2025-2026', 'start_date' => '2025-01-01', 'end_date' => '2025-12-31']);
        $grade = Grade::create(['grade_name' => 'Grade 1', 'description' => 'First Grade']);
        $section = ClassSection::create(['section_name' => 'A', 'grade_id' => $grade->id]);
        $category = FeeCategory::create(['category_name' => 'Tuition']);

        $structure = FeeStructure::create([
            'academic_year_id' => $year->id,
            'grade_id' => $grade->id,
            'fee_category_id' => $category->fee_category_id,
            'amount' => 5000
        ]);

        $studentUser = User::factory()->create([
            'date_of_birth' => '2015-01-01',
            'gender' => 'Male',
            'address' => '123 St'
        ]);

        $student = Student::create([
            'user_id' => $studentUser->id,
            'admission_number' => 'STU003',
            'admission_date' => '2025-01-01'
        ]);

        // Enroll and Bill
        StudentEnrollment::create([
            'student_id' => $student->id,
            'class_section_id' => $section->id,
            'academic_year_id' => $year->id,
            'enrollment_date' => '2025-01-01',
        ]);

        StudentBilling::create([
            'student_id' => $student->id,
            'academic_year_id' => $year->id,
            'total_amount' => 5000,
            'amount_paid' => 0,
            'balance' => 5000,
            'status' => 'Pending'
        ]);

        // Try to update structure
        $response = $this->put(route('admin.fee-structures.update', $structure), [
            'academic_year_id' => $year->id,
            'grade_id' => $grade->id,
            'fee_category_id' => $category->fee_category_id,
            'amount' => 6000
        ]);

        $response->assertSessionHas('error');
        $structure->refresh();
        $this->assertEquals(5000, $structure->amount);
    }

    public function test_payment_amount_cannot_exceed_balance()
    {
        $role = Role::create(['role_name' => 'Admin']);
        $user = User::factory()->create();
        $user->roles()->attach($role->id);
        $this->actingAs($user);

        // Setup Bill
        $year = AcademicYear::create(['year_name' => '2025-2026', 'start_date' => '2025-01-01', 'end_date' => '2025-12-31']);
        $studentUser = User::factory()->create(['first_name' => 'John', 'last_name' => 'Doe']);
        $student = Student::create(['user_id' => $studentUser->id, 'admission_number' => 'STU004', 'admission_date' => '2025-01-01']);
        $bill = StudentBilling::create([
            'student_id' => $student->id,
            'academic_year_id' => $year->id,
            'total_amount' => 1000,
            'amount_paid' => 0,
            'balance' => 1000,
            'status' => 'Pending'
        ]);

        // Attempt overpayment
        $response = $this->post(route('admin.payments.store'), [
            'bill_id' => $bill->bill_id,
            'student_id' => $student->id,
            'payment_date' => '2025-02-01',
            'amount_paid' => 1001,
            'payment_method' => 'Cash',
        ]);

        $response->assertSessionHasErrors('amount_paid');
    }

    public function test_reference_required_for_non_cash_payments()
    {
        $role = Role::create(['role_name' => 'Admin']);
        $user = User::factory()->create();
        $user->roles()->attach($role->id);
        $this->actingAs($user);

        $year = AcademicYear::create(['year_name' => '2025-2026', 'start_date' => '2025-01-01', 'end_date' => '2025-12-31']);
        $studentUser = User::factory()->create(['first_name' => 'Jane', 'last_name' => 'Doe']);
        $student = Student::create(['user_id' => $studentUser->id, 'admission_number' => 'STU005', 'admission_date' => '2025-01-01']);
        $bill = StudentBilling::create([
            'student_id' => $student->id,
            'academic_year_id' => $year->id,
            'total_amount' => 1000,
            'amount_paid' => 0,
            'balance' => 1000,
            'status' => 'Pending'
        ]);

        // Fail Bank payment without reference
        $response = $this->post(route('admin.payments.store'), [
            'bill_id' => $bill->bill_id,
            'student_id' => $student->id,
            'payment_date' => '2025-02-01',
            'amount_paid' => 100,
            'payment_method' => 'Bank',
            'transaction_reference' => ''
        ]);
        $response->assertSessionHasErrors('transaction_reference');

        // Success Bank payment with reference
        $response = $this->post(route('admin.payments.store'), [
            'bill_id' => $bill->bill_id,
            'student_id' => $student->id,
            'payment_date' => '2025-02-01',
            'amount_paid' => 100,
            'payment_method' => 'Bank',
            'transaction_reference' => 'BANK-123'
        ]);
        $response->assertSessionHasNoErrors();
    }
}
