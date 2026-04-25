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
import { columns, Payment } from "./columns"
import { DataTable } from "./data-table"

async function getData(): Promise<Payment[]> {
  // Fetch data from your API here.
  return [
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "m@example.com",
    },
    // ...
  ]
}


export default function index() {
  // const data = await getData()
  const data: Payment[] = [
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "test@example.com",
    },
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "test@example.com",
    },
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "test@example.com",
    },
  ]

  return (
    <>
      <Head title="Kategori" />
      <div className="flex h-full flex-1 flex-col overflow-x-auto rounded-xl p-4">
        <div className="grid grid-cols-3 gap-4">
        </div>
        <DataTable columns={columns} data={data} />
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
