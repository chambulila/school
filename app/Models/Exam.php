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
        $query->when($request->search ?? null, function ($query, $search) {
            $query->where(function ($q) use ($search) {
                $q->where('exam_name', 'like', '%' . $search . '%')
                    ->orWhere('term_name', 'like', '%' . $search . '%')
                    ->orWhereHas('academicYear', function ($yq) use ($search) {
                        $yq->where('year_name', 'like', '%' . $search . '%');
                    });
            });
        });
    }
}
