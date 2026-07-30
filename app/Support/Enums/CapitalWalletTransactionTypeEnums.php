<?php

namespace App\Support\Enums;

enum CapitalWalletTransactionTypeEnums: string
{
    case SALES_CAPITAL_RECOVERY = 'sales_capital_recovery';
    case REINVESTMENT = 'reinvestment';
    case CAPITAL_INJECTION = 'capital_injection';
    case CAPITAL_DRAWDOWN = 'capital_drawdown';
    case PRODUCT_PURCHASE = 'product_purchase';
    case SALES_RETURN_DEDUCTION = 'sales_return_deduction';
}
