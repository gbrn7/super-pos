import { Head } from "@inertiajs/react";
import { columns } from "./columns"
import { DataTable } from "./data-table"
import { Category } from "@/support/models/category";
import { useState, useEffect } from "react";
import { index as apiGetCategories } from '@/routes/apiCategories';
import { index as categories } from "@/routes/categories";

const { url } = categories();


export default function index() {
  const { url: apiUrl } = apiGetCategories();

  const [allCategories, setAllCategories] = useState<Category[]>([])
  const [processing, setProcessing] = useState(false)

  const fetchAllCategories = async () => {
    try {
      setProcessing(true)
      const response = await fetch(`${apiUrl}`)
      const result = await response.json()
      setAllCategories(result.data || [])
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setProcessing(false)
    }
  };

  useEffect(() => {
    fetchAllCategories();
  }, []);

  return (
    <>
      <Head title="Kategori" />
      <div className="flex h-full flex-1 flex-col overflow-x-auto rounded-xl p-4 mb-16">
        <DataTable
          columns={columns}
          processing={processing}
          data={allCategories}
          limitOptions={[10, 20, 50, 100]}
          onRefresh={fetchAllCategories}
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
