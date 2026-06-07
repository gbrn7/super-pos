<?php

namespace App\Support\Enums;

enum PaymentMethodPermissionEnums: string
{
    case CREATE_PAYMENT_METHOD = 'create-payment-method';
    case READ_PAYMENT_METHOD = 'read-payment-method';
    case UPDATE_PAYMENT_METHOD = 'update-payment-method';
    case DELETE_PAYMENT_METHOD = 'delete-payment-method';
}
