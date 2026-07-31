<?php

namespace App\Exports;

use App\Models\Unit;
use Illuminate\Database\Eloquent\Builder;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class UnitExport implements FromQuery, WithChunkReading, WithHeadings, WithMapping
{
    public function query(): Builder
    {
        return Unit::query()->select([
            'id',
            'name',
        ]);
    }

    public function headings(): array
    {
        return [
            'Nama',
        ];
    }

    public function map($unit): array
    {
        return [
            $unit->name,
        ];
    }

    public function chunkSize(): int
    {
        return 2000;
    }
}
