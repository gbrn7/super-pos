export interface MasterProduct {
  id: number;
  name: string;
  barcode: string;
  category_name: string;
  unit_name: string;
  price: number;
  isAdded: boolean;
  cost_price: number;
  desc: string;
  created_at: number;
  updated_at: number;
}