<?php

namespace App\Http\Controllers;

use App\Models\StoreSetting;
use App\Models\User;
use App\Support\Enums\RoleEnums;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
use Spatie\Permission\Models\Role;

class SetupController extends Controller
{
    public function index(): InertiaResponse
    {
        return Inertia::render('setup/index');
    }

    public function testDatabase(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'db_connection' => 'nullable|string',
            'db_host' => 'nullable|string',
            'db_port' => 'nullable|string',
            'db_database' => 'nullable|string',
            'db_username' => 'nullable|string',
            'db_password' => 'nullable|string',
        ]);

        $connection = $validated['db_connection'] ?? config('database.default', 'pgsql');

        if ($connection !== 'sqlite') {
            $host = $validated['db_host'] ?? config("database.connections.{$connection}.host", '127.0.0.1');
            $port = $validated['db_port'] ?? config("database.connections.{$connection}.port", '5432');
            $database = $validated['db_database'] ?? config("database.connections.{$connection}.database", 'praktis_pos');
            $username = $validated['db_username'] ?? config("database.connections.{$connection}.username", 'postgres');
            $password = $validated['db_password'] ?? config("database.connections.{$connection}.password", 'admin');

            config([
                "database.connections.{$connection}.host" => $host,
                "database.connections.{$connection}.port" => $port,
                "database.connections.{$connection}.database" => $database,
                "database.connections.{$connection}.username" => $username,
                "database.connections.{$connection}.password" => $password,
            ]);
        } else {
            $database = $validated['db_database'] ?? config('database.connections.sqlite.database');

            // Resolve SQLite database path to a user-writable location (e.g. storage_path) if base_path is read-only
            if ($database !== ':memory:' && ! str_starts_with($database, '/')) {
                if (! is_writable(base_path())) {
                    $databasePath = storage_path('app/' . basename($database));
                } else {
                    $databasePath = base_path($database);
                }
            } else {
                $databasePath = $database;
            }

            // Automatically create the SQLite database file and directory if it does not exist
            if ($databasePath !== ':memory:') {
                $dir = dirname($databasePath);
                if (! is_dir($dir)) {
                    @mkdir($dir, 0755, true);
                }
                if (! file_exists($databasePath)) {
                    @touch($databasePath);
                }
            }

            config(['database.connections.sqlite.database' => $databasePath]);
        }

        try {
            config(['database.default' => $connection]);
            DB::purge($connection);
            DB::reconnect($connection);
            DB::connection($connection)->getPdo();

            // Update .env file
            $envPath = base_path('.env');
            if (file_exists($envPath)) {
                $envContent = file_get_contents($envPath);
                $replacements = [
                    'DB_CONNECTION' => $connection,
                ];

                if ($connection !== 'sqlite') {
                    $replacements['DB_HOST'] = $host;
                    $replacements['DB_PORT'] = $port;
                    $replacements['DB_DATABASE'] = $database;
                    $replacements['DB_USERNAME'] = $username;
                    $replacements['DB_PASSWORD'] = $password;
                } else {
                    $replacements['DB_DATABASE'] = $database;
                }

                foreach ($replacements as $key => $val) {
                    if (str_contains($envContent, "{$key}=")) {
                        $envContent = preg_replace("/{$key}=.*/", "{$key}={$val}", $envContent);
                    } else {
                        $envContent .= "\n{$key}={$val}\n";
                    }
                }
                // Only attempt to write .env if it is writable (e.g. not in read-only /opt directory)
                if (is_writable($envPath)) {
                    @file_put_contents($envPath, $envContent);
                }
            }

            return response()->json([
                'success' => true,
                'message' => __('setup.db_success'),
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => __('setup.db_failed', ['error' => $e->getMessage()]),
            ], 500);
        }
    }

    public function runMigration(): JsonResponse
    {
        try {
            $connection = config('database.default', 'sqlite');

            if ($connection === 'sqlite') {
                $database = config('database.connections.sqlite.database');

                if ($database !== ':memory:' && ! str_starts_with($database, '/')) {
                    if (! is_writable(base_path())) {
                        $databasePath = storage_path('app/' . basename($database));
                    } else {
                        $databasePath = base_path($database);
                    }
                } else {
                    $databasePath = $database;
                }

                if ($databasePath !== ':memory:') {
                    $dir = dirname($databasePath);
                    if (! is_dir($dir)) {
                        @mkdir($dir, 0755, true);
                    }
                    if (! file_exists($databasePath)) {
                        @touch($databasePath);
                    }
                }

                config(['database.connections.sqlite.database' => $databasePath]);
                DB::purge('sqlite');
            }

            Artisan::call('migrate', ['--force' => true]);
            Artisan::call('db:seed', ['--force' => true]);

            return response()->json([
                'success' => true,
                'message' => __('setup.migrate_success'),
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => __('setup.migrate_failed', ['error' => $e->getMessage()]),
            ], 500);
        }
    }

    public function complete(Request $request)
    {
        $validated = $request->validate([
            'store_name' => 'required|string|max:255',
            'store_address' => 'nullable|string|max:500',
            'store_phone' => 'nullable|string|max:50',
            'currency' => 'nullable|string|max:10',
            'timezone' => 'nullable|string|max:100',
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        try {
            $connection = config('database.default', 'sqlite');

            if ($connection === 'sqlite') {
                $database = config('database.connections.sqlite.database');

                if ($database !== ':memory:' && ! str_starts_with($database, '/')) {
                    $databasePath = base_path($database);
                    config(['database.connections.sqlite.database' => $databasePath]);
                    DB::purge('sqlite');
                }
            }

            DB::transaction(function () use ($validated) {
                $user = User::create([
                    'name' => $validated['name'],
                    'email' => $validated['email'],
                    'password' => Hash::make($validated['password']),
                ]);

                // Store settings
                StoreSetting::updateOrCreate(
                    ['id' => 1],
                    [
                        'name' => $validated['store_name'],
                        'address' => $validated['store_address'] ?? null,
                        'phone' => $validated['store_phone'] ?? null,
                    ]
                );

                // Ensure superadmin role exists and assign to user
                if (class_exists(Role::class)) {
                    $role = Role::firstOrCreate(['name' => RoleEnums::SUPER_ADMIN->value]);
                    if (method_exists($user, 'assignRole')) {
                        $user->assignRole($role);
                    }
                }

                // Create installed.lock file in storage directory (safe & user-writable, avoids server restart)
                $lockPath = storage_path('app/installed.lock');
                $lockDir = dirname($lockPath);
                if (! is_dir($lockDir)) {
                    @mkdir($lockDir, 0755, true);
                }
                @file_put_contents($lockPath, now()->toDateTimeString());

                // Write APP_INSTALLED=true to .env
                $envPath = base_path('.env');
                if (file_exists($envPath)) {
                    $envContent = file_get_contents($envPath);
                    if (str_contains($envContent, 'APP_INSTALLED=')) {
                        $envContent = preg_replace('/APP_INSTALLED=.*/', 'APP_INSTALLED=true', $envContent);
                    } else {
                        $envContent .= "\nAPP_INSTALLED=true\n";
                    }
                    file_put_contents($envPath, $envContent);
                }

                config(['app.installed' => true]);
            });

            return redirect()->route('login')->with('success', __('setup.complete_success'));
        } catch (Exception $e) {
            return redirect()->back()->withErrors(['general' => $e->getMessage()]);
        }
    }
}
