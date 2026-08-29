<?php

use App\Models\Category;
use App\Models\Product;
use App\Models\Unit;
use App\Support\Interfaces\Services\ProductServiceInterface;
use PhpOffice\PhpSpreadsheet\IOFactory;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

it('exports products to excel', function () {
    $category = Category::factory()->create();
    $unit = Unit::create(['name' => 'PCS']);

    $product = Product::factory()->create([
        'category_id' => $category->id,
        'unit_id' => $unit->id,
        'name' => 'Test Product Export',
    ]);

    $service = app(ProductServiceInterface::class);

    $response = $service->exportExcel();

    expect($response)->toBeInstanceOf(BinaryFileResponse::class);

    $spreadsheet = IOFactory::load($response->getFile()->getPathname());
    $rows = $spreadsheet->getActiveSheet()->toArray();

    expect($rows[0])->toContain('SKU');
    expect($rows[1][0])->toBe($product->name);
});

it('exports products to pdf', function () {
    $category = Category::factory()->create();
    $unit = Unit::create(['name' => 'PCS']);

    $product = Product::factory()->create([
        'category_id' => $category->id,
        'unit_id' => $unit->id,
        'name' => 'Test Product PDF Export',
    ]);

    $service = app(ProductServiceInterface::class);

    $response = $service->exportPdf();

    expect($response)->toBeInstanceOf(BinaryFileResponse::class);

    $content = file_get_contents($response->getFile()->getPathname());

    expect($content)->not->toBeEmpty();
    expect(str_starts_with($content, '%PDF'))->toBeTrue();
});
