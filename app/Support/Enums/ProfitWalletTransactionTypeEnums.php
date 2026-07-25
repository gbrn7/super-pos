<?php

namespace App\Support\Enums;

enum ProfitWalletTransactionTypeEnums: string
{
    case SALES_PROFIT = 'sales_profit';
    case DISBURSEMENT = 'disbursement';
    case CAPITAL_WITHDRAWAL = 'capital_withdrawal';
}
