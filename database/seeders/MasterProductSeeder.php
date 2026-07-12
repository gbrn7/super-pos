<?php

namespace Database\Seeders;

use App\Imports\MasterProductImport;
use App\Models\MasterProduct;
use App\Support\Constants\Constants;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Str;

class MasterProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $publicFilePath = public_path('imports/master-products-database.xlsx');

        if (! file_exists($publicFilePath)) {
            $this->command?->error("Import file not found: {$publicFilePath}");

            return;
        }


        $data = Excel::toArray(new MasterProductImport, $publicFilePath);
        $chunks = array_chunk($data[0], 1000);

        $unixTime = Carbon::now()->unix();

        DB::beginTransaction();
        foreach ($chunks as $chunk) {
            $newData = Collection::make();

            foreach ($chunk as $row) {
                $newMasterProduct = [
                    'name' => Str::upper($row['nama']),
                    'category_name' => $row['kategori'] ?? Constants::EMPTY_STRING_VALUE,
                    'unit_name' => $row['satuan'] ?? Constants::EMPTY_STRING_VALUE,
                    'barcode' => $row['barcode_opsional'] ?? Constants::EMPTY_STRING_VALUE,
                    'cost_price' => $row['harga_modal'] ?? Constants::EMPTY_NUMBER_VALUE,
                    'price' => $row['harga_jual'] ?? Constants::EMPTY_NUMBER_VALUE,
                    'desc' => $row['deskripsi_opsional'] ?? Constants::EMPTY_STRING_VALUE,
                    'created_at' => $unixTime,
                    'updated_at' => $unixTime,
                ];


                $newData->push($newMasterProduct);
            }
            MasterProduct::insert($newData->toArray());
        }
        DB::commit();
    }
}
