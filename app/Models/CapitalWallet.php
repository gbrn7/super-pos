<?php

namespace App\Models;

use Database\Factories\CapitalWalletFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class CapitalWallet extends Model
{
    /** @use HasFactory<CapitalWalletFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = ['balance', 'status', 'total_inflow', 'total_outflow'];

    protected $casts = [
        'balance' => 'float',
        'total_inflow' => 'float',
        'total_outflow' => 'float',
    ];

    public function transactions(): HasMany
    {
        return $this->hasMany(CapitalWalletTransaction::class, 'capital_wallet_id');
    }
}
