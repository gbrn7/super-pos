<?php

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('can upload custom master product file', function () {
    config(['app.installed' => false]);
    Storage::fake('local');
    $file = UploadedFile::fake()->create('custom_catalog.xlsx', 100, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

    $response = $this->postJson('/setup/upload-master-product', [
        'file' => $file,
    ]);

    $response->assertStatus(200)
        ->assertJson([
            'success' => true,
            'filename' => 'custom_catalog.xlsx',
        ]);

    expect(file_exists(storage_path('app/temp/custom_master_products.xlsx')))->toBeTrue();
});

test('rejects non-excel files', function () {
    config(['app.installed' => false]);
    $file = UploadedFile::fake()->create('document.pdf', 100, 'application/pdf');

    $response = $this->postJson('/setup/upload-master-product', [
        'file' => $file,
    ]);

    $response->assertStatus(422);
});

test('can reset uploaded custom master product file', function () {
    config(['app.installed' => false]);
    $tempPath = storage_path('app/temp/custom_master_products.xlsx');
    if (! is_dir(dirname($tempPath))) {
        mkdir(dirname($tempPath), 0755, true);
    }
    file_put_contents($tempPath, 'fake-content');

    $response = $this->deleteJson('/setup/reset-master-product');

    $response->assertStatus(200)
        ->assertJson(['success' => true]);

    expect(file_exists($tempPath))->toBeFalse();
});
