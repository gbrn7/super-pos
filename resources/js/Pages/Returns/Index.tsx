import React from 'react';
import { Head } from '@inertiajs/react';

interface ReturnDetail {
    id: number;
    product: { name: string };
    quantity: number;
    price_per_unit: number;
    subtotal: number;
}

interface ReturnItem {
    id: number;
    return_number: string;
    transaction: { invoice_number: string };
    user: { name: string };
    total_refund_amount: number;
    reason: string;
    created_at: string;
    details: ReturnDetail[];
}

export default function Index({ returns }: { returns: { data: ReturnItem[] } }) {
    return (
        <div className="p-6">
            <Head title="Riwayat Retur Barang" />
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Riwayat Retur Barang</h1>
            </div>

            <div className="bg-white rounded-xl shadow overflow-hidden dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th className="px-6 py-3">No. Retur</th>
                            <th className="px-6 py-3">No. Struk</th>
                            <th className="px-6 py-3">Kasir</th>
                            <th className="px-6 py-3">Total Refund</th>
                            <th className="px-6 py-3">Alasan</th>
                            <th className="px-6 py-3">Tanggal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {returns?.data && returns.data.length > 0 ? (
                            returns.data.map((item) => (
                                <tr key={item.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{item.return_number}</td>
                                    <td className="px-6 py-4">{item.transaction?.invoice_number || '-'}</td>
                                    <td className="px-6 py-4">{item.user?.name || '-'}</td>
                                    <td className="px-6 py-4 font-bold text-rose-600 dark:text-rose-400">Rp {Number(item.total_refund_amount).toLocaleString()}</td>
                                    <td className="px-6 py-4">{item.reason || '-'}</td>
                                    <td className="px-6 py-4">{new Date(item.created_at).toLocaleString()}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="text-center py-8 text-gray-400">Belum ada riwayat retur barang.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
