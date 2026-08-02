<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="utf-8">
    <title>Barcode {{ $product->name }}</title>
    <style>
        * {
            box-sizing: border-box;
        }

        @page {
            margin: 15px;
        }

        body {
            font-family: DejaVu Sans, Arial, sans-serif;
            font-size: 10px;
            margin: 0;
            padding: 0;
            color: #111827;
        }

        .barcode-container {
            width: 100%;
        }

        .barcode-card {
            display: inline-block;
            width: 30%;
            margin: 1%;
            padding: 8px;
            border: 1px dashed #9ca3af;
            border-radius: 4px;
            box-sizing: border-box;
            text-align: center;
            vertical-align: top;
        }

        .product-name {
            font-weight: bold;
            font-size: 10px;
            height: 24px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .barcode-text {
            font-size: 18px;
            font-family: 'Libre Barcode 128', 'Code 128', 'DejaVu Sans', monospace;
            letter-spacing: 2px;
            margin: 6px 0 2px 0;
        }

        .barcode-code {
            font-size: 9px;
            color: #4b5563;
        }

        .product-price {
            font-weight: bold;
            font-size: 11px;
            margin-top: 4px;
            color: #059669;
        }
    </style>
</head>

<body>
    <div class="barcode-container">
        @for ($i = 0; $i < $quantity; $i++)
            <div class="barcode-card">
                <div class="product-name">{{ $product->name }}</div>
                <div class="barcode-code">SKU: {{ $product->sku }}</div>
                <div class="barcode-text">*{{ $product->barcode }}*</div>
                <div class="barcode-code">{{ $product->barcode }}</div>
                <div class="product-price">Rp {{ number_format((float) $product->price, 0, ',', '.') }}</div>
            </div>
        @endfor
    </div>
</body>

</html>
