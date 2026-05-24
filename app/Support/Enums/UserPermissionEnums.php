<?php

namespace App\Support\Enums;

enum UserPermissionEnums: string
{
  case CREATE_USER = 'create-user';
  case READ_USER = 'read-user';
  case UPDATE_USER = 'update-user';
  case DELETE_USER = 'delete-user';
}
