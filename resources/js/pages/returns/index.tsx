import { Head } from '@inertiajs/react';
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import HeaderContent from '@/components/header-content';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { columns, type ReturnItem } from './columns';
import { DetailDialog } from './dialog-modal/detail-dialog';

interface Props {
    returns: {
        data: ReturnItem[];
        current_page: number;
        last_page: number;
        total: number;
    };
}

export default function Index({ returns }: Props) {
    const { t } = useTranslation();
    const [selectedReturn, setSelectedReturn] = useState<ReturnItem | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);

    const handleDetailClick = (item: ReturnItem) => {
        setSelectedReturn(item);
        setDetailOpen(true);
    };

    const tableColumns = columns({ onDetailClick: handleDetailClick });

    const table = useReactTable({
        data: returns?.data || [],
        columns: tableColumns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <>
            <Head title={t('page.return.page_name', 'Retur Barang')} />
            <div className="mb-16 flex h-full flex-1 flex-col overflow-x-auto rounded-xl p-4">
                <HeaderContent>
                    {t('page.return.page_name', 'Retur Barang')}
                </HeaderContent>

                <div className="rounded-2xl border bg-card p-3 mt-4">
                    <div className="overflow-x-auto rounded-md border">
                        <Table>
                            <TableHeader>
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => (
                                            <TableHead key={header.id}>
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                          header.column.columnDef.header,
                                                          header.getContext(),
                                                      )}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody>
                                {table.getRowModel().rows?.length ? (
                                    table.getRowModel().rows.map((row) => (
                                        <TableRow
                                            key={row.id}
                                            data-state={row.getIsSelected() && 'selected'}
                                        >
                                            {row.getVisibleCells().map((cell) => (
                                                <TableCell key={cell.id}>
                                                    {flexRender(
                                                        cell.column.columnDef.cell,
                                                        cell.getContext(),
                                                    )}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={tableColumns.length}
                                            className="h-28 text-center text-muted-foreground"
                                        >
                                            {t('page.return.no_data', 'Belum ada riwayat retur barang.')}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Detail Modal */}
                    <DetailDialog
                        isOpen={detailOpen}
                        returnItem={selectedReturn}
                        onOpenChange={setDetailOpen}
                    />
                </div>
            </div>
        </>
    );
}

Index.layout = {
    breadcrumbs: [
        {
            title: 'Retur Barang',
            href: '/returns',
        },
    ],
};
