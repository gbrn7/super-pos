<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TransactionProfit extends Model
{
    use HasFactory;

    protected $table = 'transaction_profits';

    protected $fillable = [
        'transaction_id',
        'total_revenue',
        'total_cost',
        'profit',
    ];

    public function transaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class);
    }
}
