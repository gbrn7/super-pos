<?php

use App\Models\Product;
use App\Repositories\ProductRepository;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

test('it increments sold quantity via repository', function () {
    $product = Product::factory()->create(['sold_quantity' => 0]);
    $repository = new ProductRepository;

    $repository->incrementSoldQuantity($product, 5);
    expect($product->fresh()->sold_quantity)->toBe(5);

    $repository->incrementSoldQuantity($product, 3);
    expect($product->fresh()->sold_quantity)->toBe(8);
});
