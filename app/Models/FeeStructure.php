<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FeeStructure extends Model
{
    use HasFactory;

    protected $primaryKey = 'fee_structure_id';
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

    public function grade(): BelongsTo
    {
        return $this->belongsTo(Grade::class);
    }

    public function feeCategory(): BelongsTo
    {
        return $this->belongsTo(FeeCategory::class, 'fee_category_id', 'fee_category_id');
    }

    public function scopeFilter($query, array $filters)
    {
        $query->when($filters['search'] ?? null, function ($query, $search) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('feeCategory', function ($cq) use ($search) {
                    $cq->where('category_name', 'like', '%' . $search . '%');
                })
                ->orWhereHas('grade', function ($gq) use ($search) {
                    $gq->where('grade_name', 'like', '%' . $search . '%');
                })
                ->orWhereHas('academicYear', function ($yq) use ($search) {
                    $yq->where('year_name', 'like', '%' . $search . '%');
                });
            });
        });
    }
}
