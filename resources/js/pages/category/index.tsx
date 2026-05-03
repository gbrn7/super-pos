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

const { url } = categories();

export default function Index() {
    const { url: apiUrl } = apiGetCategories();

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
            const response = await fetch(`${apiUrl}`);
            const result = await response.json();
            setAllCategories(result.data || []);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
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
            <Head title="Kategori" />
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
            title: 'Category',
            href: url,
        },
    ],
};
