<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphOne;

class Transaction extends Model
{
    use HasFactory;

    protected $table = 'transactions';

    protected $fillable = [
        'user_id',
        'payment_method_id',
        'invoice_number',
        'total_amount',
        'payment_amount',
        'change_amount',
        'discount_amount',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function paymentMethod()
    {
        return $this->belongsTo(PaymentMethod::class);
    }

    public function transactionDetails()
    {
        return $this->hasMany(TransactionDetail::class);
    }

    public function cashProfit(): HasOne
    {
        return $this->hasOne(CashProfit::class);
    }

    public function profitWalletTransaction(): MorphOne
    {
        return $this->morphOne(ProfitWalletTransaction::class, 'reference');
    }
}
