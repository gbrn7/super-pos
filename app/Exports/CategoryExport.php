<?php

namespace App\Exports;

use App\Models\Category;
use Illuminate\Database\Eloquent\Builder;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class CategoryExport implements FromQuery, WithChunkReading, WithHeadings, WithMapping
{
    public function query(): Builder
    {
        return Category::query()->select([
            'id',
            'name',
            'desc',
        ]);
    }

    public function headings(): array
    {
        return [
            'Nama',
            'Deskripsi',
        ];
    }

    public function map($category): array
    {
        return [
            $category->name,
            $category->desc,
        ];
    }

    public function chunkSize(): int
    {
        return 2000;
    }
}
