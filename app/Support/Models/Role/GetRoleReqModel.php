<?php

namespace App\Support\Models\Role;

use Illuminate\Http\Request;

class GetRoleReqModel
{
  public ?string $name;
  public ?int $page;
  public ?int $limit;
  public function __construct(Request $request)
  {
    $this->name = $request->query('name');
    $this->page = $request->query('page');
    $this->limit = $request->query('limit');
  }
}
