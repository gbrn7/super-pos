<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Model;

class PaymentMethod extends Model
{
    protected $fillable = [
        "name",
        "desc",
        "image",
    ];

    //format date using unix/epoch time
    protected $dateFormat = 'U';

    //overide default iso datetime format from model
    protected function serializeDate(DateTimeInterface $date): int
    {
        return $date->getTimestamp();
    }
}
