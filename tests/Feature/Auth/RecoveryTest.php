<?php

use App\Models\User;
use App\Support\Enums\RoleEnums;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

test('verifies correct recovery code and sets session token', function () {
    Config::set('auth.recovery_code', 'secret-recovery-code-123');

    $response = $this->postJson('/api/recovery/verify-code', [
        'recovery_code' => 'secret-recovery-code-123',
    ]);

    $response->assertOk()
        ->assertJson(['success' => true]);

    expect(session('recovery_verified'))->toBeTrue();
});

test('rejects invalid recovery code', function () {
    Config::set('auth.recovery_code', 'secret-recovery-code-123');

    $response = $this->postJson('/api/recovery/verify-code', [
        'recovery_code' => 'wrong-code',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['recovery_code']);
});

test('creates superadmin and logs in when session is verified', function () {
    Role::create(['name' => RoleEnums::SUPER_ADMIN->value, 'guard_name' => 'web']);
    session(['recovery_verified' => true]);

    $response = $this->postJson('/api/recovery/create-superadmin', [
        'name' => 'New Superadmin',
        'email' => 'superadmin@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ]);

    $response->assertOk()
        ->assertJson(['success' => true]);

    $this->assertDatabaseHas('users', [
        'email' => 'superadmin@example.com',
        'name' => 'New Superadmin',
    ]);

    $user = User::where('email', 'superadmin@example.com')->first();
    expect($user->hasRole(RoleEnums::SUPER_ADMIN->value))->toBeTrue();
    $this->assertAuthenticatedAs($user);
    expect(session('recovery_verified'))->toBeNull();
});

test('denies superadmin creation without verified session', function () {
    $response = $this->postJson('/api/recovery/create-superadmin', [
        'name' => 'Unauthorized',
        'email' => 'unauth@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ]);

    $response->assertStatus(403);
});
