<?php

namespace App\Support\Utils;

class FormatIdrMoney
{
    public static function format(mixed $amount): string
    {
        if ($amount === null || $amount === '') {
            return 'Rp 0';
        }

        $numericAmount = is_numeric($amount) ? (float) $amount : (float) str_replace([',', '.'], '', (string) $amount);

        return 'Rp '.number_format($numericAmount, 0, ',', '.');
    }
}
