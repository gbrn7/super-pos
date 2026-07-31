<?php

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use App\Support\Enums\RoleEnums;
use App\Support\Enums\UnitPermissionEnums;
use Illuminate\Http\UploadedFile;

function getUnitUser()
{
    $role = Role::firstOrCreate(['name' => RoleEnums::SUPER_ADMIN->value]);
    $permissions = UnitPermissionEnums::cases();
    foreach ($permissions as $permission) {
        $perm = Permission::firstOrCreate(['name' => $permission->value]);
        $role->givePermissionTo($perm);
    }

    $user = User::factory()->create();
    $user->assignRole($role);

    return $user;
}

test('download unit import template', function () {
    $response = $this
        ->actingAs(getUnitUser())
        ->get(route('apiUnits.getUnitImportTemplate'));

    $response->assertOk();
});

test('import unit excel data success', function () {
    $file = new UploadedFile(
        public_path('template/import-unit-template.xlsx'),
        'import-unit-template.xlsx',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        null,
        true
    );

    $response = $this
        ->actingAs(getUnitUser())
        ->postJson(route('apiUnits.importUnitExcelData'), [
            'file_import' => $file,
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertCreated();
});

test('export unit excel data success', function () {
    $response = $this
        ->actingAs(getUnitUser())
        ->get(route('apiUnits.exportUnitsExcelData'));

    $response->assertOk();
});
