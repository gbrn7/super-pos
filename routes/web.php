<?php

use App\Http\Controllers\Api\ApiCapitalWalletController;
use App\Http\Controllers\Api\ApiCategoryController;
use App\Http\Controllers\Api\ApiDashboardController;
use App\Http\Controllers\Api\ApiMasterProductController;
use App\Http\Controllers\Api\ApiPaymentMethodController;
use App\Http\Controllers\Api\ApiProductController;
use App\Http\Controllers\Api\ApiProfitWalletController;
use App\Http\Controllers\Api\ApiReturnController;
use App\Http\Controllers\Api\ApiRoleController;
use App\Http\Controllers\Api\ApiTransactionController;
use App\Http\Controllers\Api\ApiTransactionDetailController;
use App\Http\Controllers\Api\ApiUnitController;
use App\Http\Controllers\Api\ApiUserController;
use App\Http\Controllers\CapitalWalletController;
use App\Http\Controllers\CashierController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ExampleController;
use App\Http\Controllers\MasterProductController;
use App\Http\Controllers\PaymentMethodController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProfitWalletController;
use App\Http\Controllers\ReturnController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\TransactionDetailController;
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

    Route::resource('master-products', MasterProductController::class)->only('index');

    Route::resource('transactions', TransactionController::class)->only('index');

    Route::resource('transaction-details', TransactionDetailController::class)->only('index');

    Route::get('cashier', [CashierController::class, 'index'])->name('cashier.index');

    Route::resource('example', ExampleController::class);

    Route::resource('profit-wallet', ProfitWalletController::class)->only('index');
    Route::resource('capital-wallet', CapitalWalletController::class)->only('index');

    Route::get('/returns', [ReturnController::class, 'index'])->name('returns.index');

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
        Route::group(['prefix' => 'user'], function () {
            Route::get('/all', [ApiUserController::class, 'all'])->name('apiUsers.all');
            Route::post('/bulk-delete', [ApiUserController::class, 'bulkDelete'])->name('apiUsers.bulkDelete');
        });

        Route::resource('user', ApiUserController::class)->names('apiUsers')->only(['index', 'store', 'show', 'update', 'destroy']);

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
            Route::post('/bulk-create', [ApiProductController::class, 'bulkStore'])->name('apiProducts.bulkStore');

            Route::post('/bulk-delete', [ApiProductController::class, 'bulkDelete'])->name('apiProducts.bulkDelete');

            Route::get('/barcode/{barcode}', [ApiProductController::class, 'getByBarcode'])->name('apiProducts.getByBarcode');

            Route::get('/download/import-template', [ApiProductController::class, 'getProductImportTemplate'])->name('apiProducts.getProductImportTemplate');

            Route::get('/download/export-excel', [ApiProductController::class, 'exportProductExcelData'])->name('apiProducts.exportProductsExcelData');

            Route::get('/download/export-pdf', [ApiProductController::class, 'exportProductPdfData'])->name('apiProducts.exportProductsPdfData');

            Route::post('/import', [ApiProductController::class, 'importProductExcelData'])->name('apiProducts.importProductsExcelData');
        });

        // Masterproduct
        Route::resource('master-product', ApiMasterProductController::class)->names('apiMasterProducts')->only(['index', 'store', 'show', 'update', 'destroy']);

        Route::group(['prefix' => 'master-product'], function () {
            Route::post('/bulk-delete', [ApiMasterProductController::class, 'bulkDelete'])->name('apiMasterProducts.bulkDelete');

            Route::get('/barcode/{barcode}', [ApiMasterProductController::class, 'getByBarcode'])->name('apiMasterProducts.getByBarcode');

            Route::get('/download/import-template', [ApiMasterProductController::class, 'getMasterProductImportTemplate'])->name('apiMasterProducts.getMasterProductImportTemplate');

            Route::get('/download/export-excel', [ApiMasterProductController::class, 'exportMasterProductExcelData'])->name('apiMasterProducts.exportMasterProductsExcelData');

            Route::get('/download/export-pdf', [ApiMasterProductController::class, 'exportMasterProductPdfData'])->name('apiMasterProducts.exportMasterProductsPdfData');

            Route::post('/import', [ApiMasterProductController::class, 'importMasterProductExcelData'])->name('apiMasterProducts.importProductsExcelData');
        });

        // transactions
        Route::resource('transactions', ApiTransactionController::class)->names('apiTransactions')->only(['index', 'store', 'show', 'update', 'destroy']);

        Route::group(['prefix' => 'transactions'], function () {
            Route::post('/bulk-delete', [ApiTransactionController::class, 'bulkDelete'])->name('apiTransactions.bulkDelete');
            Route::get('/invoice/{invoiceNumber}', [ApiTransactionController::class, 'getByInvoiceNumber'])->name('apiTransactions.getByInvoiceNumber');
            Route::post('/checkout', [ApiTransactionController::class, 'checkout'])->name('apiTransactions.checkout');
        });

        // transaction-details
        Route::resource('transaction-details', ApiTransactionDetailController::class)->names('apiTransactionDetails')->only(['index', 'store', 'show', 'update', 'destroy']);

        Route::group(['prefix' => 'transaction-details'], function () {
            Route::post('/bulk-delete', [ApiTransactionDetailController::class, 'bulkDelete'])->name('apiTransactionDetails.bulkDelete');
            Route::get('/transaction/{transactionId}', [ApiTransactionDetailController::class, 'getByTransactionId'])->name('apiTransactionDetails.getByTransactionId');
        });

        // profit wallet
        Route::get('/profit-wallet', [ApiProfitWalletController::class, 'index'])->name('apiProfitWallet.index');
        Route::post('/profit-wallet/disburse', [ApiProfitWalletController::class, 'disburse'])->name('apiProfitWallet.disburse');
        Route::post('/profit-wallet/withdraw-capital', [ApiProfitWalletController::class, 'withdrawCapital'])->name('apiProfitWallet.withdrawCapital');

        // capital wallet
        Route::get('/capital-wallet', [ApiCapitalWalletController::class, 'index'])->name('apiCapitalWallet.index');
        Route::post('/capital-wallet/inject', [ApiCapitalWalletController::class, 'inject'])->name('apiCapitalWallet.inject');
        Route::post('/capital-wallet/drawdown', [ApiCapitalWalletController::class, 'drawdown'])->name('apiCapitalWallet.drawdown');
        Route::post('/capital-wallet/purchase-product', [ApiCapitalWalletController::class, 'purchaseProduct'])->name('apiCapitalWallet.purchaseProduct');

        // dashboard api
        Route::get('/dashboard', [ApiDashboardController::class, 'index'])->name('apiDashboard.index');

        // returns api
        Route::get('/returns', [ApiReturnController::class, 'index'])->name('apiReturns.index');
        Route::post('/returns', [ApiReturnController::class, 'store'])->name('apiReturns.store');
    });
});

require __DIR__.'/settings.php';
