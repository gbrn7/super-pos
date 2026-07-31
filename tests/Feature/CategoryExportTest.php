<?php

use App\Exports\CategoryExport;
use App\Models\Category;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use App\Support\Enums\CategoryPermissionEnums;
use App\Support\Enums\RoleEnums;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Maatwebsite\Excel\Facades\Excel;

uses(RefreshDatabase::class);

it('can export categories to excel', function () {
    Excel::fake();

    $role = Role::firstOrCreate(['name' => RoleEnums::SUPER_ADMIN->value]);
    $permission = Permission::firstOrCreate(['name' => CategoryPermissionEnums::READ_CATEGORY->value]);
    $role->givePermissionTo($permission);

    $user = User::factory()->create();
    $user->assignRole($role);

    Category::factory()->count(5)->create();

    $response = $this
        ->actingAs($user)
        ->get(route('apiCategories.exportCategoriesExcelData'));

    $response->assertOk();

    Excel::assertDownloaded('categories-export.xlsx', function (CategoryExport $export) {
        return true;
    });
});
