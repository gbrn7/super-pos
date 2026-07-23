<?php

use App\Models\StoreSetting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('store setting page is displayed for authenticated user', function () {
    $user = User::factory()->create();
    $storeSetting = StoreSetting::factory()->create();

    $response = $this
        ->actingAs($user)
        ->get(route('store.edit'));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('settings/store')
        ->has('storeSetting', fn (Assert $page) => $page
            ->where('name', $storeSetting->name)
            ->where('address', $storeSetting->address)
            ->where('phone', $storeSetting->phone)
            ->etc()
        )
    );
});

test('store setting can be updated', function () {
    $user = User::factory()->create();
    StoreSetting::factory()->create();

    $response = $this
        ->actingAs($user)
        ->patch(route('store.update'), [
            'name' => 'Updated Store Name',
            'address' => 'Updated Address Road 456',
            'phone' => '081234567890',
            'email' => 'updated@store.com',
            'tax_number' => '99.999.999.9-999.000',
            'receipt_header' => 'New Header Text',
            'receipt_footer' => 'New Footer Text',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('store.edit'));

    $setting = StoreSetting::first();
    expect($setting->name)->toBe('Updated Store Name');
    expect($setting->address)->toBe('Updated Address Road 456');
    expect($setting->phone)->toBe('081234567890');
    expect($setting->email)->toBe('updated@store.com');
    expect($setting->tax_number)->toBe('99.999.999.9-999.000');
    expect($setting->receipt_header)->toBe('New Header Text');
    expect($setting->receipt_footer)->toBe('New Footer Text');
});

test('store setting update requires validation', function () {
    $user = User::factory()->create();
    StoreSetting::factory()->create();

    $response = $this
        ->actingAs($user)
        ->from(route('store.edit'))
        ->patch(route('store.update'), [
            'name' => '',
            'address' => '',
            'phone' => '',
        ]);

    $response
        ->assertSessionHasErrors(['name', 'address', 'phone'])
        ->assertRedirect(route('store.edit'));
});
