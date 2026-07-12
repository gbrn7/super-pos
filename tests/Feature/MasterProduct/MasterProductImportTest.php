<?php

use App\Jobs\ImportMasterProductExcelDataJob;
use App\Models\User;
use App\Support\Enums\MasterProductPermissionEnums;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Queue;
use Spatie\Permission\Models\Permission;

test('import master product dispatches queue job', function () {
    Queue::fake();

    $user = User::factory()->create();
    $user->givePermissionTo(Permission::findOrCreate(MasterProductPermissionEnums::CREATE_MASTER_PRODUCT->value));

    $file = UploadedFile::fake()->create(
        'master-products.xlsx',
        100,
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );

    $response = $this
        ->actingAs($user)
        ->postJson(route('apiMasterProducts.importProductsExcelData'), [
            'file_import' => $file,
        ]);

    $response->assertAccepted();
    Queue::assertPushed(ImportMasterProductExcelDataJob::class);
});
