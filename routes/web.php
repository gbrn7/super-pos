<?php

use App\Http\Controllers\Api\ApiCategoryController;
use App\Http\Controllers\Api\ApiRoleController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ExampleController;
use App\Http\Controllers\RoleController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');



Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    Route::resource('categories', CategoryController::class)->only('index');

    Route::resource('roles', RoleController::class)->only(['index', 'create', 'edit']);

    Route::resource('example', ExampleController::class);

    Route::group(['prefix' => 'api'], function () {
        //categories
        Route::resource('categories', ApiCategoryController::class)->names('apiCategories')->only(['index', 'store', 'show', 'update', 'destroy']);


        Route::group(['prefix' => 'categories'], function () {
            Route::post('/bulk-delete', [ApiCategoryController::class, 'bulkDelete'])->name('apiCategories.bulkDelete');

            Route::get('/download/categoryImportTemplate', [ApiCategoryController::class, 'getCategoryImportTemplater'])->name('apiCategories.getCategoryImportTemplate');

            Route::post('/import-categories', [ApiCategoryController::class, 'importCategoryExcelData'])->name('apiCategories.importStudentExcelData');
        });

        //roles
        Route::resource('roles', ApiRoleController::class)->names('apiRoles')->only(['index', 'store', 'show', 'update', 'destroy']);

        Route::group(['prefix' => 'roles'], function () {
            Route::post('/bulk-delete', [ApiRoleController::class, 'bulkDelete'])->name('apiRoles.bulkDelete');
        });
    });
});

require __DIR__ . '/settings.php';
