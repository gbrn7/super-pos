import { t } from 'i18next';
import z from 'zod';

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
    category_id: number | null;
    unit_id: number | null;
    name: string;
    barcode: string;
    is_active: boolean;
    is_unlimited: boolean;
    desc: string;
    stock: number | null;
    price: number | null;
    cost_price: number | null;
    image: File | null;
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

export const ProductSchema = z.object({
    category_id: z.number(
        t(
            'validation.product.required.category_id',
            'Kategori tidak boleh kosong',
        ),
    ),
    unit_id: z.number(
        t('validation.product.required.unit_id', 'Satuan tidak boleh kosong'),
    ),
    name: z
        .string()
        .trim()
        .min(
            1,
            t('validation.product.required.name', 'Nama tidak boleh kosong'),
        ),
    is_active: z.boolean(),
    is_unlimited: z.boolean(),
    stock: z
        .number(
            t('validation.product.required.stock', 'Stok tidak boleh kosong'),
        )
        .min(0, t('validation.product.required.min_stock', 'Minimal stok 0')),
    cost_price: z
        .number(
            t(
                'validation.product.required.cost_price',
                'Harga modal tidak boleh kosong',
            ),
        )
        .min(
            0,
            t(
                'validation.product.required.min_price',
                'Minimal harga jual Rp 0',
            ),
        ),
    price: z
        .number(
            t(
                'validation.product.required.price',
                'Harga jual tidak boleh kosong',
            ),
        )
        .min(
            0,
            t(
                'validation.product.required.min_cost_price',
                'Minimal harga jual Rp 0',
            ),
        ),
    image: z.file().nullable(),
    barcode: z.string().nullable(),
    desc: z.string().nullable(),
});
