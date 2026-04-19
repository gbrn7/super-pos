<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    protected $table = 'transactions';
    protected $fillable = [
        "user_id",
        "payment_method_name",
        "total_amount",
        "payment_amount",
        "change_amount",
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function transactionDetails()
    {
        return $this->hasMany(TransactionDetail::class);
    }
}
