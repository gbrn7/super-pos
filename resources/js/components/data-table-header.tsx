import { type Column } from "@tanstack/react-table"
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronsUpDown, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>
  title: string
}

export function DataTableHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>
  }

  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      className={className}
    >
      Deskripsi
      {column.getIsSorted() === "asc"
        ? <ArrowUp className="ml-2 h-4 w-4" />
        : column.getIsSorted() === "desc"
          ? <ArrowDown className="ml-2 h-4 w-4" />
          : <ArrowUpDown className="ml-2 h-4 w-4" />}
    </Button>
  )
}
