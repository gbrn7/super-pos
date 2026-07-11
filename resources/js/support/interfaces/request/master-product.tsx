import { t } from "i18next";
import z from "zod";

export interface MasterProductQueryParam {
  field: string;
  keyword: string;
  category_name: string | null;
  barcode: string | null;
  unit_name: string | null;
  page: number;
  limit: number;
  order_by: string | null;
  order: string | null;
}

export interface MasterProductForm {
  category_name: string;
  unit_name: string;
  name: string;
  barcode: string;
  desc: string;
  price: number | null;
  cost_price: number | null;
}

export interface MasterProductErrorForm {
  category_name: string;
  unit_name: string;
  name: string;
  barcode: string;
  price: string;
  cost_price: string;
  desc: string;
}

export const MasterProductSchema = z.object({
  category_name: z.string().nullable(),
  unit_name: z.string().nullable(),
  name: z.string().trim().min(1, t("validation.master_product.required.name", "Nama tidak boleh kosong")),
  barcode: z.string().nullable(),
  desc: z.string().nullable(),
  price: z.number().min(0, t("validation.master_product.required.min_cost_price", "Minimal harga jual Rp 0")).nullable(),
  cost_price: z.number().min(0, t("validation.master_product.required.min_price", "Minimal harga jual Rp 0")).nullable(),
});

