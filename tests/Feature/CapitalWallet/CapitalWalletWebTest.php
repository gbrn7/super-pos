<?php

use App\Models\User;
use App\Support\Enums\RoleEnums;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RoleSeeder::class);
    $this->seed(PermissionSeeder::class);
});

test('capital-wallet page requires authentication', function () {
    $this->get(route('capital-wallet.index'))
        ->assertRedirect(route('login'));
});

test('capital-wallet page requires read-capital-wallet permission', function () {
    $user = User::factory()->create();
    $this->actingAs($user)
        ->get(route('capital-wallet.index'))
        ->assertStatus(403);
});

test('capital-wallet page renders for admin user', function () {
    $admin = User::factory()->create();
    $admin->assignRole(RoleEnums::ADMIN->value);

    $this->actingAs($admin)
        ->get(route('capital-wallet.index'))
        ->assertOk();
});
