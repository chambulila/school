<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TeacherSubjectAssignment extends Model
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

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class);
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    public function classSection(): BelongsTo
    {
        return $this->belongsTo(ClassSection::class);
    }

    public function scopeFilter($query, $request)
    {
        return $query->with(['teacher.user', 'subject', 'classSection.grade'])
            ->when($request->input('search'), function ($q, $search) {
                $q->whereHas('teacher.user', function ($uq) use ($search) {
                    $uq->where('first_name', 'like', '%'.$search.'%')
                       ->orWhere('last_name', 'like', '%'.$search.'%');
                })
                ->orWhereHas('subject', function ($sq) use ($search) {
                    $sq->where('subject_name', 'like', '%'.$search.'%')
                       ->orWhere('subject_code', 'like', '%'.$search.'%');
                })
                ->orWhereHas('classSection', function ($cq) use ($search) {
                    $cq->where('section_name', 'like', '%'.$search.'%');
                });
            })
            ->when($request->input('teacher_id'), function ($q, $teacherId) {
                $q->where('teacher_id', $teacherId);
            })
            ->when($request->input('subject_id'), function ($q, $subjectId) {
                $q->where('subject_id', $subjectId);
            })
            ->when($request->input('class_section_id'), function ($q, $sectionId) {
                $q->where('class_section_id', $sectionId);
            })
            ->orderBy('created_at', 'desc');
    }
}
