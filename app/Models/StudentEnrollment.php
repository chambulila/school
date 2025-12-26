<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentEnrollment extends Model
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

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function classSection(): BelongsTo
    {
        return $this->belongsTo(ClassSection::class);
    }

    public function academicYear(): BelongsTo
    {
        return $this->belongsTo(AcademicYear::class);
    }

    public function scopeFilter($query, $request)
    {
        return $query->with(['student.user', 'classSection.grade', 'academicYear'])
            ->when($request->input('search'), function ($q, $search) {
                $q->whereHas('student', function ($sq) use ($search) {
                    $sq->where('admission_number', 'like', '%'.$search.'%')
                        ->orWhereHas('user', function ($uq) use ($search) {
                            $uq->where('first_name', 'like', '%'.$search.'%')
                               ->orWhere('last_name', 'like', '%'.$search.'%')
                               ->orWhere('email', 'like', '%'.$search.'%');
                        });
                })
                ->orWhereHas('classSection', function ($cq) use ($search) {
                    $cq->where('section_name', 'like', '%'.$search.'%');
                })
                ->orWhereHas('academicYear', function ($yq) use ($search) {
                    $yq->where('year_name', 'like', '%'.$search.'%');
                });
            })
            ->when($request->input('academic_year_id'), function ($q, $yearId) {
                $q->where('academic_year_id', $yearId);
            })
            ->when($request->input('class_section_id'), function ($q, $sectionId) {
                $q->where('class_section_id', $sectionId);
            })
            ->when($request->input('student_id'), function ($q, $studentId) {
                $q->where('student_id', $studentId);
            })
            ->orderBy('created_at', 'desc');
    }
}
