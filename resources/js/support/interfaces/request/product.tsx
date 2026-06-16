export interface ProductQueryParam {
  field: string;
  keyword: string;
  category_id: number | null;
  barcode: string | null;
  unit_id: number | null;
  is_active: number | null;
  is_unlimited: number | null;
  is_stock_available: number | null;
  page: number;
  limit: number;
  order_by: string | null;
  order: string | null;
}

export interface ProductForm {
  category_id: number;
  unit_id: number;
  name: string;
  barcode: string;
  is_active: boolean;
  is_unlimited: boolean;
  desc: string;
  stock: number;
  price: number;
  cost_price: number;
  image: string;
}

export interface ProductErrorForm {
  category_id: string;
  unit_id: string;
  name: string;
  barcode: string;
  is_active: string;
  is_unlimited: string;
  stock: string;
  price: string;
  cost_price: string;
  desc: string;
  image: string;
}