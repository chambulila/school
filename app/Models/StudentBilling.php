<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Auth;

class StudentBilling extends Model
{
    use HasFactory;

    protected $table = "student_billing";
    protected $primaryKey = 'bill_id';
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = [
        'bill_id',
        'student_id',
        'academic_year_id',
        'total_amount',
        'amount_paid',
        'fee_structure_id',
        'balance',
        'user_id',
        'updated_by',
        'status',
        'created_at',
        'updated_at',
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if (! $model->getKey()) {
                $model->{$model->getKeyName()} = (string) Str::uuid();
            }
            $model->user_id = Auth::id();
        });
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function academicYear(): BelongsTo
    {
        return $this->belongsTo(AcademicYear::class);
    }

    public function feeStructure(): BelongsTo
    {
        return $this->belongsTo(FeeStructure::class, 'fee_structure_id', 'fee_structure_id');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class, 'bill_id', 'bill_id');
    }

    public function feeNotifications(): HasMany
    {
        return $this->hasMany(FeeNotification::class, 'bill_id', 'bill_id');
    }

    public function scopeFilter($query, array $filters)
    {
        $query->when($filters['search'] ?? null, function ($query, $search) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('student.user', function ($uq) use ($search) {
                    $uq->where('first_name', 'like', '%' . $search . '%')
                        ->orWhere('last_name', 'like', '%' . $search . '%')
                        ->orWhere('email', 'like', '%' . $search . '%');
                })
                ->orWhereHas('academicYear', function ($yq) use ($search) {
                    $yq->where('year_name', 'like', '%' . $search . '%');
                });
            });
        });
    }
}
