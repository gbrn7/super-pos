<?php

namespace App\Support\Enums;

enum CategoryPermissionEnums: string
{
  case CREATE_CATEGORY = 'create-category';
  case READ_CATEGORY = 'read-category';
  case UPDATE_CATEGORY = 'update-category';
  case DELETE_CATEGORY = 'delete-category';
}
