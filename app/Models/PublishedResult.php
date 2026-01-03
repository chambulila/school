<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PublishedResult extends Model
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

    public function exam(): BelongsTo
    {
        return $this->belongsTo(Exam::class);
    }

    public function classSection(): BelongsTo
    {
        return $this->belongsTo(ClassSection::class);
    }

    public function publishedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'published_by');
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    public function scopeFilter($query, $request)
    {
        $query->when($request->search ?? null, function ($query, $search) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('exam', function ($eq) use ($search) {
                    $eq->where('exam_name', 'like', '%' . $search . '%')
                        ->orWhere('term_name', 'like', '%' . $search . '%');
                })
                ->orWhereHas('classSection', function ($cq) use ($search) {
                    $cq->where('section_name', 'like', '%' . $search . '%');
                });
            });
        });
    }

    public static function isPublished(string $examId, string $classSectionId, ?string $subjectId = null): bool
    {
        return static::query()
            ->where('exam_id', $examId)
            ->where('class_section_id', $classSectionId)
            ->where(function ($q) use ($subjectId) {
                $q->whereNull('subject_id');
                if ($subjectId) {
                    $q->orWhere('subject_id', $subjectId);
                }
            })
            ->exists();
    }

    public static function publishedSectionIdsForExam(string $examId): array
    {
        return static::query()
            ->where('exam_id', $examId)
            ->distinct()
            ->pluck('class_section_id')
            ->filter()
            ->values()
            ->toArray();
    }
}
