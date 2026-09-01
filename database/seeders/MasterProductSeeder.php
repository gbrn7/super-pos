<?php

namespace Database\Seeders;

use App\Imports\MasterProductImport;
use App\Models\MasterProduct;
use App\Support\Constants\Constants;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Maatwebsite\Excel\Facades\Excel;

class MasterProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        set_time_limit(300);

        $publicFilePath = public_path('imports/master-products-database.xlsx');

        if (! file_exists($publicFilePath)) {
            $this->command?->error("Import file not found: {$publicFilePath}");

            return;
        }

        $driver = DB::getDriverName();
        if ($driver === 'mysql' || $driver === 'mariadb') {
            DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        } elseif ($driver === 'sqlite') {
            DB::statement('PRAGMA foreign_keys = OFF;');
        }

        MasterProduct::truncate();

        if ($driver === 'mysql' || $driver === 'mariadb') {
            DB::statement('SET FOREIGN_KEY_CHECKS=1;');
        } elseif ($driver === 'sqlite') {
            DB::statement('PRAGMA foreign_keys = ON;');
        }

        $data = Excel::toArray(new MasterProductImport, $publicFilePath);
        $chunks = array_chunk($data[0], 1000);

        $now = now();
        $seenBarcodes = [];

        DB::beginTransaction();
        foreach ($chunks as $chunk) {
            $newData = Collection::make();

            foreach ($chunk as $row) {
                $rawBarcode = $row['barcode_opsional'] ?? null;
                $barcode = null;

                if (! empty($rawBarcode) || $rawBarcode === 0 || $rawBarcode === '0') {
                    $trimmed = trim((string) $rawBarcode);
                    if ($trimmed !== '') {
                        $barcode = $trimmed;
                    }
                }

                if ($barcode !== null) {
                    if (isset($seenBarcodes[$barcode])) {
                        continue;
                    }
                    $seenBarcodes[$barcode] = true;
                }

                $newMasterProduct = [
                    'name' => Str::upper($row['nama'] ?? ''),
                    'category_name' => $row['kategori'] ?? Constants::EMPTY_STRING_VALUE,
                    'unit_name' => $row['satuan'] ?? Constants::EMPTY_STRING_VALUE,
                    'barcode' => $barcode,
                    'cost_price' => $row['harga_modal'] ?? Constants::EMPTY_NUMBER_VALUE,
                    'price' => $row['harga_jual'] ?? Constants::EMPTY_NUMBER_VALUE,
                    'desc' => $row['deskripsi_opsional'] ?? Constants::EMPTY_STRING_VALUE,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];

                $newData->push($newMasterProduct);
            }

            if ($newData->isNotEmpty()) {
                MasterProduct::insertOrIgnore($newData->toArray());
            }
        }
        DB::commit();
    }
}
