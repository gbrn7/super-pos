export interface Product {
  id: number;
  name: string;
  sku: string;
  category_id: number;
  category_name: string;
  unit_id: number;
  unit_name: string;
  stock: number;
  price: number;
  cost_price: number;
  image: string;
  is_active: boolean;
  is_unlimited: boolean;
  desc: string;
  created_at: number;
  updated_at: number;
}