import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { index as apiGetUnits } from '@/routes/apiUnits';
import { index as units } from '@/routes/units';
import type { Unit } from '@/support/models/unit';
import { columns } from './columns';
import { DataTable } from './data-table';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import axiosInstance from '@/lib/axios';
import { ResponseApi } from '@/support/interfaces/response/Response';
import { handleApiError, showWarningToast } from '@/lib/utils';
import HeaderContent from '@/components/header-content';
import { PAGINATIONLIMITOPTIONDEFAULT } from '@/constants/Index';

const { url } = units();


export default function Index() {


    const { url: apiUrl } = apiGetUnits();
    const { t } = useTranslation()


    const [allUnits, setAllUnits] = useState<Unit[]>([]);
    const [processing, setProcessing] = useState(false);
    const [detailOpen, setDetailOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
    const [selectedUnit, setSelectedUnit] = useState<Unit | null>(
        null,
    );
    const [selectedUnits, setSelectedUnits] = useState<Unit[]>([]);

    const fetchAllUnits = async () => {
        try {
            setProcessing(true);
            const res = await axiosInstance.get<ResponseApi<Unit[]>>(apiUrl);
            if (!res.data.success) {
                showWarningToast(res.data.message)
                return
            }
            setAllUnits(res.data.data);
        } catch (error) {
            handleApiError(error)
        } finally {
            setProcessing(false);
            setSelectedUnits([])
        }
    };

    const handleDetailClick = (unit: Unit) => {
        setSelectedUnit(unit);
        setDetailOpen(true);
    };

    const handleEditClick = (unit: Unit) => {
        setSelectedUnit(unit);
        setEditOpen(true);
    };

    const handleDeleteClick = (unit: Unit) => {
        setSelectedUnit(unit);
        setDeleteOpen(true);
    };

    const handleBulkDeleteClick = (units: Unit[]) => {
        setSelectedUnits(units);
        setBulkDeleteOpen(true);
    };

    useEffect(() => {
        const fetchUnits = async () => fetchAllUnits();

        fetchUnits();
    }, []);

    return (
        <>
            <Head title={t("page.unit.page_name", "Kategori")} />
            <div className="mb-16 flex h-full flex-1 flex-col overflow-x-auto rounded-xl p-4">
                <HeaderContent>
                    {t("page.unit.page_name", "Kategori")}
                </HeaderContent>
                <DataTable
                    columns={columns}
                    processing={processing}
                    data={allUnits}
                    limitOptions={PAGINATIONLIMITOPTIONDEFAULT}
                    onRefresh={fetchAllUnits}
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
                    selectedBulkUnits={selectedUnits}
                    selectedUnit={selectedUnit}
                />
            </div>
        </>
    );
}

Index.layout = {
    breadcrumbs: [
        {
            title: i18next.t("page.unit.page_name", "Kategori"),
            href: url,
        },
    ],
};