<?php

namespace App\Support\Enums;

enum PermissionEnums: string
{
  case READ_CATEGORY = 'read category';
  case CREATE_CATEGORY = 'create category';
  case EDIT_CATEGORY = 'edit category';
  case DELETE_CATEGORY = 'delete category';
}
