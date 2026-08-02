<?php

namespace App\Exports;

use Carbon\Carbon;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class TransactionsExport implements FromCollection, ShouldAutoSize, WithHeadings, WithMapping, WithStyles
{
    public function __construct(protected Collection $transactions) {}

    public function collection(): Collection
    {
        return $this->transactions;
    }

    public function headings(): array
    {
        return [
            'No. Invoice',
            'Tanggal',
            'Kasir / Petugas',
            'Metode Pembayaran',
            'Subtotal',
            'Diskon',
            'Total Transaksi',
            'Total Retur',
            'Total Bersih',
            'Jumlah Item',
        ];
    }

    public function map($transaction): array
    {
        $formattedDate = $transaction->created_at
            ? Carbon::parse($transaction->created_at)->format('Y-m-d H:i:s')
            : '-';

        $totalAmount = (float) ($transaction->total_amount ?? 0);
        $discountAmount = (float) ($transaction->discount_amount ?? 0);
        $subtotal = $totalAmount + $discountAmount;
        $totalReturn = (float) ($transaction->returns?->sum('total_refund_amount') ?? 0);
        $netTotal = $totalAmount - $totalReturn;

        return [
            $transaction->invoice_number,
            $formattedDate,
            $transaction->user?->name ?? '-',
            $transaction->paymentMethod?->name ?? '-',
            $subtotal,
            $discountAmount,
            $totalAmount,
            $totalReturn,
            $netTotal,
            $transaction->transactionDetails?->sum('quantity') ?? 0,
        ];
    }

    public function styles(Worksheet $sheet): array
    {
        return [
            1 => [
                'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => '1E293B'],
                ],
            ],
        ];
    }
}
