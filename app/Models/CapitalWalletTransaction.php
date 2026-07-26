<?php

namespace App\Models;

use Database\Factories\CapitalWalletTransactionFactory;
use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class CapitalWalletTransaction extends Model
{
    /** @use HasFactory<CapitalWalletTransactionFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'capital_wallet_id',
        'amount',
        'type',
        'transaction_type',
        'reference_id',
        'reference_type',
        'balance_before',
        'balance_after',
        'notes',
    ];

    protected $dateFormat = 'U';

    protected function serializeDate(DateTimeInterface $date): int
    {
        return $date->getTimestamp();
    }

    public function wallet(): BelongsTo
    {
        return $this->belongsTo(CapitalWallet::class, 'capital_wallet_id');
    }

    public function reference(): MorphTo
    {
        return $this->morphTo();
    }
}
