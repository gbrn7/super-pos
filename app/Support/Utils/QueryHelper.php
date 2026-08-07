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
        return DB::driverName() === 'pgsql' ? 'ilike' : 'like';
    }
}
