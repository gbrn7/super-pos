<?php

namespace App\Support\Interfaces\Repositories;

use Illuminate\Support\Collection;

interface DashboardRepositoryInterface
{
    /**
     * Get aggregated metrics (Revenue, Profit, Transactions Count, Products Sold)
     */
    public function getMetrics(string $startDate, string $endDate): array;

    /**
     * Get sales & net profit trend dataset grouped by day
     */
    public function getTrendChart(string $startDate, string $endDate): Collection;

    /**
     * Get top products by quantity sold
     */
    public function getTopProducts(string $startDate, string $endDate, int $limit = 5): Collection;

    /**
     * Get recent transactions within date range
     */
    public function getRecentTransactions(string $startDate, string $endDate, int $limit = 10): Collection;

    /**
     * Get products with the lowest stock (where not unlimited)
     */
    public function getLowStockProducts(int $limit = 10): Collection;
}
