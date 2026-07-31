<?php

use App\Exports\MasterProductExport;
use App\Models\MasterProduct;
use App\Services\MasterProductService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Maatwebsite\Excel\Facades\Excel;

uses(RefreshDatabase::class);

it('can export master products to excel', function () {
    Excel::fake();

    MasterProduct::factory()->count(5)->create();

    $service = app(MasterProductService::class);
    $response = $service->exportExcel();

    Excel::assertDownloaded('Masterproducts-export.xlsx', function (MasterProductExport $export) {
        return true;
    });
});
