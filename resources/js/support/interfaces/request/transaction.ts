export interface TransactionQueryParam {
  page: number;
  limit: number;
  keyword: string;
  field: string;
  user_id?: number | null;
  payment_method_id?: number | null;
  start_date?: string;
  end_date?: string;
  order_by: string | null;
  order: 'asc' | 'desc' | null;
}
