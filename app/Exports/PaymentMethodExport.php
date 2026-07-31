<?php

namespace App\Exports;

use App\Models\PaymentMethod;
use Illuminate\Database\Eloquent\Builder;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class PaymentMethodExport implements FromQuery, WithChunkReading, WithHeadings, WithMapping
{
    public function query(): Builder
    {
        return PaymentMethod::query()->select([
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

    public function map($paymentMethod): array
    {
        return [
            $paymentMethod->name,
            $paymentMethod->desc,
        ];
    }

    public function chunkSize(): int
    {
        return 2000;
    }
}
