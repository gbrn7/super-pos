<?php

namespace App\Support\Enums;

enum TransactionPermissionEnums: string
{
    case CREATE_TRANSACTION = 'create-transaction';
    case READ_TRANSACTION = 'read-transaction';
    case UPDATE_TRANSACTION = 'update-transaction';
    case DELETE_TRANSACTION = 'delete-transaction';
}
