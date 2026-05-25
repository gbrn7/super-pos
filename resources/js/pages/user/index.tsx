import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { index as apiGetUsers } from '@/routes/apiUsers';
import { index as apiGetRoles } from '@/routes/apiRoles';
import { index as users } from '@/routes/users';
import type { User } from '@/support/models/user';
import { columns } from './columns';
import { DataTable } from './data-table';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import axiosInstance from '@/lib/axios';
import { ResponseApi } from '@/support/interfaces/response/Response';
import { handleApiError, showWarningToast } from '@/lib/utils';
import HeaderContent from '@/components/header-content';
import { Role } from '@/support/models/role';

const { url } = users();


export default function Index() {


    const { url: apiUrl } = apiGetUsers();
    const { t } = useTranslation()


    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [processing, setProcessing] = useState(false);
    const [detailOpen, setDetailOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(
        null,
    );
    const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

    const fetchAllUsers = async () => {
        try {
            setProcessing(true);
            const res = await axiosInstance.get<ResponseApi<User[]>>(apiUrl);

            if (!res.data.success) {
                showWarningToast(res.data.message)
                return
            }
            setAllUsers(res.data.data);
        } catch (error) {
            handleApiError(error)
        } finally {
            setProcessing(false);
            setSelectedUsers([])
        }
    };

    const fetchRoles = async () => {
        try {
            const res = await axiosInstance.get<ResponseApi<Role[]>>(apiGetRoles().url);

            if (!res.data.success) {
                showWarningToast(res.data.message)
                return
            }

            setRoles(res.data.data);
        } catch (error) {
            handleApiError(error)
        } finally {
            setProcessing(false);
            setSelectedUsers([])
        }
    };

    const handleDetailClick = (user: User) => {
        setSelectedUser(user);
        setDetailOpen(true);
    };

    const handleEditClick = (user: User) => {
        setSelectedUser(user);
        setEditOpen(true);
    };

    const handleDeleteClick = (user: User) => {
        setSelectedUser(user);
        setDeleteOpen(true);
    };

    const handleBulkDeleteClick = (users: User[]) => {
        setSelectedUsers(users);
        setBulkDeleteOpen(true);
    };

    useEffect(() => {
        const fetchUsers = async () => fetchAllUsers();
        const fetchUserRoles = async () => fetchRoles();

        fetchUsers();
        fetchUserRoles();
    }, []);

    return (
        <>
            <Head title={t("page.user.page_name", "Kategori")} />
            <div className="mb-16 flex h-full flex-1 flex-col overflow-x-auto rounded-xl p-4">
                <HeaderContent>
                    {t("page.user.page_name", "Kategori")}
                </HeaderContent>
                <DataTable
                    roles={roles}
                    columns={columns}
                    processing={processing}
                    data={allUsers}
                    limitOptions={[10, 20, 50, 100]}
                    onRefresh={fetchAllUsers}
                    detailDataOpen={detailOpen}
                    editOpen={editOpen}
                    deleteOpen={deleteOpen}
                    setDetailOpen={setDetailOpen}
                    setEditOpen={setEditOpen}
                    setDeleteOpen={setDeleteOpen}
                    onDetailClick={handleDetailClick}
                    onEditClick={handleEditClick}
                    onDeleteClick={handleDeleteClick}
                    onBulkDeleteClick={handleBulkDeleteClick}
                    isBulkDeleteDialogOpen={bulkDeleteOpen}
                    setOpenBulkDeleteDialogOpen={setBulkDeleteOpen}
                    selectedBulkUsers={selectedUsers}
                    selectedUser={selectedUser}
                />
            </div>
        </>
    );
}

Index.layout = {
    breadcrumbs: [
        {
            title: i18next.t("page.user.page_name", "Kategori"),
            href: url,
        },
    ],
};