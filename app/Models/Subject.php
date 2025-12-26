<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Subject extends Model
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

    public function grade(): BelongsTo
    {
        return $this->belongsTo(Grade::class);
    }

    public function teacherAssignments(): HasMany
    {
        return $this->hasMany(TeacherSubjectAssignment::class);
    }

    public function examResults(): HasMany
    {
        return $this->hasMany(ExamResult::class);
    }

    public function scopeFilter($query, $request)
    {
        return $query->with('grade')
            ->when($request->input('search'), function ($q, $search) {
                $q->where('subject_name', 'like', '%'.$search.'%')
                  ->orWhere('subject_code', 'like', '%'.$search.'%');
            })
            ->when($request->input('grade_id'), function ($q, $gradeId) {
                $q->where('grade_id', $gradeId);
            })
            ->orderBy('subject_name');
    }
}
