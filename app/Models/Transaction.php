<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Transaction extends Model
{
    use HasFactory, SoftDeletes;

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

    // format date using unix/epoch time
    protected $dateFormat = 'U';

    // overide default iso datetime format from model
    protected function serializeDate(DateTimeInterface $date): int
    {
        return $date->getTimestamp();
    }

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

    public function profitWalletTransaction(): MorphOne
    {
        return $this->morphOne(ProfitWalletTransaction::class, 'reference');
    }

    public function returns()
    {
        return $this->hasMany(ReturnModel::class);
    }
}
