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
            width: 31%;
            margin: 0.5%;
            padding: 4px 2px;
            border: 1px dashed #9ca3af;
            border-radius: 4px;
            box-sizing: border-box;
            text-align: center;
            vertical-align: top;
        }

        .product-name {
            font-weight: bold;
            font-size: 9px;
            height: 18px;
            line-height: 1.1;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .barcode-wrapper {
            margin: 2px auto 1px auto;
            text-align: center;
        }

        .barcode-code {
            font-size: 8px;
            color: #374151;
            font-family: monospace;
            margin-top: 2px;
        }
    </style>
</head>

<body>
    <div class="barcode-container">
        @for ($i = 0; $i < $quantity; $i++)
            <div class="barcode-card">
                <div class="product-name">{{ $product->name }}</div>
                <div class="barcode-wrapper">
                    {!! $barcodeHtml !!}
                </div>
                <div class="barcode-code">{{ $product->barcode }}</div>
            </div>
        @endfor
    </div>
</body>

</html>
