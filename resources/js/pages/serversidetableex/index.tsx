import { Head, usePage, useHttp } from "@inertiajs/react";
import { columns } from "./columns"
import { DataTable } from "./data-table"
import { Category } from "@/support/models/category";
import { ResourceResponse } from "@/support/interfaces/resourceResponse";
import { useState, useEffect } from "react";
import { index as apiGetCategories } from '@/routes/apiCategories';
import { QueryParam } from "@/support/interfaces/queryParam";
import { index as categories } from "@/routes/categories";

const { url } = categories();


export default function index() {
  const { url: apiUrl } = apiGetCategories();

  const LimitOptions = [10, 20, 50, 100]

  const [categoriesRes, setCategoriesRes] = useState<ResourceResponse<Category>>()

  const { data, setData, get, processing } = useHttp<QueryParam>({
    query: '',
    page: 1,
    column: 'name',
    limit: 10,
  });


  const fetchCategories = () => {
    try {
      get(
        apiUrl,
        {
          onSuccess: (response) => {
            setCategoriesRes(response as ResourceResponse<Category>);
          },
        },
      )
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };


  useEffect(() => {
    console.log("data", data)
    fetchCategories();
  }, [data]);

  const handleLimitChange = (value: string) => {
    setData((prev) => ({ ...prev, limit: Number(value) }))
  }

  const handlePageChange = (page: number) => {
    setData((prev) => ({ ...prev, page }))
  }

  return (
    <>
      <Head title="Kategori" />
      <div className="flex h-full flex-1 flex-col overflow-x-auto rounded-xl p-4">
        <DataTable
          columns={columns}
          processing={processing}
          paginationLinks={categoriesRes?.meta.links || []}
          data={categoriesRes?.data || []}
          handleLimitChange={handleLimitChange}
          handlePageChange={handlePageChange}
          limitOptions={LimitOptions}
          queryParam={data}
        />
      </div>
    </>
  );
}

index.layout = {

  breadcrumbs: [
    {
      title: 'Kategori',
      href: url,
    },
  ],
};
