import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { index as apiGetCategories } from '@/routes/apiCategories';
import { index as categories } from '@/routes/categories';
import type { Category } from '@/support/models/category';
import { columns } from './columns';
import { DataTable } from './data-table';
import { DeleteDialog } from './dialog-modal/delete-dialog';
import { DetailDialog } from './dialog-modal/detail-dialog';
import { EditDialog } from './dialog-modal/edit-dialog';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import axiosInstance from '@/lib/axios';
import { toast } from 'sonner';
import { ResponseApi } from '@/support/interfaces/response/Response';
import axios from 'axios';
import { ResponseErrorApi } from '@/support/interfaces/response/ResponseError';
import { Message } from '@/constants/Index';
import { handleApiError } from '@/lib/utils';

const { url } = categories();


export default function Index() {
    const { url: apiUrl } = apiGetCategories();
    const { t } = useTranslation()


    const [allCategories, setAllCategories] = useState<Category[]>([]);
    const [processing, setProcessing] = useState(false);
    const [detailOpen, setDetailOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(
        null,
    );
    const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);

    const fetchAllCategories = async () => {
        try {
            setProcessing(true);
            const res = await axiosInstance.get<ResponseApi<Category[]>>(apiUrl);
            if (!res.data.success) {
                toast.info(res.data.message)
                return
            }
            setAllCategories(res.data.data);
        } catch (error) {
            handleApiError(error)
        } finally {
            setProcessing(false);
            setSelectedCategories([])
        }
    };

    const handleDetailClick = (category: Category) => {
        setSelectedCategory(category);
        setDetailOpen(true);
    };

    const handleEditClick = (category: Category) => {
        setSelectedCategory(category);
        setEditOpen(true);
    };

    const handleDeleteClick = (category: Category) => {
        setSelectedCategory(category);
        setDeleteOpen(true);
    };

    const handleBulkDeleteClick = (categories: Category[]) => {
        setSelectedCategories(categories);
        setBulkDeleteOpen(true);
    };

    useEffect(() => {
        const fetchCategories = async () => fetchAllCategories();

        fetchCategories();
    }, []);

    return (
        <>
            <Head title={t("page.category.page_name", "Kategori")} />
            <div className="mb-16 flex h-full flex-1 flex-col overflow-x-auto rounded-xl p-4">
                <DataTable
                    columns={columns}
                    processing={processing}
                    data={allCategories}
                    limitOptions={[10, 20, 50, 100]}
                    onRefresh={fetchAllCategories}
                    onDetailClick={handleDetailClick}
                    onEditClick={handleEditClick}
                    onDeleteClick={handleDeleteClick}
                    onBulkDeleteClick={handleBulkDeleteClick}
                    isBulkDeleteDialogOpen={bulkDeleteOpen}
                    setOpenBulkDeleteDialogOpen={setBulkDeleteOpen}
                    selectedBulkCategories={selectedCategories}
                />
            </div>

            <DetailDialog
                isOpen={detailOpen}
                category={selectedCategory}
                onOpenChange={setDetailOpen}
            />

            <EditDialog
                isOpen={editOpen}
                onSuccess={fetchAllCategories}
                setOpen={setEditOpen}
                category={selectedCategory}
                key={selectedCategory?.id}
            />

            <DeleteDialog
                isOpen={deleteOpen}
                onSuccess={fetchAllCategories}
                setOpen={setDeleteOpen}
                category={selectedCategory}
            />

        </>
    );
}

Index.layout = {
    breadcrumbs: [
        {
            title: i18next.t("page.category.page_name", "Kategori"),
            href: url,
        },
    ],
};