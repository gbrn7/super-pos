<?php

use App\Models\MasterProduct;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use App\Support\Enums\MasterProductPermissionEnums;
use App\Support\Enums\RoleEnums;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('can get raw export data', function () {
    $role = Role::create(['name' => RoleEnums::SUPER_ADMIN->value]);
    $permission = Permission::create(['name' => MasterProductPermissionEnums::READ_MASTER_PRODUCT->value]);
    $role->givePermissionTo($permission);

    $user = User::factory()->create();
    $user->assignRole($role);

    MasterProduct::factory()->count(3)->create();

    $response = $this
        ->actingAs($user)
        ->getJson(route('apiMasterProducts.getRawExportData'));

    $response->assertOk()
        ->assertJsonStructure([
            'success',
            'message',
            'data' => [
                '*' => [
                    'id',
                    'name',
                    'barcode',
                    'category_name',
                    'unit_name',
                    'stock',
                    'price',
                    'cost_price',
                    'desc',
                    'isAdded',
                    'created_at',
                    'updated_at',
                ],
            ],
        ]);

    expect($response->json('data'))->toHaveCount(3);
});
