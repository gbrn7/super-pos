<?php

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;

uses(RefreshDatabase::class);

test('profit_wallets and profit_wallet_transactions tables have correct schema', function () {
    expect(Schema::hasTable('profit_wallets'))->toBeTrue();
    expect(Schema::hasColumns('profit_wallets', ['id', 'balance', 'status', 'created_at', 'updated_at']))->toBeTrue();

    expect(Schema::hasTable('profit_wallet_transactions'))->toBeTrue();
    expect(Schema::hasColumns('profit_wallet_transactions', [
        'id', 'profit_wallet_id', 'amount', 'type', 'transaction_type',
        'reference_type', 'reference_id', 'balance_before', 'balance_after', 'notes', 'created_at', 'updated_at',
    ]))->toBeTrue();
});
