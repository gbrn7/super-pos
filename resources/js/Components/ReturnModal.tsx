import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';

interface Product {
    id: number;
    name: string;
}

interface TransactionDetail {
    id: number;
    product_id: number;
    product: Product;
    quantity: number;
    price: number;
}

interface Transaction {
    id: number;
    invoice_number: string;
    transaction_details: TransactionDetail[];
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    transaction: Transaction | null;
}

export default function ReturnModal({ isOpen, onClose, transaction }: Props) {
    if (!isOpen || !transaction) return null;

    const [quantities, setQuantities] = useState<{ [productId: number]: number }>({});
    const [reason, setReason] = useState('');

    const { post, processing } = useForm();

    const handleQtyChange = (productId: number, qty: number, max: number) => {
        const validQty = Math.max(0, Math.min(qty, max));
        setQuantities(prev => ({ ...prev, [productId]: validQty }));
    };

    const calculateTotalRefund = () => {
        return (transaction.transaction_details || []).reduce((sum, detail) => {
            const qty = quantities[detail.product_id] || 0;
            return sum + (qty * detail.price);
        }, 0);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const items = Object.entries(quantities)
            .filter(([_, qty]) => qty > 0)
            .map(([productId, quantity]) => ({
                product_id: Number(productId),
                quantity,
            }));

        if (items.length === 0) return;

        post('/returns', {
            data: {
                transaction_id: transaction.id,
                items,
                reason,
            },
            onSuccess: () => {
                onClose();
            },
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Retur Barang #{transaction.invoice_number}
                </h3>
                
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <div className="max-h-60 overflow-y-auto space-y-3">
                        {(transaction.transaction_details || []).map((detail) => (
                            <div key={detail.id} className="flex items-center justify-between border-b pb-2">
                                <div>
                                    <p className="font-medium text-sm text-gray-800 dark:text-gray-200">{detail.product?.name || 'Produk'}</p>
                                    <p className="text-xs text-gray-500">Rp {Number(detail.price).toLocaleString()}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        min="0"
                                        max={detail.quantity}
                                        value={quantities[detail.product_id] || 0}
                                        onChange={(e) => handleQtyChange(detail.product_id, parseInt(e.target.value) || 0, detail.quantity)}
                                        className="w-16 rounded border px-2 py-1 text-center text-sm dark:bg-gray-700 dark:text-white"
                                    />
                                    <span className="text-xs text-gray-500">/ {detail.quantity}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">Alasan Retur</label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="mt-1 w-full rounded-md border p-2 text-sm dark:bg-gray-700 dark:text-white"
                            rows={2}
                            placeholder="Catatan alasan pengembalian..."
                        />
                    </div>

                    <div className="flex justify-between items-center pt-2">
                        <span className="text-sm font-semibold dark:text-gray-200">Total Refund:</span>
                        <span className="text-lg font-bold text-rose-600">Rp {calculateTotalRefund().toLocaleString()}</span>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded bg-gray-200 text-gray-700 hover:bg-gray-300">Batal</button>
                        <button type="submit" disabled={processing || calculateTotalRefund() === 0} className="px-4 py-2 text-sm rounded bg-rose-600 text-white font-medium hover:bg-rose-700 disabled:opacity-50">Proses Retur</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
