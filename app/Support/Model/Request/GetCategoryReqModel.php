<?php

namespace App\Support\Model\Request;

use Illuminate\Http\Request;

class GetCategoryReqModel
{
  public string|null $name;
  public int|null $page;
  public int $limit;
  public function __construct(Request $request)
  {
    $this->name = $request->query('name');
    $this->page = $request->query('page');
    $this->limit = $request->query('limit') ?? 10;
  }
}
