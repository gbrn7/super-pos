import { CapitalWalletTransactionTypeEnums } from '@/support/enums/CapitalWalletTransactionTypeEnums';

export interface CapitalWalletTransaction {
    id: number;
    amount: number;
    type: 'in' | 'out';
    transaction_type:
        | CapitalWalletTransactionTypeEnums
        | `${CapitalWalletTransactionTypeEnums}`
        | 'sales_recovery';
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
