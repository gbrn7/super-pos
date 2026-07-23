<?php

use App\Models\StoreSetting;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('store settings table is seeded with default values', function () {
    $this->seed(\Database\Seeders\StoreSettingSeeder::class);

    $this->assertDatabaseHas('store_settings', [
        'name' => 'Super POS',
        'address' => 'Jl. Jenderal Sudirman No. 123, Jakarta',
        'phone' => '021-5551234',
        'email' => 'info@superpos.com',
        'tax_number' => '12.345.678.9-012.000',
        'receipt_footer' => 'Terima kasih atas kunjungan Anda!',
    ]);

    $setting = StoreSetting::first();
    expect($setting)->not->toBeNull();
    expect($setting->name)->toBe('Super POS');
});
