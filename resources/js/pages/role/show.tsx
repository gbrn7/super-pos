import { Head, Link, router, usePage } from '@inertiajs/react';
import i18next from 'i18next';
import { useTranslation } from 'react-i18next';
import { index as indexRoute } from '@/routes/roles';
import { show as getRoleRoute } from '@/routes/apiRoles';
import { useEffect, useState } from 'react';
import { RoleForm } from '@/support/interfaces/request/role';
import axiosInstance from '@/lib/axios';
import { ResponseApi } from '@/support/interfaces/response/Response';
import { RoleWithPermissions } from '@/support/models/role';
import { index } from '@/routes/roles';
import { handleApiError, showWarningToast } from '@/lib/utils';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import HeaderContent from '@/components/header-content';
import { Button } from '@/components/ui/button';
import { PERMISSIONLIST } from '@/support/enums/PermissionEnums';
import { Skeleton } from '@/components/ui/skeleton';

export default function show() {
    const { t } = useTranslation();
    const { id } = usePage().props;

    const PERMISSIONS = PERMISSIONLIST();
    const [loading, setLoading] = useState<boolean>(false);
    const [formData, setFormData] = useState<RoleForm>({
        name: '',
        permissions: [],
    });

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
            <Head title={t('page.role.show.page_name', 'Detail Peran')} />
            <div className="flex h-full flex-1 flex-col overflow-x-auto rounded-xl p-4">
                <HeaderContent>
                    {t('page.role.show.page_name', 'Detail Peran')}
                </HeaderContent>
                <div className="form-container">
                    <form className="space-y-4 rounded-2xl border p-3">
                        {loading ? (
                            <Skeleton className="h-6 w-full" />
                        ) : (
                            <div className="confirm-btn-wrapper flex justify-end gap-2">
                                <Link href={index().url}>
                                    <Button type="button" variant="outline">
                                        {t(
                                            'page.role.show.form.cancel_button',
                                            'Back',
                                        )}
                                    </Button>
                                </Link>
                            </div>
                        )}

                        {loading ? (
                            <Skeleton className="h-10" />
                        ) : (
                            <Field>
                                <label htmlFor="name" className="text-sm">
                                    {t(
                                        'page.role.show.form.name_input_label',
                                        'Nama',
                                    )}
                                </label>
                                <p className="mt-0.5 text-lg font-semibold">
                                    {formData.name}
                                </p>
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
                                                'page.role.show.form.permissions_input_label',
                                                'Izin',
                                            )}
                                        </Label>
                                    </div>
                                </div>

                                {/* Check All Permissions */}
                                <div
                                    className={`Permission-Wrapper space-y-2 rounded-2xl border p-3`}
                                >
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
                                                </div>
                                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                                    {permission.ACCESSLIST.map(
                                                        (access) => (
                                                            <div
                                                                key={
                                                                    access.VALUE
                                                                }
                                                                className={`flex items-center gap-3 rounded-lg border-2 p-4 transition-all`}
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
                                                                />
                                                                <div className="min-w-0 flex-1">
                                                                    <label
                                                                        htmlFor={
                                                                            access.VALUE
                                                                        }
                                                                        className="block font-medium capitalize"
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
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </>
    );
}

show.layout = {
    breadcrumbs: [
        {
            title: i18next.t('page.role.page_name', 'Peran'),
            href: indexRoute().url,
        },
        {
            title: i18next.t('page.role.show.page_name', 'Detail Peran'),
        },
    ],
};
