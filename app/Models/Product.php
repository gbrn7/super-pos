<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        "category_id",
        "unit_id",
        "name",
        "is_active",
        "stock",
        "image",
        "price",
        "cost_price",
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}
