<?php

namespace App\Support\Utils;

use Illuminate\Support\Facades\DB;

class QueryHelper
{
    /**
     * Return operator LIKE or ILIKE based on database driver.
     * PostgreSQL uses 'ilike' for case-insensitive search,
     * while SQLite/MySQL use 'like'.
     */
    public static function likeOperator(): string
    {
        return DB::getDriverName() === 'pgsql' ? 'ilike' : 'like';
    }

    /**
     * Return SQL expression to format date column as 'YYYY-MM-DD' based on database driver.
     */
    public static function dateFormatExpression(string $column): string
    {
        $driver = DB::getDriverName();

        return match ($driver) {
            'sqlite' => "strftime('%Y-%m-%d', {$column})",
            'mysql', 'mariadb' => "DATE_FORMAT({$column}, '%Y-%m-%d')",
            default => "to_char({$column}, 'YYYY-MM-DD')", // pgsql & default
        };
    }
}
