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

class ProfitWalletExport implements FromCollection, ShouldAutoSize, WithHeadings, WithMapping, WithStyles
{
    public function __construct(protected Collection $transactions) {}

    public function collection(): Collection
    {
        return $this->transactions;
    }

    public function headings(): array
    {
        return [
            'Tanggal',
            'Tipe Transaksi',
            'Arah',
            'Jumlah',
            'Saldo Sebelum',
            'Saldo Sesudah',
            'Catatan',
        ];
    }

    public function map($transaction): array
    {
        $formattedDate = $transaction->created_at
            ? Carbon::parse($transaction->created_at)->format('Y-m-d H:i:s')
            : '-';

        $direction = $transaction->type === 'in' ? 'Masuk' : 'Keluar';

        $typeLabels = [
            'sales_profit' => 'Profit Penjualan',
            'disbursement' => 'Disburse Ke Pemilik',
            'capital_withdrawal' => 'Penarikan Modal',
            'sales_return_deduction' => 'Potongan Retur Penjualan',
        ];
        $type = $typeLabels[$transaction->transaction_type] ?? $transaction->transaction_type;

        return [
            $formattedDate,
            $type,
            $direction,
            (float) $transaction->amount,
            (float) $transaction->balance_before,
            (float) $transaction->balance_after,
            $transaction->notes ?? '-',
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
