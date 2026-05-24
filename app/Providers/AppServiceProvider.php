<?php

namespace App\Providers;

use App\Repositories\CategoryRepository;
use App\Repositories\RoleRepository;
use App\Repositories\UserRepository;
use App\Services\CategoryService;
use App\Services\RoleService;
use App\Services\UserService;
use App\Support\Enums\RoleEnums;
use App\Support\Interfaces\Repositories\CategoryRepositoryInterface;
use App\Support\Interfaces\Repositories\RoleRepositoryInterface;
use App\Support\Interfaces\Repositories\UserRepositoryInterface;
use App\Support\Interfaces\Services\CategoryServiceInterface;
use App\Support\Interfaces\Services\RoleServiceInterface;
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
        //Category service
        $this->app->bind(CategoryRepositoryInterface::class, CategoryRepository::class);
        $this->app->bind(CategoryServiceInterface::class, CategoryService::class);

        //Role service
        $this->app->bind(RoleRepositoryInterface::class, RoleRepository::class);
        $this->app->bind(RoleServiceInterface::class, RoleService::class);

        //User service
        $this->app->bind(UserRepositoryInterface::class, UserRepository::class);
        $this->app->bind(UserServiceInterface::class, UserService::class);
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
            fn(): ?Password => app()->isProduction()
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
