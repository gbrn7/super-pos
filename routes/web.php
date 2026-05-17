<?php

use App\Http\Controllers\api\ApiCategoryController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ExampleController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');



Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    Route::resource('categories', CategoryController::class);

    Route::resource('example', ExampleController::class);

    Route::group(['prefix' => 'api'], function () {
        Route::resource('categories', ApiCategoryController::class)->names('apiCategories')->only(['index', 'store', 'update', 'destroy']);


        Route::group(['prefix' => 'categories'], function () {
            Route::post('/bulk-delete', [ApiCategoryController::class, 'bulkDelete'])->name('apiCategories.bulkDelete');

            Route::get('/download/categoryImportTemplate', [ApiCategoryController::class, 'getCategoryImportTemplater'])->name('apiCategories.getCategoryImportTemplate');

            Route::post('/import-categories', [ApiCategoryController::class, 'importCategoryExcelData'])->name('apiCategories.importStudentExcelData');
        });
    });
});

require __DIR__ . '/settings.php';
