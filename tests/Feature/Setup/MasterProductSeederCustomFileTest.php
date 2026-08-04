<?php

use Database\Seeders\MasterProductSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;

uses(RefreshDatabase::class);

test('master product seeder prioritizes custom file if exists', function () {
    $tempDir = storage_path('app/temp');
    if (! is_dir($tempDir)) {
        mkdir($tempDir, 0755, true);
    }
    $tempPath = $tempDir.'/custom_master_products.xlsx';

    copy(public_path('imports/master-products-database.xlsx'), $tempPath);

    $seeder = new MasterProductSeeder;
    $seeder->run();

    expect(DB::table('master_products')->count())->toBeGreaterThan(0);
    expect(file_exists($tempPath))->toBeFalse();
});
