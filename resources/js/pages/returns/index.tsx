import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table';
import HeaderContent from '@/components/header-content';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { columns, type ReturnItem } from './columns';

interface Props {
    returns: {
        data: ReturnItem[];
        current_page: number;
        last_page: number;
        total: number;
    };
}

export default function Index({ returns }: Props) {
    const [selectedReturn, setSelectedReturn] = useState<ReturnItem | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);

    const handleDetailClick = (item: ReturnItem) => {
        setSelectedReturn(item);
        setDetailOpen(true);
    };

    const tableColumns = columns(handleDetailClick);

    const table = useReactTable({
        data: returns?.data || [],
        columns: tableColumns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <>
            <Head title="Retur Barang" />
            <div className="mb-16 flex h-full flex-1 flex-col overflow-x-auto rounded-xl p-4">
                <HeaderContent>
                    Retur Barang
                </HeaderContent>

                <div className="rounded-md border bg-white dark:bg-gray-800 shadow-sm mt-4">
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
                                        className="h-24 text-center text-gray-500"
                                    >
                                        Belum ada riwayat retur barang.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Detail Dialog Modal */}
                <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Detail Retur {selectedReturn?.return_number}</DialogTitle>
                        </DialogHeader>

                        {selectedReturn && (
                            <div className="space-y-4 text-sm mt-2">
                                <div className="grid grid-cols-2 gap-2 border-b pb-3">
                                    <div>
                                        <p className="text-xs text-gray-500">No. Struk</p>
                                        <p className="font-semibold">{selectedReturn.transaction?.invoice_number || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Kasir</p>
                                        <p className="font-semibold">{selectedReturn.user?.name || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Tanggal</p>
                                        <p className="font-semibold">{new Date(selectedReturn.created_at).toLocaleString('id-ID')}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Total Refund</p>
                                        <p className="font-bold text-rose-600">Rp {Number(selectedReturn.total_refund_amount).toLocaleString('id-ID')}</p>
                                    </div>
                                </div>

                                <div>
                                    <p className="font-semibold mb-2">Item Dikembalikan:</p>
                                    <div className="space-y-2 max-h-48 overflow-y-auto">
                                        {(selectedReturn.details || []).map((detail) => (
                                            <div key={detail.id} className="flex justify-between items-center text-xs bg-gray-50 dark:bg-gray-700/50 p-2 rounded">
                                                <div>
                                                    <p className="font-medium text-gray-800 dark:text-gray-200">{detail.product?.name || 'Produk'}</p>
                                                    <p className="text-gray-500">{detail.quantity} x Rp {Number(detail.price_per_unit).toLocaleString('id-ID')}</p>
                                                </div>
                                                <span className="font-semibold">Rp {Number(detail.subtotal).toLocaleString('id-ID')}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {selectedReturn.reason && (
                                    <div className="border-t pt-2">
                                        <p className="text-xs text-gray-500">Alasan Retur:</p>
                                        <p className="text-gray-700 dark:text-gray-300 italic">{selectedReturn.reason}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
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
