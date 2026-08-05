<?php

use App\Models\Role;
use App\Models\User;
use App\Support\Enums\RoleEnums;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->role = Role::create(['name' => RoleEnums::SUPER_ADMIN->value]);
    $this->user = User::factory()->create();
    $this->user->assignRole($this->role);
});

test('authenticated user can access dashboard api without explicit permission', function () {
    $regularUser = User::factory()->create();

    $response = $this->actingAs($regularUser)
        ->getJson(route('apiDashboard.index'));

    $response->assertOk()
        ->assertJsonPath('success', true);
});

test('guest cannot access dashboard api', function () {
    $response = $this->getJson(route('apiDashboard.index'));
    $response->assertUnauthorized();
});

test('authenticated admin user can fetch dashboard api', function () {
    $response = $this->actingAs($this->user)
        ->getJson(route('apiDashboard.index'));

    $response->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonStructure([
            'success',
            'message',
            'data' => [
                'metrics' => [
                    'total_revenue',
                    'total_net_profit',
                    'transactions_count',
                    'products_sold',
                ],
                'trend_chart',
                'top_products',
                'recent_transactions',
                'transactions_by_payment_method',
                'filter' => [
                    'start_date',
                    'end_date',
                ],
            ],
        ]);
});
