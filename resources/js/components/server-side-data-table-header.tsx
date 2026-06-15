import type {Column} from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DataTableColumnHeaderProps<
    TData,
    TValue,
> extends React.HTMLAttributes<HTMLDivElement> {
    column: Column<TData, TValue>;
    title: string;
    sortKey?: string;
    orderBy?: string | null;
    order?: string | null;
    onSortChange?: (orderBy: string | null, order: string | null) => void;
}

export function ServerSideDataTableHeader<TData, TValue>({
    column,
    title,
    className,
    sortKey,
    orderBy,
    order,
    onSortChange,
}: DataTableColumnHeaderProps<TData, TValue>) {
    if (!column.getCanSort()) {
        return <div className={cn(className)}>{title}</div>;
    }

    const sortedOrder = sortKey && orderBy === sortKey ? order : null;

    const handleSort = () => {
        if (!sortKey || !onSortChange) {
            column.toggleSorting(column.getIsSorted() === 'asc');

            return;
        }

        if (sortedOrder === 'asc') {
            onSortChange(sortKey, 'desc');

            return;
        }

        if (sortedOrder === 'desc') {
            onSortChange(null, null);

            return;
        }

        onSortChange(sortKey, 'asc');
    };

    return (
        <Button
            variant="ghost"
            onClick={handleSort}
            className={className}
        >
            {title}
            {sortedOrder === 'asc' || (!sortKey && column.getIsSorted() === 'asc') ? (
                <ArrowUp className="ml-2 h-4 w-4" />
            ) : sortedOrder === 'desc' || (!sortKey && column.getIsSorted() === 'desc') ? (
                <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
                <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
        </Button>
    );
}
