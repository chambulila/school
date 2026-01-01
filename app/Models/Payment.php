<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Facades\Request;

class Payment extends Model
{
    use HasFactory;

    protected $primaryKey = 'payment_id';
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = [
        'bill_id',
        'student_id',
        'payment_id',
        'payment_date',
        'amount_paid',
        'payment_method',
        'transaction_reference',
        'received_by',
        'created_by',
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if (! $model->getKey()) {
                $model->{$model->getKeyName()} = (string) Str::uuid();
            }
            if (! $model->created_by) {
                $model->created_by = auth()->user()->id;
            }
        });
    }

    public function bill(): BelongsTo
    {
        return $this->belongsTo(StudentBilling::class, 'bill_id', 'bill_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function receivedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'received_by');
    }

    public function receipt(): HasOne
    {
        return $this->hasOne(PaymentReceipt::class, 'payment_id', 'payment_id');
    }

    public function scopeApplyFilters($query, $request)
    {
        return $query->when($request->input('search'), function ($q, $search) {
                $q->where(function ($subQ) use ($search) {
                    $subQ->whereHas('student.user', function ($uq) use ($search) {
                        $uq->where('first_name', 'like', "%{$search}%")
                            ->orWhere('last_name', 'like', "%{$search}%");
                    })
                        ->orWhereHas('student', function ($sq) use ($search) {
                            $sq->where('admission_number', 'like', "%{$search}%");
                        })
                        ->orWhereHas('receipt', function ($rq) use ($search) {
                            $rq->where('receipt_number', 'like', "%{$search}%");
                        })
                        ->orWhere('transaction_reference', 'like', "%{$search}%");
                });
            })
            ->when($request->input('academic_year_id'), function ($q, $yearId) {
                $q->whereHas('bill', function ($bq) use ($yearId) {
                    $bq->where('academic_year_id', $yearId);
                });
            })
            ->when($request->input('date_from'), function ($q, $date) {
                $q->whereDate('payment_date', '>=', $date);
            })
            ->when($request->input('date_to'), function ($q, $date) {
                $q->whereDate('payment_date', '<=', $date);
            })
            ->when($request->input('min_amount'), function ($q, $min) {
                $q->where('amount_paid', '>=', $min);
            })
            ->when($request->input('max_amount'), function ($q, $max) {
                $q->where('amount_paid', '<=', $max);
            })
            ->when($request->input('received_by'), function ($q, $userId) {
                $q->where('received_by', $userId);
            })
            ->when($request->input('student_id'), function ($q, $id) {
                $q->where('student_id', $id);
            })
            ->when($request->input('grade_id'), function ($q, $gradeId) {
                $q->whereHas('student.currentClass', function ($cq) use ($gradeId) {
                    $cq->where('grade_id', $gradeId);
                });
            })
            ->when($request->input('payment_method'), function ($q, $method) {
                $q->where('payment_method', $method);
            })
            ->when($request->input('receipt_number'), function ($q, $number) {
                $q->whereHas('receipt', function ($rq) use ($number) {
                    $rq->where('receipt_number', 'like', "%{$number}%");
                });
            })
            ->when($request->input('transaction_reference'), function ($q, $ref) {
                $q->where('transaction_reference', 'like', "%{$ref}%");
            });
    }

    public function scopeFilter($query, $request)
    {
        return $query->with([
            'student.user',
            'student.currentClass.grade',
            'bill.academicYear',
            'receivedBy',
            'receipt',
            'creator:id,first_name,last_name',
        ])
            ->applyFilters($request)
            ->orderBy('payment_date', 'desc')
            ->orderBy('created_at', 'desc');
    }
}
