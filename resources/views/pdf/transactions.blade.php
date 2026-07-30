<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Laporan Transaksi</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 11px;
            color: #333333;
            margin: 0;
            padding: 0;
        }
        .header {
            margin-bottom: 20px;
            border-bottom: 2px solid #0f172a;
            padding-bottom: 10px;
        }
        .header table {
            width: 100%;
        }
        .store-name {
            font-size: 18px;
            font-weight: bold;
            color: #0f172a;
        }
        .report-title {
            font-size: 14px;
            font-weight: bold;
            text-align: right;
            color: #475569;
        }
        .meta-info {
            margin-bottom: 15px;
            font-size: 10px;
            color: #64748b;
        }
        table.data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        table.data-table th {
            background-color: #0f172a;
            color: #ffffff;
            font-weight: bold;
            text-align: left;
            padding: 8px 6px;
            font-size: 10px;
        }
        table.data-table td {
            padding: 6px;
            border-bottom: 1px solid #e2e8f0;
            font-size: 10px;
        }
        table.data-table tr:nth-child(even) {
            background-color: #f8fafc;
        }
        .text-right {
            text-align: right;
        }
        .text-center {
            text-align: center;
        }
        .summary-box {
            width: 40%;
            float: right;
            border: 1px solid #cbd5e1;
            padding: 10px;
            border-radius: 4px;
            background-color: #f8fafc;
        }
        .summary-table {
            width: 100%;
        }
        .summary-table td {
            padding: 3px 0;
            font-size: 10px;
        }
        .font-bold {
            font-weight: bold;
        }
        .clearfix::after {
            content: "";
            clear: both;
            display: table;
        }
        .footer {
            margin-top: 30px;
            font-size: 9px;
            color: #94a3b8;
            text-align: center;
            border-top: 1px solid #e2e8f0;
            padding-top: 10px;
        }
    </style>
</head>
<body>
    <div class="header">
        <table>
            <tr>
                <td>
                    <div class="store-name">{{ $storeSetting->name ?? 'SUPER POS' }}</div>
                    <div>{{ $storeSetting->address ?? '' }}</div>
                    <div>{{ $storeSetting->phone ?? '' }}</div>
                </td>
                <td class="report-title">
                    LAPORAN TRANSAKSI
                    <div style="font-size: 10px; font-weight: normal; margin-top: 4px;">
                        Periode: {{ $startDate ?? 'Semua' }} - {{ $endDate ?? 'Semua' }}
                    </div>
                </td>
            </tr>
        </table>
    </div>

    <div class="meta-info">
        Tanggal Cetak: {{ $printedAt }}
    </div>

    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 4%;">No</th>
                <th style="width: 16%;">No. Invoice</th>
                <th style="width: 12%;">Tanggal</th>
                <th style="width: 12%;">Kasir</th>
                <th style="width: 10%;">Metode</th>
                <th style="width: 11%;" class="text-right">Subtotal</th>
                <th style="width: 8%;" class="text-right">Diskon</th>
                <th style="width: 11%;" class="text-right">Total</th>
                <th style="width: 11%;" class="text-right">Retur</th>
                <th style="width: 15%;" class="text-right">Total Bersih</th>
            </tr>
        </thead>
        <tbody>
            @forelse($transactions as $index => $trx)
                @php
                    $trxTotal = $trx->total_amount ?? 0;
                    $trxDiscount = $trx->discount_amount ?? 0;
                    $trxSubtotal = $trxTotal + $trxDiscount;
                    $trxReturn = $trx->returns ? $trx->returns->sum('total_refund_amount') : 0;
                    $trxNet = $trxTotal - $trxReturn;
                @endphp
                <tr>
                    <td class="text-center">{{ $index + 1 }}</td>
                    <td class="font-bold">{{ $trx->invoice_number }}</td>
                    <td>
                        @if($trx->created_at)
                            {{ is_numeric($trx->created_at) ? date('d/m/Y H:i', (int)$trx->created_at) : \Carbon\Carbon::parse($trx->created_at)->format('d/m/Y H:i') }}
                        @else
                            -
                        @endif
                    </td>
                    <td>{{ $trx->user?->name ?? '-' }}</td>
                    <td>{{ $trx->paymentMethod?->name ?? '-' }}</td>
                    <td class="text-right">Rp {{ number_format($trxSubtotal, 0, ',', '.') }}</td>
                    <td class="text-right">Rp {{ number_format($trxDiscount, 0, ',', '.') }}</td>
                    <td class="text-right">Rp {{ number_format($trxTotal, 0, ',', '.') }}</td>
                    <td class="text-right" style="color: #d97706;">
                        {{ $trxReturn > 0 ? 'Rp ' . number_format($trxReturn, 0, ',', '.') : '-' }}
                    </td>
                    <td class="text-right font-bold">Rp {{ number_format($trxNet, 0, ',', '.') }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="10" class="text-center" style="padding: 20px;">Tidak ada data transaksi.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    @php
        $grossSales = $transactions->sum('total_amount');
        $totalDiscounts = $transactions->sum('discount_amount');
        $totalReturns = 0;
        $grossProfit = 0;

        foreach ($transactions as $trx) {
            if ($trx->returns) {
                $totalReturns += $trx->returns->sum('total_refund_amount');
            }
            if ($trx->transactionDetails) {
                foreach ($trx->transactionDetails as $detail) {
                    $grossProfit += ($detail->price - $detail->cost_price - $detail->discount) * $detail->quantity;
                }
            }
        }

        $netSales = $grossSales - $totalReturns;
        $netProfit = $grossProfit - $totalReturns;
    @endphp

    <div class="clearfix">
        <div class="summary-box">
            <table class="summary-table">
                <tr>
                    <td>Total Transaksi:</td>
                    <td class="text-right font-bold">{{ count($transactions) }}</td>
                </tr>
                <tr>
                    <td>Penjualan Kotor:</td>
                    <td class="text-right font-bold">Rp {{ number_format($grossSales, 0, ',', '.') }}</td>
                </tr>
                <tr>
                    <td>Total Diskon:</td>
                    <td class="text-right font-bold" style="color: #dc2626;">
                        {{ $totalDiscounts > 0 ? '- Rp ' . number_format($totalDiscounts, 0, ',', '.') : 'Rp 0' }}
                    </td>
                </tr>
                <tr>
                    <td>Total Retur:</td>
                    <td class="text-right font-bold" style="color: #dc2626;">
                        {{ $totalReturns > 0 ? '- Rp ' . number_format($totalReturns, 0, ',', '.') : 'Rp 0' }}
                    </td>
                </tr>
                <tr style="border-top: 1px solid #cbd5e1;">
                    <td class="font-bold">Penjualan Bersih:</td>
                    <td class="text-right font-bold" style="color: #0f172a; font-size: 11px;">
                        Rp {{ number_format($netSales, 0, ',', '.') }}
                    </td>
                </tr>
                <tr>
                    <td class="font-bold">Keuntungan Bersih:</td>
                    <td class="text-right font-bold" style="color: #15803d; font-size: 11px;">
                        Rp {{ number_format($netProfit, 0, ',', '.') }}
                    </td>
                </tr>
            </table>
        </div>
    </div>

    <div class="footer">
        Dicetak secara otomatis oleh sistem {{ $storeSetting->name ?? 'Super POS' }}
    </div>
</body>
</html>
