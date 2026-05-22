import { Head, Link, router } from "@inertiajs/react"
import i18next from "i18next";
import { useTranslation } from "react-i18next"
import { create as createRoute, index as indexRoute } from '@/routes/roles'
import { useState } from "react";
import { RoleForm } from "@/support/interfaces/request/createRole";
import z from "zod";
import axiosInstance from "@/lib/axios";
import { ResponseApi } from "@/support/interfaces/response/Response";
import { Role } from "@/support/models/role";
import { store as storeRole } from '@/routes/apiRoles';
import { index } from '@/routes/roles';
import { handleApiError, showSuccessToast, showWarningToast } from "@/lib/utils";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import ErrorFormInfo from "@/components/errorFormInfo";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import HeaderContent from '@/components/header-content';
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";


const PERMISSIONS = {
  feature: [
    {
      id: 'feature-create',
      label: 'Create Feature',
      description: 'Create new features',
    },
    {
      id: 'feature-read',
      label: 'Read Feature',
      description: 'View and access features',
    },
    {
      id: 'feature-update',
      label: 'Update Feature',
      description: 'Edit existing features',
    },
    {
      id: 'feature-delete',
      label: 'Delete Feature',
      description: 'Remove features permanently',
    },
  ],
  product: [
    {
      id: 'product-create',
      label: 'Create Product',
      description: 'Create new products',
    },
    {
      id: 'product-read',
      label: 'Read Product',
      description: 'View and access products',
    },
    {
      id: 'product-update',
      label: 'Update Product',
      description: 'Edit existing products',
    },
    {
      id: 'product-delete',
      label: 'Delete Product',
      description: 'Remove products permanently',
    },
  ],
};


export default function create() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<RoleForm>({
    name: ''
  });

  const [errorForm, setErrorForm] = useState<RoleForm>({
    name: ""
  });

  const roleSchema = z.object({
    name: z.string().trim().min(1, t("validation.role.required.name", "Nama tidak boleh kosong")),
  });

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

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();

    const resultValidation = roleSchema.safeParse(formData);

    if (!resultValidation.success) {
      const fieldErrors: RoleForm = {
        name: ""
      };

      resultValidation.error.issues.forEach((error) => {
        const fieldName = error.path[0] as keyof RoleForm;

        fieldErrors[fieldName] = error.message;
      });


      setErrorForm(fieldErrors);

      return;
    }

    try {
      setLoading(true);

      const res = await axiosInstance.post<ResponseApi<Role>>(storeRole().url, formData);


      if (!res.data.success) {
        showWarningToast(res.data.message)
        return
      }

      showSuccessToast(res.data.message)
      setFormData({ name: '' });
      router.visit(index().url, { method: index().method });
    } catch (error) {
      console.error('Error creating role:', error);
      handleApiError(error)
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      <Head title={t("page.role.create.page_name", "Tambah Peran")} />
      <div className="flex h-full flex-1 flex-col overflow-x-auto rounded-xl p-4">
        <HeaderContent>
          {t("page.role.page_name", "Peran")}
        </HeaderContent>
        <div className="form-container">
          <form onSubmit={handleSubmit} className="space-y-4 border p-3 rounded-2xl">
            <div className="justify-end confirm-btn-wrapper flex gap-2">
              <Link href={index().url}>
                <Button type="button" variant="outline">Batal</Button>
              </Link>
              <Button disabled={loading} type="submit" className="btn-outlie"> {loading ? <Spinner /> : "Tambah Peran"}</Button>
            </div>
            <Field>
              <label htmlFor="name" className="text-sm">
                {t("page.role.dialog_modal.create_dialog.name_input_label", "Nama")}
              </label>
              <Input
                id="name"
                name="name"
                placeholder={t("page.role.dialog_modal.create_dialog.name_input_placeholder", "Masukkan nama peran")}
                value={formData.name}
                onChange={handleChange}
                disabled={loading}
                className={`${errorForm.name && 'border-red-500'}`}
              />
              {errorForm.name && (
                <ErrorFormInfo message={errorForm.name} />
              )}
            </Field>

            {/* Permissions Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white font-semibold text-base">Permissions</Label>
                  <p className="text-slate-400 text-sm mt-1">
                    Select the permissions for this role
                  </p>
                </div>
              </div>

              {/* Check All Permissions */}
              <div
                className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all cursor-pointer}`}
              >
                <Checkbox
                  id="check-all"
                />
                <div className="flex-1">
                  <label htmlFor="check-all" className="text-white font-semibold cursor-pointer">
                    Check All Permissions
                  </label>
                  <p className="text-slate-400 text-sm mt-0.5">
                    Select all available permissions at once
                  </p>
                </div>
              </div>

              <div className="permission-container grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Category Permissions */}
                <div className="space-y-3 border p-3 rounded-xl">
                  <div className="flex items-center justify-between pb-2 border-b border-secondary">
                    <div className="flex items-center">
                      <h3 className="text-white font-semibold">Product Permissions</h3>
                    </div>
                    <div
                      className={`flex items-center gap-2 px-3 py-1.5 rounded cursor-pointer transition-all 
                      }`}
                    >
                      <Checkbox
                        id="check-all-product"
                      />
                      <label
                        htmlFor="check-all-product"
                        className="text-slate-300 text-xs font-medium cursor-pointer"
                      >
                        Check All
                      </label>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {PERMISSIONS.product.map((permission) => (
                      <div
                        key={permission.id}
                        className={`flex items-start gap-3 p-4 rounded-lg border-2 transition-all cursor-pointer`}
                      >
                        <Checkbox
                          id={permission.id}
                        />
                        <div className="flex-1 min-w-0">
                          <label
                            htmlFor={permission.id}
                            className="text-white font-medium cursor-pointer block"
                          >
                            {permission.label}
                          </label>
                          <p className="text-slate-400 text-sm mt-0.5">
                            {permission.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Category Permissions */}
                <div className="space-y-3 border p-3 rounded-xl">
                  <div className="flex items-center justify-between pb-2 border-b border-secondary">
                    <div className="flex items-center">
                      <h3 className="text-white font-semibold">Product Permissions</h3>
                    </div>
                    <div
                      className={`flex items-center gap-2 px-3 py-1.5 rounded cursor-pointer transition-all 
                      }`}
                    >
                      <Checkbox
                        id="check-all-product"
                      />
                      <label
                        htmlFor="check-all-product"
                        className="text-slate-300 text-xs font-medium cursor-pointer"
                      >
                        Check All
                      </label>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {PERMISSIONS.product.map((permission) => (
                      <div
                        key={permission.id}
                        className={`flex items-start gap-3 p-4 rounded-lg border-2 transition-all cursor-pointer`}
                      >
                        <Checkbox
                          id={permission.id}
                        />
                        <div className="flex-1 min-w-0">
                          <label
                            htmlFor={permission.id}
                            className="text-white font-medium cursor-pointer block"
                          >
                            {permission.label}
                          </label>
                          <p className="text-slate-400 text-sm mt-0.5">
                            {permission.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div >
      </div >
    </>
  )
}

create.layout = {
  breadcrumbs: [
    {
      title: i18next.t("page.role.page_name", "Peran"),
      href: indexRoute().url,
    },
    {
      title: i18next.t("page.role.create.page_name", "Tambah Peran"),
      href: createRoute().url,
    },
  ],
};