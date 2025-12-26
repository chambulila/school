<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Student extends Model
{
    use HasFactory;

    public $incrementing = false;
    protected $keyType = 'string';
    protected $guarded = [];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if (! $model->getKey()) {
                $model->{$model->getKeyName()} = (string) Str::uuid();
            }
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function currentClass(): BelongsTo
    {
        return $this->belongsTo(ClassSection::class, 'current_class_id');
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(StudentEnrollment::class);
    }

    public function examResults(): HasMany
    {
        return $this->hasMany(ExamResult::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function bills(): HasMany
    {
        return $this->hasMany(StudentBilling::class, 'student_id');
    }

    public function feeNotifications(): HasMany
    {
        return $this->hasMany(FeeNotification::class);
    }

    public function scopeFilter($query, $request)
    {
        return $query->with(['user', 'currentClass.grade'])
            ->when($request->input('search'), function ($q, $search) {
                $q->where('admission_number', 'like', '%'.$search.'%')
                  ->orWhereHas('user', function ($uq) use ($search) {
                      $uq->where('first_name', 'like', '%'.$search.'%')
                         ->orWhere('last_name', 'like', '%'.$search.'%')
                         ->orWhere('email', 'like', '%'.$search.'%');
                  })
                  ->orWhereHas('currentClass', function ($cq) use ($search) {
                      $cq->where('section_name', 'like', '%'.$search.'%');
                  });
            })
            ->when($request->input('class_section_id'), function ($q, $sectionId) {
                $q->where('current_class_id', $sectionId);
            })
            ->orderBy('admission_number');
    }
}
