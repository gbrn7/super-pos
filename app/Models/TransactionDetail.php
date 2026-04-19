<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TransactionDetail extends Model
{
    protected $table = 'transaction_detail';
    protected $fillable = [
        "transaction_id",
        "product_id",
        "unit_name",
        "quantity",
        "price",
        "cost_price",
    ];

    public function transaction()
    {
        return $this->belongsTo(Transaction::class);
    }
}
