<?php

namespace App\Support\Enums;

enum ProfitWalletPermissionEnums: string
{
    case READ_PROFIT_WALLET = 'read-profit-wallet';
    case DISBURSE_PROFIT_WALLET = 'disburse-profit-wallet';
    case WITHDRAW_CAPITAL_PROFIT_WALLET = 'withdraw-capital-profit-wallet';
}
