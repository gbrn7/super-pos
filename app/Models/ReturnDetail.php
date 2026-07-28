<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReturnDetail extends Model
{
    use HasFactory;

    protected $dateFormat = 'U';

    protected function serializeDate(DateTimeInterface $date): int
    {
        return $date->getTimestamp();
    }

    protected $fillable = [
        'return_id',
        'product_id',
        'quantity',
        'price_per_unit',
        'subtotal',
    ];

    public function productReturn(): BelongsTo
    {
        return $this->belongsTo(ProductReturn::class, 'return_id');
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
