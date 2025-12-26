<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FeeNotification extends Model
{
    use HasFactory;

    protected $primaryKey = 'fee_notification_id';
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

    public function bill(): BelongsTo
    {
        return $this->belongsTo(StudentBilling::class, 'bill_id', 'bill_id');
    }

    public function scopeFilter($query, $request)
    {
        return $query->with(['student.user', 'bill.academicYear'])
            ->when($request->input('search'), function ($q, $search) {
                $q->where('message', 'like', '%'.$search.'%')
                    ->orWhereHas('student.user', function ($uq) use ($search) {
                        $uq->where('first_name', 'like', '%'.$search.'%')
                            ->orWhere('last_name', 'like', '%'.$search.'%')
                            ->orWhere('email', 'like', '%'.$search.'%');
                    });
            })
            ->orderBy('sent_at', 'desc')
            ->orderBy('created_at', 'desc');
    }
}
