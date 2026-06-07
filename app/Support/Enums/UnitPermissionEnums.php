<?php

namespace App\Support\Enums;

enum UnitPermissionEnums: string
{
    case CREATE_UNIT = 'create-unit';
    case READ_UNIT = 'read-unit';
    case UPDATE_UNIT = 'update-unit';
    case DELETE_UNIT = 'delete-unit';
}
