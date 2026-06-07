<?php

namespace App\Models;

use Database\Factories\CategoryFactory;
use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    /** @use HasFactory<CategoryFactory> */
    use HasFactory;

    // format date using unix/epoch time
    protected $dateFormat = 'U';

    protected $fillable = [
        'name',
        'desc',
    ];

    public function products()
    {
        return $this->hasMany(Product::class);
    }

    // overide default iso datetime format from model
    protected function serializeDate(DateTimeInterface $date): int
    {
        return $date->getTimestamp();
    }
}
