<?php

use App\Http\Controllers\Api\ApiCategoryController;
use App\Http\Controllers\Api\ApiPaymentMethodController;
use App\Http\Controllers\Api\ApiProductController;
use App\Http\Controllers\Api\ApiRoleController;
use App\Http\Controllers\Api\ApiUnitController;
use App\Http\Controllers\Api\ApiUserController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ExampleController;
use App\Http\Controllers\PaymentMethodController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UnitController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    Route::resource('categories', CategoryController::class)->only('index');

    Route::resource('roles', RoleController::class)->only(['index', 'create', 'edit', 'show']);

    Route::resource('users', UserController::class)->only('index');

    Route::resource('units', UnitController::class)->only('index');

    Route::resource('payment-methods', PaymentMethodController::class)->only('index');

    Route::resource('products', ProductController::class)->only('index');

    Route::resource('example', ExampleController::class);

    Route::group(['prefix' => 'api'], function () {
        // categories
        Route::resource('categories', ApiCategoryController::class)->names('apiCategories')->only(['index', 'store', 'show', 'update', 'destroy']);

        Route::group(['prefix' => 'categories'], function () {
            Route::post('/bulk-delete', [ApiCategoryController::class, 'bulkDelete'])->name('apiCategories.bulkDelete');

            Route::get('/download/categoryImportTemplate', [ApiCategoryController::class, 'getCategoryImportTemplate'])->name('apiCategories.getCategoryImportTemplate');

            Route::post('/import-categories', [ApiCategoryController::class, 'importCategoryExcelData'])->name('apiCategories.importCategoriesExcelData');
        });

        // roles
        Route::resource('roles', ApiRoleController::class)->names('apiRoles')->only(['index', 'store', 'show', 'update', 'destroy']);

        Route::group(['prefix' => 'roles'], function () {
            Route::post('/bulk-delete', [ApiRoleController::class, 'bulkDelete'])->name('apiRoles.bulkDelete');
        });

        // user
        Route::resource('user', ApiUserController::class)->names('apiUsers')->only(['index', 'store', 'show', 'update', 'destroy']);

        Route::group(['prefix' => 'user'], function () {
            Route::post('/bulk-delete', [ApiUserController::class, 'bulkDelete'])->name('apiUsers.bulkDelete');
        });

        // unit
        Route::resource('unit', ApiUnitController::class)->names('apiUnits')->only(['index', 'store', 'show', 'update', 'destroy']);

        Route::group(['prefix' => 'unit'], function () {
            Route::post('/bulk-delete', [ApiUnitController::class, 'bulkDelete'])->name('apiUnits.bulkDelete');
        });

        // paymentMethod
        Route::resource('paymentMethod', ApiPaymentMethodController::class)->names('apiPaymentMethods')->only(['index', 'store', 'show', 'update', 'destroy']);

        Route::group(['prefix' => 'paymentMethod'], function () {
            Route::post('/bulk-delete', [ApiPaymentMethodController::class, 'bulkDelete'])->name('apiPaymentMethods.bulkDelete');
        });

        // product
        Route::resource('product', ApiProductController::class)->names('apiProducts')->only(['index', 'store', 'show', 'update', 'destroy']);

        Route::group(['prefix' => 'product'], function () {
            Route::post('/bulk-delete', [ApiProductController::class, 'bulkDelete'])->name('apiProducts.bulkDelete');

            Route::get('/download/productImportTemplate', [ApiProductController::class, 'getProductImportTemplate'])->name('apiProducts.getProductImportTemplate');

            Route::get('/download/export-products', [ApiProductController::class, 'exportProductExcelData'])->name('apiProducts.exportProductsExcelData');

            Route::get('/download/export-products-pdf', [ApiProductController::class, 'exportProductPdfData'])->name('apiProducts.exportProductsPdfData');

            Route::post('/import-products', [ApiProductController::class, 'importProductExcelData'])->name('apiProducts.importProductsExcelData');
        });
    });
});

require __DIR__.'/settings.php';
