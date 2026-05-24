<?php

namespace App\Support\Enums;

enum RolePermissionEnums: string
{
  case CREATE_ROLE = 'create-role';
  case READ_ROLE = 'read-role';
  case UPDATE_ROLE = 'update-role';
  case DELETE_ROLE = 'delete-role';
}
