export interface PaymentMethod {
  id: number;
  name: string;
  desc: string | null;
  image: string | null;
  created_at: number;
  updated_at: number;
}