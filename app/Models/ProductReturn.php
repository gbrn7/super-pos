<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProductReturn extends Model
{
    use HasFactory;

    protected $table = 'returns';

    protected $dateFormat = 'U';

    protected function serializeDate(DateTimeInterface $date): int
    {
        return $date->getTimestamp();
    }

    protected $fillable = [
        'return_number',
        'transaction_id',
        'user_id',
        'total_refund_amount',
        'reason',
    ];

    public function transaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function details(): HasMany
    {
        return $this->hasMany(ReturnDetail::class, 'return_id');
    }
}
