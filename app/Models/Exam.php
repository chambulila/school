<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Exam extends Model
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

    public function academicYear(): BelongsTo
    {
        return $this->belongsTo(AcademicYear::class);
    }

    public function results(): HasMany
    {
        return $this->hasMany(ExamResult::class);
    }

    public function publishedResults(): HasMany
    {
        return $this->hasMany(PublishedResult::class);
    }

    public function scopeFilter($query, $request)
    {
        return $query->with('academicYear')
            ->when($request->input('search'), function ($q, $search) {
                $q->where('exam_name', 'like', '%'.$search.'%')
                  ->orWhere('term_name', 'like', '%'.$search.'%');
            })
            ->when($request->input('academic_year_id'), function ($q, $yearId) {
                $q->where('academic_year_id', $yearId);
            })
            ->orderBy('start_date', 'desc');
    }
}
