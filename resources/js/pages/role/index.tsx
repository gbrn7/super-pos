import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { index as apiGetRoles } from '@/routes/apiRoles';
import { index as roles } from '@/routes/roles';
import type { Role } from '@/support/models/role';
import { columns } from './columns';
import { DataTable } from './data-table';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import axiosInstance from '@/lib/axios';
import { ResponseApi } from '@/support/interfaces/response/Response';
import { handleApiError, showWarningToast } from '@/lib/utils';
import HeaderContent from '@/components/header-content';
import { PAGINATIONLIMITOPTIONDEFAULT } from '@/constants/Index';

const { url } = roles();


export default function index() {
    const { url: apiUrl } = apiGetRoles();
    const { t } = useTranslation()


    const [allRoles, setAllRoles] = useState<Role[]>([]);
    const [processing, setProcessing] = useState(false);
    const [detailOpen, setDetailOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Role | null>(
        null,
    );
    const [selectedRoles, setSelectedRoles] = useState<Role[]>([]);

    const fetchAllRoles = async () => {
        try {
            setProcessing(true);
            const res = await axiosInstance.get<ResponseApi<Role[]>>(apiUrl);
            if (!res.data.success) {
                showWarningToast(res.data.message)
                return
            }
            setAllRoles(res.data.data);
        } catch (error) {
            handleApiError(error)
        } finally {
            setProcessing(false);
            setSelectedRoles([])
        }
    };

    const handleDetailClick = (role: Role) => {
        setSelectedRole(role);
        setDetailOpen(true);
    };

    const handleEditClick = (role: Role) => {
        setSelectedRole(role);
        setEditOpen(true);
    };

    const handleDeleteClick = (role: Role) => {
        setSelectedRole(role);
        setDeleteOpen(true);
    };

    const handleBulkDeleteClick = (roles: Role[]) => {
        setSelectedRoles(roles);
        setBulkDeleteOpen(true);
    };

    useEffect(() => {
        const fetchRoles = async () => fetchAllRoles();

        fetchRoles();
    }, []);

    return (
        <>
            <Head title={t("page.role.page_name", "Peran")} />
            <div className="mb-16 flex h-full flex-1 flex-col overflow-x-auto rounded-xl p-4">
                <HeaderContent>
                    {t("page.role.page_name", "Peran")}
                </HeaderContent>
                <DataTable
                    columns={columns}
                    processing={processing}
                    data={allRoles}
                    limitOptions={PAGINATIONLIMITOPTIONDEFAULT}
                    onRefresh={fetchAllRoles}
                    deleteOpen={deleteOpen}
                    setDeleteOpen={setDeleteOpen}
                    onDetailClick={handleDetailClick}
                    onEditClick={handleEditClick}
                    onDeleteClick={handleDeleteClick}
                    onBulkDeleteClick={handleBulkDeleteClick}
                    isBulkDeleteDialogOpen={bulkDeleteOpen}
                    setOpenBulkDeleteDialogOpen={setBulkDeleteOpen}
                    selectedBulkRoles={selectedRoles}
                    selectedRole={selectedRole}
                />
            </div>
        </>
    );
}

index.layout = {
    breadcrumbs: [
        {
            title: i18next.t("page.role.page_name", "Peran"),
            href: url,
        },
    ],
};