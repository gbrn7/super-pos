<?php

namespace App\Providers;

use App\Repositories\CapitalWalletRepository;
use App\Repositories\CategoryRepository;
use App\Repositories\DashboardRepository;
use App\Repositories\MasterProductRepository;
use App\Repositories\PaymentMethodRepository;
use App\Repositories\ProductRepository;
use App\Repositories\ProfitWalletRepository;
use App\Repositories\ReturnRepository;
use App\Repositories\RoleRepository;
use App\Repositories\TransactionDetailRepository;
use App\Repositories\TransactionRepository;
use App\Repositories\UnitRepository;
use App\Repositories\UserRepository;
use App\Services\CapitalWalletService;
use App\Services\CategoryService;
use App\Services\DashboardService;
use App\Services\MasterProductService;
use App\Services\PaymentMethodService;
use App\Services\ProductService;
use App\Services\ProfitWalletService;
use App\Services\ReturnService;
use App\Services\RoleService;
use App\Services\TransactionDetailService;
use App\Services\TransactionService;
use App\Services\UnitService;
use App\Services\UserService;
use App\Support\Enums\RoleEnums;
use App\Support\Interfaces\Repositories\CapitalWalletRepositoryInterface;
use App\Support\Interfaces\Repositories\CategoryRepositoryInterface;
use App\Support\Interfaces\Repositories\DashboardRepositoryInterface;
use App\Support\Interfaces\Repositories\MasterProductRepositoryInterface;
use App\Support\Interfaces\Repositories\PaymentMethodRepositoryInterface;
use App\Support\Interfaces\Repositories\ProductRepositoryInterface;
use App\Support\Interfaces\Repositories\ProfitWalletRepositoryInterface;
use App\Support\Interfaces\Repositories\ReturnRepositoryInterface;
use App\Support\Interfaces\Repositories\RoleRepositoryInterface;
use App\Support\Interfaces\Repositories\TransactionDetailRepositoryInterface;
use App\Support\Interfaces\Repositories\TransactionRepositoryInterface;
use App\Support\Interfaces\Repositories\UnitRepositoryInterface;
use App\Support\Interfaces\Repositories\UserRepositoryInterface;
use App\Support\Interfaces\Services\CapitalWalletServiceInterface;
use App\Support\Interfaces\Services\CategoryServiceInterface;
use App\Support\Interfaces\Services\DashboardServiceInterface;
use App\Support\Interfaces\Services\MasterProductServiceInterface;
use App\Support\Interfaces\Services\PaymentMethodServiceInterface;
use App\Support\Interfaces\Services\ProductServiceInterface;
use App\Support\Interfaces\Services\ProfitWalletServiceInterface;
use App\Support\Interfaces\Services\ReturnServiceInterface;
use App\Support\Interfaces\Services\RoleServiceInterface;
use App\Support\Interfaces\Services\TransactionDetailServiceInterface;
use App\Support\Interfaces\Services\TransactionServiceInterface;
use App\Support\Interfaces\Services\UnitServiceInterface;
use App\Support\Interfaces\Services\UserServiceInterface;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Category service
        $this->app->bind(CategoryRepositoryInterface::class, CategoryRepository::class);
        $this->app->bind(CategoryServiceInterface::class, CategoryService::class);

        // Role service
        $this->app->bind(RoleRepositoryInterface::class, RoleRepository::class);
        $this->app->bind(RoleServiceInterface::class, RoleService::class);

        // User service
        $this->app->bind(UserRepositoryInterface::class, UserRepository::class);
        $this->app->bind(UserServiceInterface::class, UserService::class);

        // unit service
        $this->app->bind(UnitRepositoryInterface::class, UnitRepository::class);
        $this->app->bind(UnitServiceInterface::class, UnitService::class);

        // Payment method service
        $this->app->bind(PaymentMethodRepositoryInterface::class, PaymentMethodRepository::class);
        $this->app->bind(PaymentMethodServiceInterface::class, PaymentMethodService::class);

        // Product service
        $this->app->bind(ProductRepositoryInterface::class, ProductRepository::class);
        $this->app->bind(ProductServiceInterface::class, ProductService::class);

        // Master Product service
        $this->app->bind(MasterProductRepositoryInterface::class, MasterProductRepository::class);
        $this->app->bind(MasterProductServiceInterface::class, MasterProductService::class);

        // Transaction service
        $this->app->bind(TransactionRepositoryInterface::class, TransactionRepository::class);
        $this->app->bind(TransactionServiceInterface::class, TransactionService::class);

        // Transaction Detail service
        $this->app->bind(TransactionDetailRepositoryInterface::class, TransactionDetailRepository::class);
        $this->app->bind(TransactionDetailServiceInterface::class, TransactionDetailService::class);

        // Profit wallet service repository
        $this->app->bind(ProfitWalletRepositoryInterface::class, ProfitWalletRepository::class);
        $this->app->bind(ProfitWalletServiceInterface::class, ProfitWalletService::class);

        // Capital wallet service repository
        $this->app->bind(CapitalWalletRepositoryInterface::class, CapitalWalletRepository::class);
        $this->app->bind(CapitalWalletServiceInterface::class, CapitalWalletService::class);

        // Dashboard service repository
        $this->app->bind(DashboardRepositoryInterface::class, DashboardRepository::class);
        $this->app->bind(DashboardServiceInterface::class, DashboardService::class);

        // Return service repository
        $this->app->bind(ReturnRepositoryInterface::class, ReturnRepository::class);
        $this->app->bind(ReturnServiceInterface::class, ReturnService::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();

        Gate::before(function ($user, $ability) {
            return $user->hasRole(RoleEnums::SUPER_ADMIN->value) ? true : null;
        });
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(
            fn (): ?Password => app()->isProduction()
                ? Password::min(12)
                    ->mixedCase()
                    ->letters()
                    ->numbers()
                    ->symbols()
                    ->uncompromised()
                : null,
        );
    }
}
