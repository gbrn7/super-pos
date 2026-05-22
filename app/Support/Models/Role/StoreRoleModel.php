<?php

namespace App\Support\Models\Role;

use Illuminate\Http\Request;

class StoreRoleReqModel
{
  public string $name;
  public ?string $guardName;
  public array $permissions;
  public function __construct(Request $request)
  {
    $this->name = $request->query('name');
    $this->guardName = $request->query('guardName');
    $this->permissions = $request->query('permissions');
  }
}
