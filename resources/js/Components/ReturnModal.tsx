import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { RotateCcw, Package, AlertCircle } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { formatRupiah } from '@/lib/format-money';
import type { Transaction } from '@/support/models/transaction';
import axiosInstance from '@/lib/axios';
import { show as apiShowTransaction } from '@/routes/apiTransactions';
import type { ResponseApi } from '@/support/interfaces/response/Response';
import { Skeleton } from '@/components/ui/skeleton';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    transaction: Transaction | null;
}

export default function ReturnModal({ isOpen, onClose, transaction }: Props) {
    if (!transaction) return null;

    const [quantities, setQuantities] = useState<{ [productId: number]: number }>({});
    const [reason, setReason] = useState('');
    const [txDetails, setTxDetails] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const { post, processing } = useForm();

    useEffect(() => {
        if (isOpen && transaction?.id) {
            setQuantities({});
            setReason('');
            
            const existing = transaction.details || (transaction as any).transactionDetails || (transaction as any).transaction_details;
            if (existing && existing.length > 0) {
                setTxDetails(existing);
            } else {
                setLoading(true);
                const apiUrl = apiShowTransaction(transaction.id).url;
                axiosInstance
                    .get<ResponseApi<Transaction>>(apiUrl)
                    .then((res) => {
                        if (res.data.success && res.data.data) {
                            const fetched = res.data.data.details || (res.data.data as any).transactionDetails || (res.data.data as any).transaction_details || [];
                            setTxDetails(fetched);
                        }
                    })
                    .finally(() => setLoading(false));
            }
        }
    }, [isOpen, transaction?.id]);

    const details = txDetails;

    const handleQtyChange = (productId: number, qty: number, max: number) => {
        const validQty = Math.max(0, Math.min(qty, max));
        setQuantities((prev) => ({ ...prev, [productId]: validQty }));
    };

    const handleSelectAllProduct = (productId: number, maxQty: number) => {
        setQuantities((prev) => {
            const currentQty = prev[productId] || 0;
            const newQty = currentQty === maxQty ? 0 : maxQty;
            return { ...prev, [productId]: newQty };
        });
    };

    const isAllTransactionSelected = details.length > 0 && details.every(
        (detail) => (quantities[detail.product_id] || 0) === detail.quantity,
    );

    const handleSelectAllTransaction = () => {
        if (isAllTransactionSelected) {
            setQuantities({});
        } else {
            const allSelected: { [productId: number]: number } = {};
            details.forEach((detail) => {
                allSelected[detail.product_id] = detail.quantity;
            });
            setQuantities(allSelected);
        }
    };

    const calculateTotalRefund = () => {
        return details.reduce((sum, detail) => {
            const qty = quantities[detail.product_id] || 0;
            return sum + qty * Number(detail.price);
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

    const totalRefund = calculateTotalRefund();

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-h-[85vh] overflow-y-auto p-6 sm:max-w-2xl">
                <DialogHeader className="border-b pb-4">
                    <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                        <RotateCcw className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                        Form Retur Barang #{transaction.invoice_number}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 pt-2">
                    {/* Item List Table */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-semibold flex items-center gap-1.5">
                                <Package className="h-4 w-4 text-primary" />
                                Pilih Produk & Kuantitas Retur
                            </Label>
                            {details.length > 0 && !loading && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleSelectAllTransaction}
                                    className="h-7 text-xs"
                                >
                                    {isAllTransactionSelected
                                        ? 'Batal Pilih Semua'
                                        : 'Pilih Semua Transaksi'}
                                </Button>
                            )}
                        </div>
                        <div className="w-full overflow-x-auto rounded-md border">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow>
                                        <TableHead>Produk</TableHead>
                                        <TableHead className="text-right">Harga Satuan</TableHead>
                                        <TableHead className="text-center w-48">Kuantitas Retur</TableHead>
                                        <TableHead className="text-right">Subtotal</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        Array.from({ length: 2 }).map((_, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                                <TableCell><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                                                <TableCell><Skeleton className="h-5 w-16 mx-auto" /></TableCell>
                                                <TableCell><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                                            </TableRow>
                                        ))
                                    ) : details.length > 0 ? (
                                        details.map((detail) => {
                                            const qty = quantities[detail.product_id] || 0;
                                            const subtotal = qty * Number(detail.price);
                                            const maxQty = detail.quantity;
                                            const isMaxSelected = qty === maxQty;

                                            return (
                                                <TableRow key={detail.id}>
                                                    <TableCell className="font-medium">
                                                        {detail.product_name || detail.product?.name || `Produk #${detail.product_id}`}
                                                    </TableCell>
                                                    <TableCell className="text-right text-xs">
                                                        {formatRupiah(detail.price)}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <div className="flex items-center justify-center gap-1.5">
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                max={maxQty}
                                                                value={qty}
                                                                onChange={(e) =>
                                                                    handleQtyChange(
                                                                        detail.product_id,
                                                                        parseInt(e.target.value) || 0,
                                                                        maxQty,
                                                                    )
                                                                }
                                                                className="h-8 w-14 text-center text-xs font-medium"
                                                            />
                                                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                                / {maxQty}
                                                            </span>
                                                            <Button
                                                                type="button"
                                                                variant={isMaxSelected ? "secondary" : "ghost"}
                                                                size="sm"
                                                                onClick={() => handleSelectAllProduct(detail.product_id, maxQty)}
                                                                className="h-7 px-1.5 text-[10px] whitespace-nowrap"
                                                            >
                                                                {isMaxSelected ? 'Batal' : 'Semua'}
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium text-xs">
                                                        {formatRupiah(subtotal)}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-16 text-center text-muted-foreground">
                                                Tidak ada detail produk.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    {/* Reason */}
                    <div className="space-y-1.5">
                        <Label htmlFor="reason" className="text-xs font-medium text-muted-foreground">
                            Alasan Pengembalian (Opsional)
                        </Label>
                        <textarea
                            id="reason"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="flex min-h-16 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            placeholder="Catatan alasan retur (contoh: produk rusak / tukar ukuran)..."
                        />
                    </div>

                    {/* Financial Summary Breakdown */}
                    <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="font-medium text-muted-foreground">Total Dana Refund:</span>
                            <span className="text-lg font-bold text-rose-600 dark:text-rose-400">
                                {formatRupiah(totalRefund)}
                            </span>
                        </div>
                        {totalRefund === 0 && (
                            <p className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                                <AlertCircle className="h-3.5 w-3.5" />
                                Masukkan kuantitas produk minimal 1 unit untuk memproses retur.
                            </p>
                        )}
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            variant="destructive"
                            disabled={processing || totalRefund === 0}
                            className="bg-rose-600 hover:bg-rose-700 text-white"
                        >
                            Proses Retur
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
