<?php

namespace App\Imports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToArray;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class MasterProductImport implements ToArray, ToCollection, WithHeadingRow
{
    public function collection(Collection $collection) {}

    public function array(array $arrat) {}
}
