<?php

namespace App\Support\Enums;

enum RoleEnums: string
{
  case SUPER_ADMIN = 'Super Admin';
  case ADMIN = 'Admin';
  case USER = 'User';
}
