<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'password',
        'phone',
        'gender',
        'date_of_birth',
        'address',
        'guardian_name',
        'guardian_phone',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (! $model->getKey()) {
                $model->{$model->getKeyName()} = (string) \Illuminate\Support\Str::uuid();
            }
        });
    }

    protected $appends = ['name'];

    public function getNameAttribute(): string
    {
        $first = trim((string) ($this->attributes['first_name'] ?? ''));
        $last = trim((string) ($this->attributes['last_name'] ?? ''));
        return trim($first . ' ' . $last);
    }

    public function userRoles(): HasMany
    {
        return $this->hasMany(UserRole::class);
    }

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'user_roles', 'user_id', 'role_id')
            ->using(\App\Models\Pivots\UserRolePivot::class)
            ->withTimestamps();
    }

    public function student(): HasOne
    {
        return $this->hasOne(Student::class);
    }

    public function teacher(): HasOne
    {
        return $this->hasOne(Teacher::class);
    }

    public function paymentsReceived(): HasMany
    {
        return $this->hasMany(Payment::class, 'received_by');
    }

    public function publishedResults(): HasMany
    {
        return $this->hasMany(PublishedResult::class, 'published_by');
    }

    public function paymentReceiptsGenerated(): HasMany
    {
        return $this->hasMany(PaymentReceipt::class, 'generated_by');
    }

    public function getAllPermissions()
    {
        return $this->roles()->with('permissions')->get()->pluck('permissions')->flatten();
    }

    public function hasRole($roles): bool
    {
        if (is_string($roles)) {
            $roles = [$roles];
        }

        return $this->roles()->whereIn('role_name', $roles)->exists();
    }

    public function hasPermission(string $permission): bool
    {
        return $this->roles()->whereHas('permissions', function ($q) use ($permission) {
            $q->where('slug', $permission);
        })->exists();
    }

    public function scopeFilter($query, $request)
    {
        return $query->with('roles')
            ->when($request->input('search'), function ($q, $search) {
                $q->where(function ($sub) use ($search) {
                    $sub->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%");
                });
            })
            ->when($request->input('role_id'), function ($q, $roleId) {
                $q->whereHas('roles', function ($rq) use ($roleId) {
                    $rq->where('roles.id', $roleId); // Specify table name to avoid ambiguity
                });
            })
            ->orderBy('first_name')
            ->orderBy('last_name');
    }
}
