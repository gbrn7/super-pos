<?php

namespace App\Support\Enums;

enum ProductPermissionEnums: string
{
    case CREATE_PRODUCT = 'create-product';
    case READ_PRODUCT = 'read-product';
    case UPDATE_PRODUCT = 'update-product';
    case DELETE_PRODUCT = 'delete-product';
}
