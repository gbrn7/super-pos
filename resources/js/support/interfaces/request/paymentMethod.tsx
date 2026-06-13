export interface PaymentMethodForm {
  name: string;
  desc: string;
  image: File | null;
}

export interface PaymentMethodErrorForm {
  name: string;
  desc: string;
  image: string;
}