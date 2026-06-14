<?php

namespace App\Support\Utils;

use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Pagination\LengthAwarePaginator;

class PaginationResource
{
  public static function make(
    AnonymousResourceCollection $items,
    LengthAwarePaginator  $paginationData,
  ): array {

    $data = [
      "items" => $items,
      'pagination' => [
        'current_page' => $paginationData->currentPage(),
        'last_page' => $paginationData->lastPage(),
        'per_page' => $paginationData->perPage(),
        'total' => $paginationData->total(),
        'from' => $paginationData->firstItem(),
        'to' => $paginationData->lastItem(),
        'links' => $paginationData->linkCollection(),
        'previous_page_url' => $paginationData->previousPageUrl(),
        'next_page_url' => $paginationData->nextPageUrl(),
      ],
    ];

    return $data;
  }
}
