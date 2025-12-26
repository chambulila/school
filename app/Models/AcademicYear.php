<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AcademicYear extends Model
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

    public function enrollments(): HasMany
    {
        return $this->hasMany(StudentEnrollment::class);
    }

    public function exams(): HasMany
    {
        return $this->hasMany(Exam::class);
    }

    public function feeStructures(): HasMany
    {
        return $this->hasMany(FeeStructure::class);
    }

    public function bills(): HasMany
    {
        return $this->hasMany(StudentBilling::class);
    }

    public function scopeFilter($query, $request)
    {
        return $query->when($request->input('search'), function ($q, $search) {
                $q->where('year_name', 'like', '%'.$search.'%');
            })
            ->when($request->input('is_active'), function ($q, $isActive) {
                 if ($isActive === 'active') {
                     $q->where('is_active', true);
                 } elseif ($isActive === 'inactive') {
                     $q->where('is_active', false);
                 }
            })
            ->orderBy('year_name');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
    public function scopeInactive($query)
    {
        return $query->where('is_active', false);
    }
}
