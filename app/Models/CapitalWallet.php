<?php

namespace App\Models;

use Database\Factories\CapitalWalletFactory;
use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CapitalWallet extends Model
{
    /** @use HasFactory<CapitalWalletFactory> */
    use HasFactory;

    protected $fillable = ['balance', 'status', 'total_inflow', 'total_outflow'];

    protected $casts = [
        'balance' => 'float',
        'total_inflow' => 'float',
        'total_outflow' => 'float',
    ];

    protected $dateFormat = 'U';

    protected function serializeDate(DateTimeInterface $date): int
    {
        return $date->getTimestamp();
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(CapitalWalletTransaction::class, 'capital_wallet_id');
    }
}
