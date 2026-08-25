<?php

use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\SecurityController;
use App\Http\Controllers\Settings\StoreSettingController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::redirect('settings', '/settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/security', [SecurityController::class, 'edit'])->name('security.edit');

    Route::put('settings/password', [SecurityController::class, 'update'])
        ->name('user-password.update');

    Route::inertia('settings/appearance', 'settings/appearance')->name('appearance.edit');
    Route::inertia('settings/language', 'settings/language')->name('language.edit');

    Route::get('settings/store', [StoreSettingController::class, 'edit'])->name('store.edit');
    Route::patch('settings/store', [StoreSettingController::class, 'update'])->name('store.update');

    Route::get('settings/data-management', [\App\Http\Controllers\Settings\DataManagementController::class, 'edit'])->name('data-management.edit');
    Route::post('settings/data-management/purge', [\App\Http\Controllers\Settings\DataManagementController::class, 'purge'])->name('data-management.purge');
});
