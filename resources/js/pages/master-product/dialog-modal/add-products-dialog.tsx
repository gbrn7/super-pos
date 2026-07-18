import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldGroup } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { store as storeProduct } from '@/routes/apiProducts';
import { type ProductForm, type ProductErrorForm, ProductSchema } from '@/support/interfaces/request/product';
import { useTranslation } from 'react-i18next';
import { Spinner } from '@/components/ui/spinner';
import axiosInstance from '@/lib/axios';
import { ResponseApi } from '@/support/interfaces/response/Response';
import { Product } from '@/support/models/product';
import { handleApiError, showSuccessToast, showWarningToast } from '@/lib/utils';
import ErrorFormInfo from '@/components/errorFormInfo';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Unit } from '@/support/models/unit';
import { Category } from '@/support/models/category';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { NumericFormat } from "react-number-format";
import { MasterProduct } from '@/support/models/masterProduct';

interface AddProductsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  masterProduct: MasterProduct | null;
  onSuccess: () => void;
  units: Unit[];
  categories: Category[];
}

export function AddProductsDialog({ open, onOpenChange, masterProduct, onSuccess, units, categories }: AddProductsDialogProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState<boolean>(false);
  const [imagePreview, setImagePreview] = useState<string>('');

  const defaultFormData: ProductForm = {
    category_id: null,
    unit_id: null,
    name: '',
    is_active: true,
    is_unlimited: false,
    stock: '' as any,
    price: null,
    cost_price: null,
    image: null,
    desc: '',
    barcode: ''
  }

  const defaultErrorForm: ProductErrorForm = {
    category_id: '',
    unit_id: '',
    name: '',
    is_active: '',
    is_unlimited: '',
    stock: '',
    price: '',
    cost_price: '',
    image: '',
    desc: '',
    barcode: ''
  }

  const [formData, setFormData] = useState<ProductForm>(defaultFormData);
  const [errorForm, setErrorForm] = useState<ProductErrorForm>(defaultErrorForm);

  const categoryOptions = useMemo(() =>
    categories.map((category) => ({
      label: category.name,
      value: category.id.toString(),
    })),
    [categories]
  );

  const unitOptions = useMemo(() =>
    units.map((unit) => ({
      label: unit.name,
      value: unit.id.toString(),
    })),
    [units]
  );


  useEffect(() => {
    if (masterProduct && open) {
      setFormData(prev => ({
        ...prev,
        name: masterProduct.name,
        barcode: masterProduct.barcode,
        price: masterProduct.price != null && Number(masterProduct.price) !== 0 ? Number(masterProduct.price) : null,
        cost_price: masterProduct.cost_price != null && Number(masterProduct.cost_price) !== 0 ? Number(masterProduct.cost_price) : null,
        desc: masterProduct.desc,
      }));
    }
  }, [masterProduct, open]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrorForm({
      ...errorForm,
      [name]: '',
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value ? Number(value) : null,
    }));

    setErrorForm({
      ...errorForm,
      [name]: '',
    });
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));

    setErrorForm({
      ...errorForm,
      [name]: '',
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFormData(
        (prev) => ({
          ...prev,
          image: file
        })
      );
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const resultValidation = ProductSchema.safeParse(formData);

    if (!resultValidation.success) {
      const fieldErrors: ProductErrorForm = defaultErrorForm;

      resultValidation.error.issues.forEach((error) => {
        const fieldName = error.path[0] as keyof ProductForm;
        fieldErrors[fieldName] = error.message;
      });

      setErrorForm(fieldErrors);
      return;
    }

    try {
      setLoading(true);

      const res = await axiosInstance.post<ResponseApi<Product>>(
        storeProduct().url,
        {
          category_id: formData.category_id,
          unit_id: formData.unit_id,
          name: formData.name,
          is_active: formData.is_active ? "1" : "0",
          is_unlimited: formData.is_unlimited ? "1" : "0",
          stock: formData.stock,
          price: formData.price,
          cost_price: formData.cost_price,
          image: formData.image,
          desc: formData.desc,
          barcode: formData.barcode
        },
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (!res.data.success) {
        showWarningToast(res.data.message);
        return;
      }

      showSuccessToast(res.data.message);
      setFormData(defaultFormData);
      setImagePreview('');
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Error creating product:', error);
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>
              {t("page.master_product.dialog_modal.add_products_dialog.dialog_title", "Tambah Produk")}
            </DialogTitle>
            <DialogDescription>
              {t("page.master_product.dialog_modal.add_products_dialog.dialog_desc", "Buat produk baru dari master produk")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 bg-muted p-4 rounded-lg">
            <h3 className="font-semibold text-sm">
              {t("page.master_product.dialog_modal.add_products_dialog.master_product_info", "Informasi Master Produk")}
            </h3>
            <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field>
                <label htmlFor="name" className="text-sm">
                  {t("page.master_product.dialog_modal.add_products_dialog.name_label", "Nama")}
                </label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  disabled
                  className="bg-background"
                />
              </Field>
              <Field>
                <label htmlFor="barcode" className="text-sm">
                  {t("page.master_product.dialog_modal.add_products_dialog.barcode_label", "Barcode")}
                </label>
                <Input
                  id="barcode"
                  name="barcode"
                  value={formData.barcode}
                  disabled
                  className="bg-background"
                />
              </Field>
            </FieldGroup>
          </div>

          {/* Editable Fields */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">
              {t("page.master_product.dialog_modal.add_products_dialog.product_details", "Detail Produk")}
            </h3>
            <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field>
                <label htmlFor="category_id" className="text-sm">
                  {t("page.master_product.dialog_modal.add_products_dialog.category_label", "Kategori")}
                  <span className="text-red-500"> *</span>
                </label>
                <SearchableSelect
                  options={categoryOptions}
                  value={formData.category_id?.toString() ?? ''}
                  onValueChange={(value) => handleSelectChange('category_id', value)}
                  placeholder={t("page.master_product.dialog_modal.add_products_dialog.category_placeholder", "Pilih kategori")}
                  searchPlaceholder={t("page.master_product.dialog_modal.add_products_dialog.search_category_placeholder", "Cari kategori...")}
                  emptyMessage={t("page.master_product.dialog_modal.add_products_dialog.no_categories_found", "Kategori tidak ditemukan.")}
                  disabled={loading}
                  className={`${errorForm.category_id && 'border-red-500'}`}
                />
                {errorForm.category_id && (
                  <ErrorFormInfo message={errorForm.category_id} />
                )}
              </Field>

              <Field>
                <label htmlFor="unit_id" className="text-sm">
                  {t("page.master_product.dialog_modal.add_products_dialog.unit_label", "Satuan")}
                  <span className="text-red-500"> *</span>
                </label>
                <SearchableSelect
                  options={unitOptions}
                  value={formData.unit_id?.toString() ?? ''}
                  onValueChange={(value) => handleSelectChange('unit_id', value)}
                  placeholder={t("page.master_product.dialog_modal.add_products_dialog.unit_placeholder", "Pilih satuan")}
                  searchPlaceholder={t("page.master_product.dialog_modal.add_products_dialog.search_unit_placeholder", "Cari satuan...")}
                  emptyMessage={t("page.master_product.dialog_modal.add_products_dialog.no_units_found", "Satuan tidak ditemukan.")}
                  disabled={loading}
                  className={`${errorForm.unit_id && 'border-red-500'}`}
                />
                {errorForm.unit_id && (
                  <ErrorFormInfo message={errorForm.unit_id} />
                )}
              </Field>

              <Field>
                <label htmlFor="stock" className="text-sm">
                  {t("page.master_product.dialog_modal.add_products_dialog.stock_label", "Stok")}
                  <span className="text-red-500"> *</span>
                </label>
                <Input
                  id="stock"
                  name="stock"
                  type="number"
                  placeholder={t("page.master_product.dialog_modal.add_products_dialog.stock_placeholder", "Masukkan stok produk")}
                  value={formData.stock ?? ''}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      stock: e.target.value ? Number(e.target.value) : null,
                    }));
                    setErrorForm({ ...errorForm, stock: '' });
                  }}
                  disabled={loading}
                  className={`${errorForm.stock && 'border-red-500'}`}
                />
                {errorForm.stock && (
                  <ErrorFormInfo message={errorForm.stock} />
                )}
              </Field>

              <Field>
                <label htmlFor="cost_price" className="text-sm">
                  {t("page.master_product.dialog_modal.add_products_dialog.cost_price_label", "Harga Modal")}
                  <span className="text-red-500"> *</span>
                </label>
                <NumericFormat
                  id="cost_price"
                  name="cost_price"
                  customInput={Input}
                  thousandSeparator="."
                  decimalSeparator=","
                  prefix="Rp "
                  placeholder={t("page.master_product.dialog_modal.add_products_dialog.cost_price_placeholder", "Masukkan harga modal")}
                  value={formData.cost_price ?? ''}
                  onFocus={(e) => e.target.select()}
                  onValueChange={(values) => {
                    setFormData((prev) => ({
                      ...prev,
                      cost_price: values.floatValue ?? null,
                    }));
                    setErrorForm((prev) => ({ ...prev, cost_price: '' }));
                  }}
                  disabled={loading}
                  className={`${errorForm.cost_price && 'border-red-500'}`}
                />
                {errorForm.cost_price && (
                  <ErrorFormInfo message={errorForm.cost_price} />
                )}
              </Field>

              <Field>
                <label htmlFor="price" className="text-sm">
                  {t("page.master_product.dialog_modal.add_products_dialog.price_label", "Harga Jual")}
                  <span className="text-red-500"> *</span>
                </label>
                <NumericFormat
                  id="price"
                  name="price"
                  customInput={Input}
                  thousandSeparator="."
                  decimalSeparator=","
                  prefix="Rp "
                  placeholder={t("page.master_product.dialog_modal.add_products_dialog.price_placeholder", "Masukkan harga jual")}
                  value={formData.price ?? ''}
                  onFocus={(e) => e.target.select()}
                  onValueChange={(values) => {
                    setFormData((prev) => ({
                      ...prev,
                      price: values.floatValue ?? null,
                    }));
                    setErrorForm((prev) => ({ ...prev, price: '' }));
                  }}
                  disabled={loading}
                  className={`${errorForm.price && 'border-red-500'}`}
                />
                {errorForm.price && (
                  <ErrorFormInfo message={errorForm.price} />
                )}
              </Field>

              <Field>
                <label className="text-sm">
                  {t("page.master_product.dialog_modal.add_products_dialog.image_label", "Gambar")}
                </label>
                <Input
                  id="image"
                  name="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={loading}
                />
                {imagePreview && (
                  <img src={imagePreview} alt="Preview" className="mt-2 h-20 w-20 object-cover rounded" />
                )}
              </Field>

              <Field>
                <label htmlFor="is_active" className="text-sm mb-2 block">
                  {t("page.master_product.dialog_modal.add_products_dialog.is_active_label", "Aktif")}
                </label>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => handleSwitchChange('is_active', checked)}
                  disabled={loading}
                />
              </Field>

              <Field>
                <label htmlFor="is_unlimited" className="text-sm mb-2 block">
                  {t("page.master_product.dialog_modal.add_products_dialog.is_unlimited_label", "Stok Tidak Terbatas")}
                </label>
                <Switch
                  id="is_unlimited"
                  checked={formData.is_unlimited}
                  onCheckedChange={(checked) => handleSwitchChange('is_unlimited', checked)}
                  disabled={loading}
                />
              </Field>
            </FieldGroup>

            <Field>
              <label htmlFor="desc" className="text-sm">
                {t("page.master_product.dialog_modal.add_products_dialog.desc_label", "Deskripsi")}
              </label>
              <Textarea
                id="desc"
                name="desc"
                placeholder={t("page.master_product.dialog_modal.add_products_dialog.desc_placeholder", "Masukkan deskripsi produk")}
                value={formData.desc}
                onChange={handleChange}
                disabled={loading}
                rows={4}
                className={`${errorForm.desc && 'border-red-500'}`}
              />
              {errorForm.desc && (
                <ErrorFormInfo message={errorForm.desc} />
              )}
            </Field>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              {t("component.dialog.cancel_button", "Batal")}
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading && <Spinner />}
              {t("component.dialog.save_button", "Simpan")}
            </Button>
          </div>


        </form>
      </DialogContent>
    </Dialog>
  );
}
