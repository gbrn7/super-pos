<?php

use App\Models\User;
use App\Support\Enums\RoleEnums;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->role = Role::firstOrCreate(['name' => RoleEnums::SUPER_ADMIN->value]);
    $this->user = User::factory()->create();
    $this->user->assignRole($this->role);
});

test('super admin can download sql database export', function () {
    $response = $this
        ->actingAs($this->user)
        ->get(route('data-management.export-sql'));

    $response->assertOk();
    $response->assertHeader('Content-Type', 'text/plain; charset=UTF-8');
    $response->assertHeader('Content-Disposition', 'attachment; filename="praktis_pos_backup_'.now()->format('Y-m-d').'.sql"');
});

test('non super admin cannot download sql database export', function () {
    $regularUser = User::factory()->create();

    $response = $this
        ->actingAs($regularUser)
        ->get(route('data-management.export-sql'));

    $response->assertForbidden();
});
