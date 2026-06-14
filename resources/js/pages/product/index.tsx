import { Head } from '@inertiajs/react';
import i18next from 'i18next';
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import HeaderContent from '@/components/header-content';
import { DEBOUNCEDEFAULTDURATION, PAGINATIONLIMITDEFAULT, PAGINATIONLIMITOPTIONDEFAULT } from '@/constants/Index';
import axiosInstance from '@/lib/axios';
import { handleApiError, showWarningToast } from '@/lib/utils';
import { index as apiGetCategories } from '@/routes/apiCategories';
import { index as apiGetProducts } from '@/routes/apiProducts';
import { index as apiGetUnits } from '@/routes/apiUnits';
import { index as products } from '@/routes/payment-methods';
import type { ProductQueryParam } from '@/support/interfaces/request/product';
import type { Pagination } from '@/support/interfaces/resource/pagination';
import type { PaginationResponse } from '@/support/interfaces/resource/resource-response';
import type { ResponseApi } from '@/support/interfaces/response/Response';
import type { Category } from '@/support/models/category';
import type { Product } from '@/support/models/product';
import type { Unit } from '@/support/models/unit';
import { columns } from './columns';
import { DataTable } from './data-table';


const { url } = products();


export default function Index() {


    const { url: apiUrl } = apiGetProducts();
    const { t } = useTranslation()


    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [pagination, setPagination] = useState<Pagination>({
        current_page: 1,
        last_page: 1,
        per_page: PAGINATIONLIMITDEFAULT,
        total: 0,
        from: 0,
        to: 0,
        links: [],
        prev_page_url: "",
        next_page_url: "",
    });
    const [processing, setProcessing] = useState(false);
    const [detailOpen, setDetailOpen] = useState(false);
    const [units, setUnits] = useState<Unit[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(
        null,
    );
    const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
    const hasMountedQueryEffect = useRef(false);


    const [queryParam, setQueryParam] = useState<ProductQueryParam>({
        limit: PAGINATIONLIMITDEFAULT,
        page: 1,
        field: "default",
        keyword: "",
        category_id: null,
        unit_id: null,
        is_active: null,
        is_unlimited: null,
        is_stock_available: null
    })

    const fetchAllProducts = async () => {
        try {
            setProcessing(true);
            const res = await axiosInstance.get<ResponseApi<PaginationResponse<Product>>>(apiUrl, { params: queryParam });

            if (!res.data.success) {
                showWarningToast(res.data.message)

                return
            }

            setAllProducts(res.data.data.items);
            setPagination(res.data.data.pagination);
        } catch (error) {
            handleApiError(error)
        } finally {
            setProcessing(false);
            setSelectedProducts([])
        }
    };

    const fetchUnits = async () => {
        try {
            const res = await axiosInstance.get<ResponseApi<Unit[]>>(apiGetUnits().url);

            if (!res.data.success) {
                showWarningToast(res.data.message)

                return
            }

            setUnits(res.data.data);
        } catch (error) {
            handleApiError(error)
        } finally {
            setProcessing(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await axiosInstance.get<ResponseApi<Category[]>>(apiGetCategories().url);

            if (!res.data.success) {
                showWarningToast(res.data.message)

                return
            }

            setCategories(res.data.data);
        } catch (error) {
            handleApiError(error)
        } finally {
            setProcessing(false);
        }
    };

    const handleDetailClick = (product: Product) => {
        setSelectedProduct(product);
        setDetailOpen(true);
    };

    const handleEditClick = (product: Product) => {
        setSelectedProduct(product);
        setEditOpen(true);
    };

    const handleDeleteClick = (product: Product) => {
        setSelectedProduct(product);
        setDeleteOpen(true);
    };

    const handleBulkDeleteClick = (products: Product[]) => {
        setSelectedProducts(products);
        setBulkDeleteOpen(true);
    };

    const handleChangePaginationPage = (page: number) => {
        setQueryParam((prev) => ({
            ...prev,
            page: page
        }));
    };

    const handleChangePaginationLimit = (limit: number) => {
        setQueryParam((prev) => ({
            ...prev,
            limit: limit
        }));
    };

    const handleChangeField = (field: string) => {
        setQueryParam((prev) => ({
            ...prev,
            field: field
        }));
    };

    const handleChangeKeyword = (keyword: string) => {
        setQueryParam((prev) => ({
            ...prev,
            keyword: keyword
        }));
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void Promise.all([fetchUnits(), fetchCategories()]);
    }, []);

    useEffect(() => {
        if (!hasMountedQueryEffect.current) {
            hasMountedQueryEffect.current = true;

            return;
        }

        fetchAllProducts();
    }, [
        queryParam.page,
        queryParam.limit,
        queryParam.field,
        queryParam.category_id,
        queryParam.unit_id,
        queryParam.is_active,
        queryParam.is_unlimited,
        queryParam.is_stock_available,
    ])

    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchAllProducts();
        }, DEBOUNCEDEFAULTDURATION);

        return () => clearTimeout(timeout);
    }, [queryParam.keyword])

    return (
        <>
            <Head title={t("page.product.page_name", "Produk")} />
            <div className="mb-16 flex h-full flex-1 flex-col overflow-x-auto rounded-xl p-4">
                <HeaderContent>
                    {t("page.product.page_name", "Produk")}
                </HeaderContent>
                <DataTable
                    columns={columns}
                    categories={categories}
                    units={units}
                    processing={processing}
                    data={allProducts}
                    limitOptions={PAGINATIONLIMITOPTIONDEFAULT}
                    onRefresh={fetchAllProducts}
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
                    selectedBulkProducts={selectedProducts}
                    selectedProduct={selectedProduct}
                    queryParam={queryParam}
                    pagination={pagination}
                    onChangePaginationLimit={handleChangePaginationLimit}
                    onChangePaginationPage={handleChangePaginationPage}
                    onChangeField={handleChangeField}
                    onChangeKeyword={handleChangeKeyword}
                    setQueryParam={setQueryParam}
                />
            </div>
        </>
    );
}

Index.layout = {
    breadcrumbs: [
        {
            title: i18next.t("page.product.page_name", "Produk"),
            href: url,
        },
    ],
};
