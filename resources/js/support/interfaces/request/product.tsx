export interface ProductForm {
  category_id: number;
  unit_id: number;
  name: string;
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
  is_active: string;
  is_unlimited: string;
  stock: string;
  price: string;
  cost_price: string;
  desc: string;
  image: string;
}