<?php

namespace App\Models;

use Database\Factories\ProfitWalletFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProfitWallet extends Model
{
    /** @use HasFactory<ProfitWalletFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = ['balance', 'status', 'total_inflow', 'total_outflow'];

    protected $casts = [
        'balance' => 'float',
        'total_inflow' => 'float',
        'total_outflow' => 'float',
    ];

    public function transactions(): HasMany
    {
        return $this->hasMany(ProfitWalletTransaction::class, 'profit_wallet_id');
    }
}
