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
        Route::post('categories/bulk-delete', [ApiCategoryController::class, 'bulkDelete'])->name('apiCategories.bulkDelete');
        Route::resource('categories', ApiCategoryController::class)->names('apiCategories');
    });
});

require __DIR__.'/settings.php';
