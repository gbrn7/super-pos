<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class MasterProduct extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'category_name',
        'unit_name',
        'name',
        'barcode',
        'desc',
        'price',
        'cost_price',
    ];

    /**
     * Get the product that owns the MasterProduct
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'barcode', 'barcode');
    }
}
