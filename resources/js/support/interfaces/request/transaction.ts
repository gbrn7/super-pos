export interface TransactionQueryParam {
  page: number;
  limit: number;
  keyword: string;
  field: string;
  start_date?: string;
  end_date?: string;
  order_by: string | null;
  order: 'asc' | 'desc' | null;
}
