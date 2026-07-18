<?php

namespace App\Support\Enums;

enum TransactionDetailPermissionEnums: string
{
    case CREATE_TRANSACTION_DETAIL = 'create-transaction-detail';
    case READ_TRANSACTION_DETAIL = 'read-transaction-detail';
    case UPDATE_TRANSACTION_DETAIL = 'update-transaction-detail';
    case DELETE_TRANSACTION_DETAIL = 'delete-transaction-detail';
}
