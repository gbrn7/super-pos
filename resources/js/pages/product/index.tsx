import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { index as apiGetProducts } from '@/routes/apiProducts';
import { index as products } from '@/routes/payment-methods';
import type { Product } from '@/support/models/product';
import { columns } from './columns';
import { DataTable } from './data-table';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import axiosInstance from '@/lib/axios';
import { ResponseApi } from '@/support/interfaces/response/Response';
import { handleApiError, showWarningToast } from '@/lib/utils';
import HeaderContent from '@/components/header-content';
import { Unit } from '@/support/models/unit';
import { index as apiGetUnits } from '@/routes/apiUnits';
import { index as apiGetCategories } from '@/routes/apiCategories';
import { Category } from '@/support/models/category';
import { ProductQueryParam } from '@/support/interfaces/request/product';
import { PaginationResponse } from '@/support/interfaces/resource/resource-response';
import { Pagination } from '@/support/interfaces/resource/pagination';
import { PAGINATIONLIMITDEFAULT } from '@/constants/Index';


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


    const [queryParam, setQueryParam] = useState<ProductQueryParam>({
        limit: PAGINATIONLIMITDEFAULT,
        page: 1,
        query: "",
        keyword: "",
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

    useEffect(() => {
        fetchUnits();
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchAllProducts();
    }, [queryParam])

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
                    limitOptions={[10, 20, 50, 100]}
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