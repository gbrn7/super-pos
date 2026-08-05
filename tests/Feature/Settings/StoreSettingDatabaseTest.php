<?php

use App\Models\StoreSetting;
use Database\Seeders\StoreSettingSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('store settings table is seeded with default values', function () {
    $this->seed(StoreSettingSeeder::class);

    $this->assertDatabaseHas('store_settings', [
        'name' => 'PRAKTIS POS',
        'address' => 'Jl. Jenderal Sudirman No. 123, Jakarta',
        'phone' => '021-5551234',
        'email' => 'info@praktispos.com',
        'receipt_footer' => 'Barang yang sudah dibeli tidak dapat ditukar',
    ]);

    $setting = StoreSetting::first();
    expect($setting)->not->toBeNull();
    expect($setting->name)->toBe('PRAKTIS POS');
});
