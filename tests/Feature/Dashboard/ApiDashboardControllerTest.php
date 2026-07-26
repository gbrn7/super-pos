<?php

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use App\Support\Enums\DashboardPermissionEnums;
use App\Support\Enums\RoleEnums;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->role = Role::create(['name' => RoleEnums::SUPER_ADMIN->value]);
    Permission::create(['name' => DashboardPermissionEnums::READ_DASHBOARD->value]);

    $this->user = User::factory()->create();
    $this->user->assignRole($this->role);
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
                'filter' => [
                    'start_date',
                    'end_date',
                ],
            ],
        ]);
});
