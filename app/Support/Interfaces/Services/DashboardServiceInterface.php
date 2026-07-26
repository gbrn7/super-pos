<?php

namespace App\Support\Interfaces\Services;

interface DashboardServiceInterface
{
    /**
     * Get dashboard panel details including metrics, top products, trend chart, and recent transactions.
     */
    public function getDashboardData(?string $startDate = null, ?string $endDate = null): array;
}
