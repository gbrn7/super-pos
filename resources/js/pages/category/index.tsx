import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { index as apiGetCategories } from '@/routes/apiCategories';
import { index as categories } from '@/routes/categories';
import type { Category } from '@/support/models/category';
import { columns } from './columns';
import { DataTable } from './data-table';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import axiosInstance from '@/lib/axios';
import { ResponseApi } from '@/support/interfaces/response/Response';
import { handleApiError, showWarningToast } from '@/lib/utils';
import HeaderContent from '@/components/header-content';

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
                showWarningToast(res.data.message)
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
                <HeaderContent>
                    {t("page.category.page_name", "Kategori")}
                </HeaderContent>
                <DataTable
                    columns={columns}
                    processing={processing}
                    data={allCategories}
                    limitOptions={[10, 20, 50, 100]}
                    onRefresh={fetchAllCategories}
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
                    selectedBulkCategories={selectedCategories}
                    selectedCategory={selectedCategory}
                />
            </div>
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