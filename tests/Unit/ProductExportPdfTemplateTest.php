<?php

use App\Models\Category;
use App\Models\Product;
use App\Models\Unit;
use Illuminate\Support\Facades\View;
use Tests\TestCase;

uses(TestCase::class);

test('product export pdf template displays product fields', function () {
    $product = new Product([
        'name' => 'Air Mineral',
        'stock' => 25,
        'price' => 5000,
        'cost_price' => 3500,
    ]);

    $product->setRelation('category', new Category([
        'name' => 'Minuman',
    ]));
    $product->setRelation('unit', new Unit([
        'name' => 'Botol',
    ]));

    $html = View::make('exports.products-pdf', [
        'products' => collect([$product]),
    ])->render();

    expect($html)
        ->toContain('Air Mineral')
        ->toContain('Minuman')
        ->toContain('Botol')
        ->toContain('25')
        ->toContain('5.000,00')
        ->toContain('3.500,00');
});
