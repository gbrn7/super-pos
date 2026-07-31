<?php

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use App\Support\Enums\PaymentMethodPermissionEnums;
use App\Support\Enums\RoleEnums;
use Illuminate\Http\UploadedFile;

function getPaymentMethodUser()
{
    $role = Role::firstOrCreate(['name' => RoleEnums::SUPER_ADMIN->value]);
    $permissions = PaymentMethodPermissionEnums::cases();
    foreach ($permissions as $permission) {
        $perm = Permission::firstOrCreate(['name' => $permission->value]);
        $role->givePermissionTo($perm);
    }

    $user = User::factory()->create();
    $user->assignRole($role);

    return $user;
}

test('download payment method import template', function () {
    $response = $this
        ->actingAs(getPaymentMethodUser())
        ->get(route('apiPaymentMethods.getPaymentMethodImportTemplate'));

    $response->assertOk();
});

test('import payment method excel data success', function () {
    $file = new UploadedFile(
        public_path('template/import-payment-method-template.xlsx'),
        'import-payment-method-template.xlsx',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        null,
        true
    );

    $response = $this
        ->actingAs(getPaymentMethodUser())
        ->postJson(route('apiPaymentMethods.importPaymentMethodsExcelData'), [
            'file_import' => $file,
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertCreated();
});

test('export payment method excel data success', function () {
    $response = $this
        ->actingAs(getPaymentMethodUser())
        ->get(route('apiPaymentMethods.exportPaymentMethodsExcelData'));

    $response->assertOk();
});
