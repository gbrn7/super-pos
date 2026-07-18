<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use DateTimeInterface;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Override;

class MasterProduct extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_name',
        'unit_name',
        'name',
        'barcode',
        'desc',
        'price',
        'cost_price',
    ];

    // format date using unix/epoch time
    protected $dateFormat = 'U';


    // overide default iso datetime format from model
    protected function serializeDate(DateTimeInterface $date): int
    {
        return $date->getTimestamp();
    }

    /**
     * Get the product that owns the MasterProduct
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'barcode', 'barcode');
    }
}
