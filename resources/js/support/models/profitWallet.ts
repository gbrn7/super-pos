export interface ProfitWalletTransaction {
    id: number;
    amount: number;
    type: 'in' | 'out';
    transaction_type: 'sales_profit' | 'disbursement' | 'capital_withdrawal';
    balance_before: number;
    balance_after: number;
    notes: string;
    invoice_number: string;
    created_at: number;
    updated_at: number;
}

export interface ProfitWalletSummary {
    current_balance: number;
    total_inflow: number;
    total_outflow: number;
}
