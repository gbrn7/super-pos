export interface TransactionDetail {
  id: number;
  transaction_id: number;
  product_id: number;
  product_name?: string;
  unit_name: string;
  quantity: number;
  cost_price: number;
  price: number;
  subtotal: number;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: number;
  user_id: number;
  user_name?: string;
  payment_method_id: number;
  payment_method_name?: string;
  invoice_number: string;
  total_amount: number;
  payment_amount: number;
  change_amount: number;
  details?: TransactionDetail[];
  created_at: string;
  updated_at: string;
}
