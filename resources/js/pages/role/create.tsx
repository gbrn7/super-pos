import { Head, Link, router } from "@inertiajs/react"
import i18next from "i18next";
import { useTranslation } from "react-i18next"
import { create as createRoute, index as indexRoute } from '@/routes/roles'
import { useState } from "react";
import { RoleForm, RoleFormError } from "@/support/interfaces/request/role";
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
import { PERMISSIONLIST } from "@/support/enums/PermissionEnums";

export default function create() {
  const { t } = useTranslation()

  const PERMISSIONS = PERMISSIONLIST()
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<RoleForm>({
    name: '',
    permissions: []
  });

  const [errorForm, setErrorForm] = useState<RoleFormError>({
    name: "",
    permissions: ""
  });

  const roleSchema = z.object({
    name: z.string().trim().min(1, t("validation.role.required.name", "Nama tidak boleh kosong")),
    permissions: z.array(
      z.string()).min(1, t("validation.role.required.permissions", "Minimal satu perizinan harus dipilih")
      )
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

  const handlePermissionChange = (permission: string, isChecked: boolean) => {
    setFormData((prev) => {
      const updatedPermissions = isChecked
        ? [...prev.permissions, permission]
        : prev.permissions.filter((p) => p !== permission);
      return { ...prev, permissions: updatedPermissions };
    });

    setErrorForm({
      ...errorForm,
      permissions: '',
    });
  };

  const handleCheckAllPermissions = (isChecked: boolean) => {
    const allPermissions = PERMISSIONS.flatMap((permission) =>
      permission.ACCESSLIST.map((access) => access.VALUE)
    );

    setFormData((prev) => ({
      ...prev,
      permissions: isChecked ? allPermissions : [],
    }));

    setErrorForm({
      ...errorForm,
      permissions: '',
    });
  };

  const handleCheckGroupPermissions = (permissionGroup: typeof PERMISSIONS[0], isChecked: boolean) => {
    const groupPermissions = permissionGroup.ACCESSLIST.map((access) => access.VALUE);

    setFormData((prev) => {
      const updatedPermissions = isChecked
        ? [...new Set([...prev.permissions, ...groupPermissions])]
        : prev.permissions.filter((p) => !groupPermissions.includes(p));
      return { ...prev, permissions: updatedPermissions };
    });

    setErrorForm({
      ...errorForm,
      permissions: '',
    });
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();

    const resultValidation = roleSchema.safeParse(formData);

    if (!resultValidation.success) {
      const fieldErrors: RoleFormError = {
        name: "",
        permissions: ""
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
      setFormData({ name: '', permissions: [] });
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
          {t("page.role.create.page_name", "Tambah Peran")}
        </HeaderContent>
        <div className="form-container">
          <form onSubmit={handleSubmit} className="space-y-4 border p-3 rounded-2xl">
            <div className="justify-end confirm-btn-wrapper flex gap-2">
              <Link href={index().url}>
                <Button type="button" variant="outline">{t("page.role.create.form.cancel_button", "Batal")}</Button>
              </Link>
              <Button disabled={loading} type="submit" className="btn-outlie"> {loading ? <Spinner /> : t("page.role.create.form.confirm_button", "Tambah Peran")}</Button>
            </div>
            <Field>
              <label htmlFor="name" className="text-sm">
                {t("page.role.create.form.name_input_label", "Nama")}
                <span className="text-red-500"> *</span>
              </label>
              <Input
                id="name"
                name="name"
                placeholder={t("page.role.create.form.name_input_placeholder", "Masukkan nama peran")}
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
                  <Label className=" text-sm">{t("page.role.create.form.permissions_input_label", "Izin")}<span className="text-red-500"> *</span></Label>
                </div>
              </div>

              {/* Check All Permissions */}
              <div className={`Permission-Wrapper space-y-2 border p-3 rounded-2xl ${errorForm.permissions && 'border-red-500'}`}>
                <div
                  className={`flex items-center gap-3 p-4 rounded-lg border transition-all cursor-pointer}`}
                >
                  <Checkbox
                    id="check-all"
                    checked={formData.permissions.length === PERMISSIONS.flatMap((permission) => permission.ACCESSLIST.map((access) => access.VALUE)).length}
                    onCheckedChange={(isChecked) => handleCheckAllPermissions(isChecked as boolean)}
                  />
                  <div className="flex-1">
                    <label htmlFor="check-all" className=" font-semibold cursor-pointer capitalize">
                      {t("page.role.create.form.check_all_permissions", "Pilih semua perizinan")}
                    </label>
                    <p className="text-slate-400 text-sm mt-0.5">
                      {t("page.role.create.form.check_all_permissions_desc", "Pilih semua perizinan yang tersedia sekalig untuk peran ini")}
                    </p>
                  </div>
                </div>

                <div className="permission-container grid grid-cols-1 md:grid-cols-2 gap-4">

                  {PERMISSIONS.map((permission) => (
                    <div className="space-y-3 border p-3 rounded-xl" key={permission.LABEL}>
                      <div className="flex items-center justify-between pb-2 border-b border-secondary">
                        <div className="flex items-center">
                          <h3 className=" font-semibold">{permission.LABEL}</h3>
                        </div>
                        <div
                          className={`flex items-center gap-2 px-3 py-1.5 rounded cursor-pointer transition-all 
                    }`}
                        >
                          <Checkbox
                            id={`check-all-${permission.LABEL}`}
                            checked={permission.ACCESSLIST.every((access) =>
                              formData.permissions.includes(access.VALUE)
                            )}
                            onCheckedChange={(isChecked) =>
                              handleCheckGroupPermissions(permission, isChecked as boolean)
                            }
                          />
                          <label
                            htmlFor={`check-all-${permission.LABEL}`}
                            className="text-slate-300 text-xs font-medium cursor-pointer"
                          >
                            Check All
                          </label>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {permission.ACCESSLIST.map((access) => (
                          <div
                            key={access.VALUE}
                            className={`flex items-center gap-3 p-2 rounded-lg border transition-all cursor-pointer`}
                          >
                            <Checkbox
                              id={access.VALUE}
                              value={access.VALUE}
                              checked={formData.permissions.includes(access.VALUE)}
                              onCheckedChange={(isChecked) =>
                                handlePermissionChange(access.VALUE, isChecked as boolean)
                              }
                            />
                            <div className="flex-1 min-w-0">
                              <label
                                htmlFor={access.VALUE}
                                className=" font-medium cursor-pointer block capitalize"
                              >
                                {access.LABEL}
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                {errorForm.permissions && (
                  <ErrorFormInfo message={errorForm.permissions} />
                )}
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