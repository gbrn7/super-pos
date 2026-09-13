export interface TransactionQueryParam {
    page: number;
    limit: number;
    keyword: string;
    field: string;
    user_id?: number | null;
    payment_method_id?: number | null;
    start_date?: string | null;
    end_date?: string | null;
    order_by: string | null;
    order: 'asc' | 'desc' | null;
}
