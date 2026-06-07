<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'category_id',
        'unit_id',
        'sku',
        'name',
        'is_active',
        'stock',
        'image',
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

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}
