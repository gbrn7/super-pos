import { Head, usePage } from "@inertiajs/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { columns, Category } from "./columns"
import { DataTable } from "./data-table"

// interface Category {
//   id: number;
//   name: string;
//   desc: string | null;
//   created_at: string;
//   updated_at: string;
// }

async function getData(): Promise<Category[]> {
  // Fetch data from your API here.
  return [
    {
      id: 1,
      name: "Test Category",
      desc: "This is a test category",
      created_at: "2023-01-01 00:00:00",
      updated_at: "2023-01-01 00:00:00",
    },
    // ...
  ]
}





interface PaginationLink {
  url: string | null;
  label: string;
  page: number | null;
  active: boolean;
}

interface CategoryPaginatedResponse {
  current_page: number;
  data: Category[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: PaginationLink[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}



export default function index() {
  const { categories } = usePage<{ categories?: CategoryPaginatedResponse }>().props;

  console.log(categories);

  // const data = await getData()


  return (
    <>
      <Head title="Kategori" />
      <div className="flex h-full flex-1 flex-col overflow-x-auto rounded-xl p-4">
        <div className="grid grid-cols-3 gap-4">

        </div>
        <DataTable columns={columns} data={categories?.data || []} />
      </div>
    </>
  );
}

index.layout = {
  breadcrumbs: [
    {
      title: 'Kategori',
      href: '/categories',
    },
  ],
};
