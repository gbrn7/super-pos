<?php

namespace App\Support\Enums;

enum MasterProductPermissionEnums: string
{
    case CREATE_MASTER_PRODUCT = 'create-master-product';
    case READ_MASTER_PRODUCT = 'read-master-product';
    case UPDATE_MASTER_PRODUCT = 'update-master-product';
    case DELETE_MASTER_PRODUCT = 'delete-master-product';
}
