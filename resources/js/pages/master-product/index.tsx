import { Head } from '@inertiajs/react';
import i18next from 'i18next';
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import HeaderContent from '@/components/header-content';
import {
    DEBOUNCEDEFAULTDURATION,
    DEFAULT_FILTER_VALUE,
    PAGINATIONLIMITDEFAULT,
    PAGINATIONLIMITOPTIONDEFAULT,
} from '@/constants/Index';
import axiosInstance from '@/lib/axios';
import { handleApiError, showWarningToast } from '@/lib/utils';
import { index as apiGetMasterProducts } from '@/routes/apiMasterProducts';
import { index as apiGetCategories } from '@/routes/apiCategories';
import { index as apiGetUnits } from '@/routes/apiUnits';
import { index as masterproducts } from '@/routes/payment-methods';
import type { MasterProductQueryParam } from '@/support/interfaces/request/master-product';
import type { Pagination } from '@/support/interfaces/resource/pagination';
import type { PaginationResponse } from '@/support/interfaces/resource/resource-response';
import type { ResponseApi } from '@/support/interfaces/response/Response';
import type { RowSelectionState } from '@tanstack/react-table';
import type { MasterProduct } from '@/support/models/masterProduct';
import type { Category } from '@/support/models/category';
import type { Unit } from '@/support/models/unit';
import { columns } from './columns';
import { DataTable } from './data-table';

const { url } = masterproducts();

export default function Index() {
    const { url: apiUrl } = apiGetMasterProducts();
    const { t } = useTranslation();

    const [allMasterProducts, setAllMasterProducts] = useState<MasterProduct[]>(
        [],
    );
    const [categories, setCategories] = useState<Category[]>([]);
    const [units, setUnits] = useState<Unit[]>([]);
    const [pagination, setPagination] = useState<Pagination>({
        current_page: 1,
        last_page: 1,
        per_page: PAGINATIONLIMITDEFAULT,
        total: 0,
        from: 0,
        to: 0,
        links: [],
        prev_page_url: '',
        next_page_url: '',
    });
    const [processing, setProcessing] = useState(false);
    const [detailOpen, setDetailOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
    const [bulkAddProductsOpen, setBulkAddProductsOpen] = useState(false);
    const [addProductsOpen, setAddProductsOpen] = useState(false);
    const [selectedMasterProduct, setSelectedMasterProduct] =
        useState<MasterProduct | null>(null);
    const [selectedMasterProducts, setSelectedMasterProducts] = useState<
        MasterProduct[]
    >([]);
    const [selectedMasterProductsMap, setSelectedMasterProductsMap] = useState<
        Record<string | number, MasterProduct>
    >({});
    const hasMountedQueryEffect = useRef(false);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

    const [queryParam, setQueryParam] = useState<MasterProductQueryParam>({
        limit: PAGINATIONLIMITDEFAULT,
        page: 1,
        field: DEFAULT_FILTER_VALUE,
        keyword: '',
        category_name: null,
        unit_name: null,
        order_by: null,
        order: null,
        barcode: null,
        is_added: null,
    });

    const fetchAllMasterProducts = async () => {
        try {
            setProcessing(true);
            const res = await axiosInstance.get<
                ResponseApi<PaginationResponse<MasterProduct>>
            >(apiUrl, { params: queryParam });

            if (!res.data.success) {
                showWarningToast(res.data.message);

                return;
            }

            setAllMasterProducts(res.data.data.items);
            setPagination(res.data.data.pagination);
        } catch (error) {
            handleApiError(error);
        } finally {
            setProcessing(false);
        }
    };

    const fetchCategoriesAndUnits = async () => {
        try {
            const [categoriesRes, unitsRes] = await Promise.all([
                axiosInstance.get<ResponseApi<Category[]>>(
                    apiGetCategories().url,
                ),
                axiosInstance.get<ResponseApi<Unit[]>>(apiGetUnits().url),
            ]);

            if (categoriesRes.data.data) {
                setCategories(categoriesRes.data.data);
            }
            if (unitsRes.data.data) {
                setUnits(unitsRes.data.data);
            }
        } catch (error) {
            console.error('Error fetching categories and units:', error);
            handleApiError(error);
        }
    };

    const handleDetailClick = (masterproduct: MasterProduct) => {
        setSelectedMasterProduct(masterproduct);
        setDetailOpen(true);
    };

    const handleEditClick = (masterproduct: MasterProduct) => {
        setSelectedMasterProduct(masterproduct);
        setEditOpen(true);
    };

    const handleDeleteClick = (masterproduct: MasterProduct) => {
        setSelectedMasterProduct(masterproduct);
        setDeleteOpen(true);
    };

    const handleAddProductsClick = (masterproduct: MasterProduct) => {
        setSelectedMasterProduct(masterproduct);
        setAddProductsOpen(true);
    };

    const handleBulkDeleteClick = (Masterproducts: MasterProduct[]) => {
        setSelectedMasterProducts(Masterproducts);
        setBulkDeleteOpen(true);
    };

    const handleBulkAddProductsClick = (Masterproducts: MasterProduct[]) => {
        setSelectedMasterProducts(Masterproducts);
        setBulkAddProductsOpen(true);
    };

    const handleChangePaginationPage = (page: number) => {
        setQueryParam((prev) => ({
            ...prev,
            page: page,
        }));
    };

    const handleChangePaginationLimit = (limit: number) => {
        setQueryParam((prev) => ({
            ...prev,
            limit: limit,
        }));
    };

    const handleChangeField = (field: string) => {
        setQueryParam((prev) => ({
            ...prev,
            field: field,
        }));
    };

    const handleChangeKeyword = (keyword: string) => {
        setQueryParam((prev) => ({
            ...prev,
            page: 1,
            keyword: keyword,
        }));
    };

    const handleResetFilter = () => {
        setQueryParam({
            limit: PAGINATIONLIMITDEFAULT,
            page: 1,
            field: DEFAULT_FILTER_VALUE,
            keyword: '',
            category_name: null,
            unit_name: null,
            order_by: null,
            order: null,
            barcode: null,
            is_added: null,
        });
    };

    // Fetch categories and units on mount
    useEffect(() => {
        fetchCategoriesAndUnits();
    }, []);

    useEffect(() => {
        if (!hasMountedQueryEffect.current) {
            hasMountedQueryEffect.current = true;

            return;
        }

        fetchAllMasterProducts();
    }, [
        queryParam.page,
        queryParam.limit,
        queryParam.field,
        queryParam.category_name,
        queryParam.unit_name,
        queryParam.order_by,
        queryParam.order,
        queryParam.is_added,
    ]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchAllMasterProducts();
        }, DEBOUNCEDEFAULTDURATION);

        return () => clearTimeout(timeout);
    }, [queryParam.keyword]);

    useEffect(() => {
        if (Object.keys(rowSelection).length === 0) {
            setSelectedMasterProductsMap({});
            return;
        }

        setSelectedMasterProductsMap((prev) => {
            const updated = { ...prev };
            allMasterProducts.forEach((item) => {
                if (rowSelection[item.id]) {
                    updated[item.id] = item;
                }
            });
            Object.keys(updated).forEach((key) => {
                if (!rowSelection[key]) {
                    delete updated[key];
                }
            });
            return updated;
        });
    }, [rowSelection, allMasterProducts]);

    return (
        <>
            <Head title={t('page.master_product.page_name', 'Produk')} />
            <div className="mb-16 flex h-full flex-1 flex-col overflow-x-auto rounded-xl p-4">
                <HeaderContent>
                    {t('page.master_product.page_name', 'Master Produk')}
                </HeaderContent>
                <DataTable
                    columns={columns}
                    processing={processing}
                    data={allMasterProducts}
                    limitOptions={PAGINATIONLIMITOPTIONDEFAULT}
                    onRefresh={fetchAllMasterProducts}
                    detailDataOpen={detailOpen}
                    editOpen={editOpen}
                    deleteOpen={deleteOpen}
                    setDetailOpen={setDetailOpen}
                    setEditOpen={setEditOpen}
                    setDeleteOpen={setDeleteOpen}
                    onDetailClick={handleDetailClick}
                    onEditClick={handleEditClick}
                    onDeleteClick={handleDeleteClick}
                    onAddProductsClick={handleAddProductsClick}
                    addProductsOpen={addProductsOpen}
                    setAddProductsOpen={setAddProductsOpen}
                    onBulkDeleteClick={handleBulkDeleteClick}
                    isBulkDeleteDialogOpen={bulkDeleteOpen}
                    setOpenBulkDeleteDialogOpen={setBulkDeleteOpen}
                    onBulkAddProductsClick={handleBulkAddProductsClick}
                    isBulkAddProductsDialogOpen={bulkAddProductsOpen}
                    setOpenBulkAddProductsDialogOpen={setBulkAddProductsOpen}
                    selectedMasterProductsMap={selectedMasterProductsMap}
                    selectedMasterProduct={selectedMasterProduct}
                    queryParam={queryParam}
                    pagination={pagination}
                    onResetFilter={handleResetFilter}
                    onChangePaginationLimit={handleChangePaginationLimit}
                    onChangePaginationPage={handleChangePaginationPage}
                    onChangeField={handleChangeField}
                    onChangeKeyword={handleChangeKeyword}
                    setQueryParam={setQueryParam}
                    categories={categories}
                    units={units}
                    rowSelection={rowSelection}
                    setRowSelection={setRowSelection}
                />
            </div>
        </>
    );
}

Index.layout = {
    breadcrumbs: [
        {
            title: i18next.t('page.master_product.page_name', 'Master Produk'),
            href: url,
        },
    ],
};
