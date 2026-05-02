"use client"

import * as React from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  PaginationState,
} from "@tanstack/react-table"


import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CreateDialog } from "./create-dialog"
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"




interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[],
  processing?: boolean
  limitOptions?: number[],
  onRefresh?: () => void
}
export function DataTable<TData, TValue>({
  columns,
  data,
  processing,
  limitOptions = [10, 20, 50, 100],
  onRefresh,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])

  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )

  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})

  const [rowSelection, setRowSelection] = React.useState({})

  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  const [searchColumn, setSearchColumn] = React.useState<string>("name")

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
  })

  const disabledClass = "pointer-events-none opacity-50"


  return (
    <div>
      <div className="items-center pb-4 flex-col ">
        <div className="flex first-row  gap-2">
          <Select value={searchColumn} onValueChange={setSearchColumn}>
            <SelectTrigger className="w-full max-w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Pencarian Berdasarkan</SelectLabel>
                <SelectItem value="name">Nama</SelectItem>
                <SelectItem value="desc">Deskripsi</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Input
            placeholder={`Search by ${searchColumn === "name" ? "name" : "description"}...`}
            value={(table.getColumn(searchColumn)?.getFilterValue() as string) ?? ""}
            onChange={(event) => {
              table.getColumn(searchColumn)?.setFilterValue(event.target.value)
            }}
            className="max-w-sm"
          />
        </div>
        <div className="second-row mt-2 flex justify-end gap-2">
          <CreateDialog onSuccess={onRefresh || (() => { })} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter(
                  (column) => column.getCanHide()
                )
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header, index) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : (
                        <div
                          onClick={header.column.getToggleSortingHandler()}
                          className="flex items-center gap-2 cursor-pointer hover:text-foreground select-none"
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </div>
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {processing ? (
              Array.from({ length: pagination.pageSize }).map((_, index) => (
                <TableRow key={index}>
                  {table.getAllColumns().map((column) => (
                    <TableCell key={column.id}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <Pagination className="flex items-center justify-between space-x-2 py-4 overflow-auto">
        <Select value={pagination.pageSize.toString()} onValueChange={(value) => {
          table.setPageSize(Number(value))
        }}>
          <SelectTrigger className="w-full max-w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Rows per page</SelectLabel>
              {limitOptions.map((option) => (
                <SelectItem key={option} value={option.toString()}>
                  {option}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => table.previousPage()}
              className={!table.getCanPreviousPage() ? disabledClass : "cursor-pointer"}
            />
          </PaginationItem>

          {Array.from({ length: table.getPageCount() }).map((_, index) => (
            <PaginationItem key={index}>
              <PaginationLink
                isActive={pagination.pageIndex === index}
                onClick={() => table.setPageIndex(index)}
                className="cursor-pointer"
              >
                {index + 1}
              </PaginationLink>
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext
              onClick={() => table.nextPage()}
              className={!table.getCanNextPage() ? disabledClass : "cursor-pointer"}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      <div className="flex-1 text-sm text-muted-foreground mt-2">
        Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()} | {table.getFilteredRowModel().rows.length} total row(s)
      </div>
    </div >
  )
}