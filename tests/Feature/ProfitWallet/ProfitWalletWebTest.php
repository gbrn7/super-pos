<?php

use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RoleSeeder::class);
    $this->seed(PermissionSeeder::class);
});

test('profit-wallet page requires authentication', function () {
    $this->get(route('profit-wallet.index'))
        ->assertRedirect(route('login'));
});

test('profit-wallet page requires read-profit-wallet permission', function () {
    $user = User::factory()->create();
    $this->actingAs($user)
        ->get(route('profit-wallet.index'))
        ->assertStatus(403);
});

test('profit-wallet page renders for admin user', function () {
    $admin = User::factory()->create();
    $admin->assignRole(\App\Support\Enums\RoleEnums::ADMIN->value);

    $this->actingAs($admin)
        ->get(route('profit-wallet.index'))
        ->assertOk();
});
