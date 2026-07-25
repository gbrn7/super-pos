<?php

namespace App\Support\Enums;

enum CapitalWalletPermissionEnums: string
{
    case READ_CAPITAL_WALLET = 'read-capital-wallet';
    case INJECT_CAPITAL_WALLET = 'inject-capital-wallet';
    case DRAWDOWN_CAPITAL_WALLET = 'drawdown-capital-wallet';
    case PURCHASE_PRODUCT_CAPITAL_WALLET = 'purchase-product-capital-wallet';
}
