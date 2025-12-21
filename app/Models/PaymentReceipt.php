<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentReceipt extends Model
{
    use HasFactory;

    protected $primaryKey = 'receipt_id';
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

    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class, 'payment_id', 'payment_id');
    }

    public function generatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'generated_by');
    }

    public function scopeFilter($query, $request)
    {
        $search = $request->input('search');
        return $query->when($search !== '', function ($q) use ($search, $request) {
            $q->where('receipt_number', 'like', '%' . $search . '%')
                ->orWhereHas('payment', function ($pq) use ($search) {
                    $pq->where('transaction_reference', 'like', '%' . $search . '%');
                })
                ->orWhereHas('payment.student.user', function ($uq) use ($search) {
                    $uq->where('first_name', 'like', '%' . $search . '%')
                        ->orWhere('last_name', 'like', '%' . $search . '%')
                        ->orWhere('email', 'like', '%' . $search . '%');
                })
                ->when($request->input('min_amount'), function ($q, $min) {
                    $q->where('amount_paid', '>=', $min);
                })
                ->when($request->input('max_amount'), function ($q, $max) {
                    $q->where('amount_paid', '<=', $max);
                })
                ->when($request->input('academic_year_id'), function ($q, $yearId) {
                    $q->whereHas('bill', function ($bq) use ($yearId) {
                        $bq->where('academic_year_id', $yearId);
                    });
                })
                ->when($request->input('date_from'), function ($q, $date) {
                    $q->whereDate('issued_at', '>=', $date);
                })
                ->when($request->input('date_to'), function ($q, $date) {
                    $q->whereDate('issued_at', '<=', $date);
                });
        });
    }
}
