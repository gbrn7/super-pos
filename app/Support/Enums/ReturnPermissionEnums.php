<?php

namespace App\Support\Enums;

enum ReturnPermissionEnums: string
{
    case CREATE_RETURN = 'create-return';
    case READ_RETURN = 'read-return';
    case UPDATE_RETURN = 'update-return';
    case DELETE_RETURN = 'delete-return';
}
