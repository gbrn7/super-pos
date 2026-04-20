<?php

namespace App\Support\Model\Request;

use Illuminate\Http\Request;

class GetCategoryReqModel
{
  public string|null $name;
  public function __construct(Request $request)
  {
    $this->name = $request->query('name');
  }
}
