<?php

namespace App\Exports;

use App\Models\MasterProduct;
use App\Support\Constants\Constants;
use Illuminate\Database\Eloquent\Builder;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class MasterProductExport implements FromQuery, WithChunkReading, WithHeadings, WithMapping
{
    public function query(): Builder
    {
        return MasterProduct::query()->select([
            'id',
            'name',
            'category_name',
            'unit_name',
            'barcode',
            'cost_price',
            'price',
            'desc',
        ]);
    }

    public function headings(): array
    {
        return [
            'Nama',
            'Kategori',
            'Satuan',
            'Barcode (Opsional)',
            'Harga Modal',
            'Harga Jual',
            'Deskripsi (Opsional)',
        ];
    }

    public function map($masterProduct): array
    {
        return [
            $masterProduct->name,
            $masterProduct->category_name ?? Constants::EMPTY_STRING_VALUE,
            $masterProduct->unit_name ?? Constants::EMPTY_STRING_VALUE,
            $masterProduct->barcode,
            $masterProduct->cost_price,
            $masterProduct->price,
            $masterProduct->desc,
        ];
    }

    public function chunkSize(): int
    {
        return 2000;
    }
}
