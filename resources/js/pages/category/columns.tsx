
import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { Category } from "@/support/models/category"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import { DataTableHeader } from "@/components/data-table-header"


export const columns: ColumnDef<Category>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) =>
    (
      <DataTableHeader column={column} title="Nama" />
    )
    ,
    enableSorting: true,
  },
  {
    accessorKey: "desc",
    header: ({ column }) =>
    (
      <DataTableHeader column={column} title="Deskripsi" />
    )
    ,
    enableSorting: true,
  },
  {
    id: "actions",
    cell: () =>
    (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Action</DropdownMenuLabel>
          <DropdownMenuItem>Detail Data</DropdownMenuItem>
          <DropdownMenuItem>Edit Data</DropdownMenuItem>
          <DropdownMenuItem>Delete Data</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
    ,
  },
]