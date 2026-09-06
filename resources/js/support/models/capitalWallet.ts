export interface CapitalWalletTransaction {
    id: number;
    amount: number;
    type: 'in' | 'out';
    transaction_type:
        | 'capital_injection'
        | 'capital_drawdown'
        | 'product_purchase'
        | 'sales_capital_recovery'
        | 'sales_recovery'
        | 'sales_return_deduction'
        | 'reinvestment';
    balance_before: number;
    balance_after: number;
    notes: string;
    invoice_number: string;
    created_at: number;
    updated_at: number;
}

export interface CapitalWalletSummary {
    current_balance: number;
    total_inflow: number;
    total_outflow: number;
}
