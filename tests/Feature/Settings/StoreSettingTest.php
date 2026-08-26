<?php

use App\Models\StoreSetting;
use App\Models\User;
use App\Support\Enums\RoleEnums;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->role = Role::firstOrCreate(['name' => RoleEnums::ADMIN->value]);
    $this->user = User::factory()->create();
    $this->user->assignRole($this->role);
});

test('store setting page is displayed for authorized user', function () {
    $storeSetting = StoreSetting::factory()->create();

    $response = $this
        ->actingAs($this->user)
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

test('store setting page is forbidden for unauthorized user', function () {
    $unauthorizedUser = User::factory()->create();
    $storeSetting = StoreSetting::factory()->create();

    $response = $this
        ->actingAs($unauthorizedUser)
        ->get(route('store.edit'));

    $response->assertForbidden();
});

test('store setting can be updated', function () {
    StoreSetting::factory()->create();

    $response = $this
        ->actingAs($this->user)
        ->patch(route('store.update'), [
            'name' => 'Updated Store Name',
            'address' => 'Updated Address Road 456',
            'phone' => '081234567890',
            'email' => 'updated@store.com',
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
    expect($setting->receipt_footer)->toBe('New Footer Text');
});

test('store setting update requires validation', function () {
    StoreSetting::factory()->create();

    $response = $this
        ->actingAs($this->user)
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
