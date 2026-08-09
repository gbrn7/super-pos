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
        $connection = 'sqlite';
        $database = 'database/database.sqlite';

        if (! is_writable(base_path())) {
            $databasePath = storage_path('app/database.sqlite');
        } else {
            $databasePath = base_path($database);
        }

        // Automatically create the SQLite database file and directory if it does not exist
        $dir = dirname($databasePath);
        if (! is_dir($dir)) {
            @mkdir($dir, 0755, true);
        }
        if (! file_exists($databasePath)) {
            @touch($databasePath);
        }

        try {
            config([
                'database.default' => 'sqlite',
                'database.connections.sqlite.database' => $databasePath,
            ]);
            DB::purge('sqlite');
            DB::reconnect('sqlite');
            DB::connection('sqlite')->getPdo();

            // Update .env file
            $envPath = base_path('.env');
            if (file_exists($envPath)) {
                $envContent = file_get_contents($envPath);
                $replacements = [
                    'DB_CONNECTION' => 'sqlite',
                    'DB_DATABASE' => $database,
                ];

                foreach ($replacements as $key => $val) {
                    if (str_contains($envContent, "{$key}=")) {
                        $envContent = preg_replace("/{$key}=.*/", "{$key}={$val}", $envContent);
                    } else {
                        $envContent .= "\n{$key}={$val}\n";
                    }
                }
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
            $connection = 'sqlite';
            $database = 'database/database.sqlite';

            if (! is_writable(base_path())) {
                $databasePath = storage_path('app/database.sqlite');
            } else {
                $databasePath = base_path($database);
            }

            $dir = dirname($databasePath);
            if (! is_dir($dir)) {
                @mkdir($dir, 0755, true);
            }
            if (! file_exists($databasePath)) {
                @touch($databasePath);
            }

            config([
                'database.default' => 'sqlite',
                'database.connections.sqlite.database' => $databasePath,
            ]);
            DB::purge('sqlite');
            DB::reconnect('sqlite');

            $lockPath = storage_path('app/installed.lock');
            if (file_exists($lockPath)) {
                @unlink($lockPath);
            }

            Artisan::call('migrate:fresh', ['--force' => true]);
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
            $connection = 'sqlite';
            $database = 'database/database.sqlite';

            if (! is_writable(base_path())) {
                $databasePath = storage_path('app/database.sqlite');
            } else {
                $databasePath = base_path($database);
            }
            config(['database.connections.sqlite.database' => $databasePath]);
            DB::purge('sqlite');

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

                config(['app.installed' => true]);
            });

            return redirect()->route('login')->with('success', __('setup.complete_success'));
        } catch (Exception $e) {
            return redirect()->back()->withErrors(['general' => $e->getMessage()]);
        }
    }

    public function uploadMasterProduct(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls|max:20480',
        ]);

        $file = $request->file('file');
        $originalName = $file->getClientOriginalName();
        $fileSize = number_format($file->getSize() / 1024 / 1024, 2).' MB';

        $tempDir = storage_path('app/temp');
        if (! is_dir($tempDir)) {
            mkdir($tempDir, 0755, true);
        }

        $file->move($tempDir, 'custom_master_products.xlsx');

        return response()->json([
            'success' => true,
            'message' => __('setup.step1.custom_upload_success'),
            'filename' => $originalName,
            'size' => $fileSize,
        ]);
    }

    public function resetMasterProduct(): JsonResponse
    {
        $tempPath = storage_path('app/temp/custom_master_products.xlsx');
        if (file_exists($tempPath)) {
            unlink($tempPath);
        }

        return response()->json([
            'success' => true,
            'message' => __('setup.step1.custom_reset_success'),
        ]);
    }
}
