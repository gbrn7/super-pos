export interface TransactionQueryParam {
    page: number;
    limit: number;
    keyword: string;
    field: string;
    user_id?: number | null;
    payment_method_id?: number | null;
    start_date?: number | null;
    end_date?: number | null;
    order_by: string | null;
    order: 'asc' | 'desc' | null;
}
