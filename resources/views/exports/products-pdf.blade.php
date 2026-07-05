<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="utf-8">
    <title>Export Produk</title>
    <style>
        * {
            box-sizing: border-box;
        }

        body {
            color: #111827;
            font-family: DejaVu Sans, Arial, sans-serif;
            font-size: 12px;
            line-height: 1.4;
            margin: 24px;
        }

        h1 {
            font-size: 20px;
            margin: 0 0 4px;
        }

        .meta {
            color: #6b7280;
            margin: 0 0 18px;
        }

        table {
            border-collapse: collapse;
            width: 100%;
        }

        th,
        td {
            border: 1px solid #d1d5db;
            padding: 8px;
            vertical-align: top;
        }

        th {
            background: #f3f4f6;
            font-weight: 700;
            text-align: left;
        }

        .text-right {
            text-align: right;
        }

        .empty {
            color: #6b7280;
            text-align: center;
        }
    </style>
</head>

<body>
    <h1>Daftar Produk</h1>
    <p class="meta">Dicetak pada {{ now()->format('d/m/Y H:i') }}</p>

    <table>
        <thead>
            <tr>
                <th style="width: 32px;">No</th>
                <th>Nama</th>
                <th>Sku</th>
                <th>Kategori</th>
                <th>Unit</th>
                <th>Stok</th>
                <th>Harga Modal</th>
                <th>Harga</th>
                <th>Deskripsi</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($products as $product)
            <tr>
                <td>{{ $loop->iteration }}</td>
                <td>{{ $product->name }}</td>
                <td>{{ $product->sku }}</td>
                <td>{{ $product->category?->name ?? '-' }}</td>
                <td>{{ $product->unit?->name ?? '-' }}</td>
                <td>{{ $product->stock }}</td>
                <td>Rp {{ number_format((float) $product->cost_price, 0, ',', '.') }}</td>
                <td>Rp {{ number_format((float) $product->price, 0, ',', '.') }}</td>
                <td>{{ $product->desc }}</td>
            </tr>
            @empty
            <tr>
                <td class="empty" colspan="7">Tidak ada produk.</td>
            </tr>
            @endforelse
        </tbody>
    </table>
</body>

</html>