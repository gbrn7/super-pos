import { Head, Link, router, usePage } from '@inertiajs/react';
import i18next from 'i18next';
import { useTranslation } from 'react-i18next';
import { index as indexRoute } from '@/routes/roles';
import { show as getRoleRoute } from '@/routes/apiRoles';
import { useEffect, useState } from 'react';
import { RoleForm, RoleFormError } from '@/support/interfaces/request/role';
import z from 'zod';
import axiosInstance from '@/lib/axios';
import { ResponseApi } from '@/support/interfaces/response/Response';
import { RoleWithPermissions } from '@/support/models/role';
import { update as updateRole } from '@/routes/apiRoles';
import { index } from '@/routes/roles';
import {
    handleApiError,
    showSuccessToast,
    showWarningToast,
} from '@/lib/utils';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import ErrorFormInfo from '@/components/errorFormInfo';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import HeaderContent from '@/components/header-content';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { PERMISSIONLIST } from '@/support/enums/PermissionEnums';
import { Skeleton } from '@/components/ui/skeleton';

export default function edit() {
    const { t } = useTranslation();
    const { id } = usePage().props;

    const PERMISSIONS = PERMISSIONLIST();
    const [loading, setLoading] = useState<boolean>(false);
    const [formData, setFormData] = useState<RoleForm>({
        name: '',
        permissions: [],
    });

    const [errorForm, setErrorForm] = useState<RoleFormError>({
        name: '',
        permissions: '',
    });

    const roleSchema = z.object({
        name: z
            .string()
            .trim()
            .min(
                1,
                t('validation.role.required.name', 'Nama tidak boleh kosong'),
            ),
        permissions: z
            .array(z.string())
            .min(
                1,
                t(
                    'validation.role.required.permissions',
                    'Minimal satu perizinan harus dipilih',
                ),
            ),
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
            permission.ACCESSLIST.map((access) => access.VALUE),
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

    const handleCheckGroupPermissions = (
        permissionGroup: (typeof PERMISSIONS)[0],
        isChecked: boolean,
    ) => {
        const groupPermissions = permissionGroup.ACCESSLIST.map(
            (access) => access.VALUE,
        );

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
                name: '',
                permissions: '',
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

            const res = await axiosInstance.put<
                ResponseApi<RoleWithPermissions>
            >(updateRole(id as string).url, formData);

            if (!res.data.success) {
                showWarningToast(res.data.message);
                return;
            }

            showSuccessToast(res.data.message);
            router.visit(index().url, { method: index().method });
        } catch (error) {
            console.error('Error updating role:', error);
            handleApiError(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchRole = async () => {
            try {
                setLoading(true);
                const res = await axiosInstance.get<
                    ResponseApi<RoleWithPermissions>
                >(getRoleRoute(id as string).url);

                if (!res.data.success) {
                    showWarningToast(res.data.message);
                    return;
                }

                const roleData = res.data.data;
                setFormData({
                    name: roleData.name,
                    permissions: roleData.permissions,
                });
            } catch (error) {
                console.error('Error fetching role:', error);
                handleApiError(error);
            } finally {
                setLoading(false);
            }
        };

        fetchRole();
    }, [id]);

    return (
        <>
            <Head title={t('page.role.edit.page_name', 'Edit Peran')} />
            <div className="flex h-full flex-1 flex-col overflow-x-auto rounded-xl p-4">
                <HeaderContent>
                    {t('page.role.edit.page_name', 'Edit Peran')}
                </HeaderContent>
                <div className="form-container">
                    <form
                        onSubmit={handleSubmit}
                        className="space-y-4 rounded-2xl border p-3"
                    >
                        {loading ? (
                            <Skeleton className="h-6 w-full" />
                        ) : (
                            <div className="confirm-btn-wrapper flex justify-end gap-2">
                                <Link href={index().url}>
                                    <Button type="button" variant="outline">
                                        {t(
                                            'page.role.edit.form.cancel_button',
                                            'Batal',
                                        )}
                                    </Button>
                                </Link>
                                <Button
                                    disabled={loading}
                                    type="submit"
                                    className="btn-outlie"
                                >
                                    {' '}
                                    {loading ? (
                                        <Spinner />
                                    ) : (
                                        t(
                                            'page.role.edit.form.confirm_button',
                                            'Simpan Perubahan',
                                        )
                                    )}
                                </Button>
                            </div>
                        )}

                        {loading ? (
                            <Skeleton className="h-10" />
                        ) : (
                            <Field>
                                <label htmlFor="name" className="text-sm">
                                    {t(
                                        'page.role.edit.form.name_input_label',
                                        'Nama',
                                    )}
                                    <span className="text-red-500"> *</span>
                                </label>
                                <Input
                                    id="name"
                                    name="name"
                                    placeholder={t(
                                        'page.role.edit.form.name_input_placeholder',
                                        'Masukkan nama peran',
                                    )}
                                    value={formData.name}
                                    onChange={handleChange}
                                    disabled={loading}
                                    className={`${errorForm.name && 'border-red-500'}`}
                                />
                                {errorForm.name && (
                                    <ErrorFormInfo message={errorForm.name} />
                                )}
                            </Field>
                        )}

                        {/* Permissions Section */}
                        {loading ? (
                            <div className="space-y-2">
                                <Skeleton className="h-20" />
                                <Skeleton className="h-20" />
                                <Skeleton className="h-20" />
                                <Skeleton className="h-20" />
                                <Skeleton className="h-20" />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label className="text-sm">
                                            {t(
                                                'page.role.edit.form.permissions_input_label',
                                                'Izin',
                                            )}
                                            <span className="text-red-500">
                                                {' '}
                                                *
                                            </span>
                                        </Label>
                                    </div>
                                </div>

                                {/* Check All Permissions */}
                                <div
                                    className={`Permission-Wrapper space-y-2 rounded-2xl border p-3 ${errorForm.permissions && 'border-red-500'}`}
                                >
                                    <div
                                        className={`cursor-pointer} flex items-center gap-3 rounded-lg border p-4 transition-all`}
                                    >
                                        <Checkbox
                                            id="check-all"
                                            checked={
                                                formData.permissions.length ===
                                                PERMISSIONS.flatMap(
                                                    (permission) =>
                                                        permission.ACCESSLIST.map(
                                                            (access) =>
                                                                access.VALUE,
                                                        ),
                                                ).length
                                            }
                                            onCheckedChange={(isChecked) =>
                                                handleCheckAllPermissions(
                                                    isChecked as boolean,
                                                )
                                            }
                                        />
                                        <div className="flex-1">
                                            <label
                                                htmlFor="check-all"
                                                className="cursor-pointer font-semibold capitalize"
                                            >
                                                {t(
                                                    'page.role.edit.form.check_all_permissions',
                                                    'Pilih semua perizinan',
                                                )}
                                            </label>
                                            <p className="mt-0.5 text-sm text-slate-400">
                                                {t(
                                                    'page.role.edit.form.check_all_permissions_desc',
                                                    'Pilih semua perizinan yang tersedia sekalig untuk peran ini',
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="permission-container grid grid-cols-1 gap-4 md:grid-cols-2">
                                        {PERMISSIONS.map((permission) => (
                                            <div
                                                className="space-y-3 rounded-xl border p-3"
                                                key={permission.LABEL}
                                            >
                                                <div className="flex items-center justify-between border-b border-secondary pb-2">
                                                    <div className="flex items-center">
                                                        <h3 className="font-semibold">
                                                            {permission.LABEL}
                                                        </h3>
                                                    </div>
                                                    <div
                                                        className={`} flex cursor-pointer items-center gap-2 rounded px-3 py-1.5 transition-all`}
                                                    >
                                                        <Checkbox
                                                            id={`check-all-${permission.LABEL}`}
                                                            checked={permission.ACCESSLIST.every(
                                                                (access) =>
                                                                    formData.permissions.includes(
                                                                        access.VALUE,
                                                                    ),
                                                            )}
                                                            onCheckedChange={(
                                                                isChecked,
                                                            ) =>
                                                                handleCheckGroupPermissions(
                                                                    permission,
                                                                    isChecked as boolean,
                                                                )
                                                            }
                                                        />
                                                        <label
                                                            htmlFor={`check-all-${permission.LABEL}`}
                                                            className="cursor-pointer text-xs font-medium text-slate-300"
                                                        >
                                                            {t(
                                                                'page.role.edit.form.check_all_permissions',
                                                                'Pilih semua perizinan',
                                                            )}
                                                        </label>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                                    {permission.ACCESSLIST.map(
                                                        (access) => (
                                                            <div
                                                                key={
                                                                    access.VALUE
                                                                }
                                                                className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-all`}
                                                            >
                                                                <Checkbox
                                                                    id={
                                                                        access.VALUE
                                                                    }
                                                                    value={
                                                                        access.VALUE
                                                                    }
                                                                    checked={formData.permissions.includes(
                                                                        access.VALUE,
                                                                    )}
                                                                    onCheckedChange={(
                                                                        isChecked,
                                                                    ) =>
                                                                        handlePermissionChange(
                                                                            access.VALUE,
                                                                            isChecked as boolean,
                                                                        )
                                                                    }
                                                                />
                                                                <div className="min-w-0 flex-1">
                                                                    <label
                                                                        htmlFor={
                                                                            access.VALUE
                                                                        }
                                                                        className="block cursor-pointer font-medium capitalize"
                                                                    >
                                                                        {
                                                                            access.LABEL
                                                                        }
                                                                    </label>
                                                                </div>
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {errorForm.permissions && (
                                        <ErrorFormInfo
                                            message={errorForm.permissions}
                                        />
                                    )}
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </>
    );
}

edit.layout = {
    breadcrumbs: [
        {
            title: i18next.t('page.role.page_name', 'Peran'),
            href: indexRoute().url,
        },
        {
            title: i18next.t('page.role.edit.page_name', 'Edit Peran'),
        },
    ],
};
