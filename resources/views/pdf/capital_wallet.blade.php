<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Laporan Dompet Modal</title>
    <style>
        body { font-family: Arial, sans-serif; font-size: 11px; color: #333333; margin: 0; padding: 0; }
        .header { margin-bottom: 20px; border-bottom: 2px solid #0f172a; padding-bottom: 10px; }
        .header table { width: 100%; }
        .store-name { font-size: 18px; font-weight: bold; color: #0f172a; }
        .report-title { font-size: 14px; font-weight: bold; text-align: right; color: #475569; }
        .meta-info { margin-bottom: 15px; font-size: 10px; color: #64748b; }
        table.data-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        table.data-table th { background-color: #0f172a; color: #ffffff; font-weight: bold; text-align: left; padding: 8px 6px; font-size: 10px; }
        table.data-table td { padding: 6px; border-bottom: 1px solid #e2e8f0; font-size: 10px; }
        table.data-table tr:nth-child(even) { background-color: #f8fafc; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .summary-box { width: 40%; float: right; border: 1px solid #cbd5e1; padding: 10px; border-radius: 4px; background-color: #f8fafc; }
        .summary-table { width: 100%; }
        .summary-table td { padding: 3px 0; font-size: 10px; }
        .font-bold { font-weight: bold; }
        .clearfix::after { content: ""; clear: both; display: table; }
        .footer { margin-top: 30px; font-size: 9px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 10px; }
    </style>
</head>
<body>
    <div class="header">
        <table>
            <tr>
                <td>
                    <div class="store-name">{{ $storeSetting->name ?? 'PRAKTIS POS' }}</div>
                    <div>{{ $storeSetting->address ?? '' }}</div>
                    <div>{{ $storeSetting->phone ?? '' }}</div>
                </td>
                <td class="report-title">
                    LAPORAN DOMPET MODAL
                    <div style="font-size: 10px; font-weight: normal; margin-top: 4px;">
                        Periode: {{ $startDate ?? 'Semua' }} - {{ $endDate ?? 'Semua' }}
                    </div>
                </td>
            </tr>
        </table>
    </div>

    <div class="meta-info">Tanggal Cetak: {{ $printedAt }}</div>

    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 4%;">No</th>
                <th style="width: 16%;">Tanggal</th>
                <th style="width: 20%;">Tipe</th>
                <th style="width: 10%;">Arah</th>
                <th style="width: 15%;" class="text-right">Jumlah</th>
                <th style="width: 15%;" class="text-right">Saldo Sebelum</th>
                <th style="width: 15%;" class="text-right">Saldo Sesudah</th>
            </tr>
        </thead>
        <tbody>
            @forelse($transactions as $index => $tx)
                @php
                    $typeLabels = [
                        'sales_capital_recovery' => 'Pemulihan Modal',
                        'reinvestment' => 'Reinvestasi Profit',
                        'capital_injection' => 'Suntikan Modal',
                        'capital_drawdown' => 'Tarik Modal',
                        'product_purchase' => 'Belanja Stok',
                        'sales_return_deduction' => 'Potongan Retur',
                    ];
                @endphp
                <tr>
                    <td class="text-center">{{ $index + 1 }}</td>
                    <td>{{ $tx->created_at ? \Carbon\Carbon::parse($tx->created_at)->format('d/m/Y H:i') : '-' }}</td>
                    <td>{{ $typeLabels[$tx->transaction_type] ?? $tx->transaction_type }}</td>
                    <td>{{ $tx->type === 'in' ? 'Masuk' : 'Keluar' }}</td>
                    <td class="text-right">Rp {{ number_format($tx->amount, 0, ',', '.') }}</td>
                    <td class="text-right">Rp {{ number_format($tx->balance_before, 0, ',', '.') }}</td>
                    <td class="text-right font-bold">Rp {{ number_format($tx->balance_after, 0, ',', '.') }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="7" class="text-center" style="padding: 20px;">Tidak ada riwayat transaksi.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <div class="clearfix">
        <div class="summary-box">
            <table class="summary-table">
                <tr>
                    <td>Total Dana Masuk:</td>
                    <td class="text-right font-bold" style="color: #15803d;">Rp {{ number_format($summary['total_inflow'] ?? 0, 0, ',', '.') }}</td>
                </tr>
                <tr>
                    <td>Total Dana Keluar:</td>
                    <td class="text-right font-bold" style="color: #dc2626;">Rp {{ number_format($summary['total_outflow'] ?? 0, 0, ',', '.') }}</td>
                </tr>
                <tr style="border-top: 1px solid #cbd5e1;">
                    <td class="font-bold">Saldo Akhir Dompet:</td>
                    <td class="text-right font-bold" style="color: #0f172a; font-size: 11px;">Rp {{ number_format($summary['balance'] ?? 0, 0, ',', '.') }}</td>
                </tr>
            </table>
        </div>
    </div>

    <div class="footer">Dicetak secara otomatis oleh sistem {{ $storeSetting->name ?? 'PRAKTIS POS' }}</div>
</body>
</html>
